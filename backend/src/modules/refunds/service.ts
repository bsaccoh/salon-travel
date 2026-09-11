import { PaymentStatus, Refund, RefundReason, RefundStatus, UserRole } from '@prisma/client';
import { prisma } from '../../config/database';
import { refundRepository, RefundRepository } from './repository';
import { paymentRepository, PaymentRepository } from '../payments/repository';
import { stripePaymentProvider } from '../../integrations/stripe/stripe-payment.provider';
import { PaymentProvider } from '../../integrations/stripe/stripe.types';
import { AuthorizationError, ConflictError, NotFoundError, ValidationError } from '../../common/errors';
import { auditService, AuditContext } from '../audit';
import { getQueue, QUEUE_NAMES } from '../../jobs/queues';
import { CreateRefundInput, ListRefundsQuery } from './schemas';
import { createModuleLogger } from '../../config/logger';

const log = createModuleLogger('refund-service');

export const ADMIN_REFUND_THRESHOLD_CENTS = 50000; // $500.00

export class RefundService {
  constructor(
    private readonly repo: RefundRepository = refundRepository,
    private readonly paymentRepo: PaymentRepository = paymentRepository,
    private readonly stripe: PaymentProvider = stripePaymentProvider,
  ) {}

  async createRefund(
    paymentId: string,
    actorId: string,
    actorRole: UserRole,
    input: CreateRefundInput,
    context: AuditContext,
  ): Promise<Refund> {
    // 1. Authorization Guard
    if (actorRole !== UserRole.admin && actorRole !== UserRole.concierge) {
      throw new AuthorizationError('Only concierge staff or administrators may initiate refunds');
    }

    // Other/discretionary refunds or high-value refunds (> $500) require Admin countersignature
    if (
      (input.reason === RefundReason.other || input.amountCents > ADMIN_REFUND_THRESHOLD_CENTS) &&
      actorRole !== UserRole.admin
    ) {
      throw new AuthorizationError(
        'Discretionary refunds and refunds exceeding $500.00 require administrator authorization',
      );
    }

    // 2. Load Payment and validate state
    const payment = await this.paymentRepo.findById(paymentId);
    if (!payment) {
      throw new NotFoundError('Payment', paymentId);
    }

    if (payment.status !== PaymentStatus.succeeded) {
      throw new ConflictError(
        `Refund cannot be issued for payment in '${payment.status}' status. Payment must be 'succeeded'.`,
        'INVALID_PAYMENT_STATE',
      );
    }

    if (!payment.stripePaymentIntentId) {
      throw new ValidationError('Payment does not have an associated Stripe PaymentIntent ID');
    }

    // 3. Check Refundable Balance (sum of successful refunds)
    const alreadyRefundedCents = await this.repo.getSuccessfulRefundsTotal(payment.bookingId);
    const remainingRefundableCents = payment.amountCents - alreadyRefundedCents;

    if (input.amountCents > remainingRefundableCents) {
      throw new ValidationError(
        `Requested refund amount (${input.amountCents} cents) exceeds the remaining refundable balance of ${remainingRefundableCents} cents`,
      );
    }

    // 4. Create Stripe Refund via Provider
    const stripeRefund = await this.stripe.createRefund({
      paymentIntentId: payment.stripePaymentIntentId,
      amountCents: input.amountCents,
      reason: input.reason === RefundReason.duplicate ? 'duplicate' : 'requested_by_customer',
      metadata: {
        bookingId: payment.bookingId,
        initiatedBy: actorId,
      },
    });

    // 5. Atomic Local Refund Creation
    const refund = await prisma.$transaction(async (tx) => {
      const r = await this.repo.create(
        {
          bookingId: payment.bookingId,
          stripeRefundId: stripeRefund.refundId,
          reason: input.reason,
          status: RefundStatus.pending,
          amountCents: input.amountCents,
          currency: payment.currency,
          initiatedBy: actorId,
          notes: input.notes,
        },
        tx,
      );

      await auditService.logInTransaction(tx, context, {
        action: 'REFUND_REQUESTED',
        resource: 'refund',
        resourceId: r.id,
        metadata: {
          bookingId: payment.bookingId,
          amountCents: input.amountCents,
          reason: input.reason,
          stripeRefundId: stripeRefund.refundId,
          initiatedBy: actorId,
        },
      });

      return r;
    });

    // 6. Enqueue Refund Notification Job
    try {
      if ((payment as any).booking?.traveler?.email) {
        const notificationQueue = getQueue(QUEUE_NAMES.NOTIFICATIONS);
        await notificationQueue.add(
          'refund.initiated',
          {
            type: 'email',
            to: (payment as any).booking.traveler.email,
            subject: 'Refund Processing Notification',
            text: `A refund of ${refund.amountCents / 100} ${refund.currency.toUpperCase()} has been submitted for processing.`,
            requestId: context.requestId,
          },
          { jobId: `refund_initiated:${refund.id}` },
        );
      }
    } catch (err) {
      log.error({ err, refundId: refund.id }, 'Failed to enqueue refund notification job');
    }

    return refund;
  }

  async getRefundById(id: string) {
    const refund = await this.repo.findById(id);
    if (!refund) {
      throw new NotFoundError('Refund', id);
    }
    return refund;
  }

  async listRefunds(query: ListRefundsQuery) {
    return this.repo.list(query);
  }
}

export const refundService = new RefundService();
