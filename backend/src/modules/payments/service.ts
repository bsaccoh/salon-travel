import { BookingStatus, PaymentStatus, Prisma } from '@prisma/client';
import { prisma } from '../../config/database';
import { paymentRepository, PaymentRepository } from './repository';
import { bookingRepository, BookingRepository } from '../bookings/repository';
import { providerRepository, ProviderRepository } from '../providers/repository';
import { stripePaymentProvider } from '../../integrations/stripe/stripe-payment.provider';
import { PaymentProvider } from '../../integrations/stripe/stripe.types';
import { StripeWebhookVerifier } from '../../integrations/stripe/stripe-webhook.service';
import { BookingStateMachine } from '../../domain/booking/booking-state-machine';
import { ConflictError, NotFoundError, ValidationError } from '../../common/errors';
import { auditService, AuditContext } from '../audit';
import { getQueue, QUEUE_NAMES } from '../../jobs/queues';
import { CreatePaymentIntentInput, ListPaymentsQuery } from './schemas';
import { createModuleLogger } from '../../config/logger';

const log = createModuleLogger('payment-service');

export interface PaymentIntentResponse {
  paymentId: string;
  bookingId: string;
  clientSecret: string;
  status: string;
  amountCents: number;
  currency: string;
}

export class PaymentService {
  constructor(
    private readonly repo: PaymentRepository = paymentRepository,
    private readonly bookingRepo: BookingRepository = bookingRepository,
    private readonly providerRepo: ProviderRepository = providerRepository,
    private readonly stripe: PaymentProvider = stripePaymentProvider,
  ) {}

  async createPaymentIntent(
    travelerId: string,
    input: CreatePaymentIntentInput,
    idempotencyKey: string | undefined,
    context: AuditContext,
  ): Promise<PaymentIntentResponse> {
    const { bookingId } = input;

    // 1. Load and validate booking
    const booking = await this.bookingRepo.findById(bookingId);
    if (!booking) {
      throw new NotFoundError('Booking', bookingId);
    }

    if (booking.travelerId !== travelerId) {
      throw new NotFoundError('Booking', bookingId);
    }

    // 2. State eligibility check
    if (booking.status !== BookingStatus.accepted && booking.status !== BookingStatus.awaiting_payment) {
      throw new ConflictError(
        `Booking in '${booking.status}' status is not eligible for payment. It must be in 'accepted' or 'awaiting_payment' status.`,
        'INVALID_PAYMENT_STATE',
      );
    }

    // 3. Check provider status
    const provider = await this.providerRepo.findById(booking.providerId);
    if (!provider || provider.deletedAt || provider.status === 'suspended') {
      throw new ConflictError('The service provider is no longer active', 'PROVIDER_UNAVAILABLE');
    }

    // 4. Check existing successful payment
    const existingPayment = await this.repo.findByBookingId(bookingId);
    if (existingPayment && existingPayment.status === PaymentStatus.succeeded) {
      throw new ConflictError('This booking has already been paid for', 'BOOKING_ALREADY_PAID');
    }

    // 5. Server price & currency authoritative check
    const amountCents = booking.totalCents;
    const currency = (booking.currency || 'SLL').toLowerCase();

    if (amountCents <= 0) {
      throw new ValidationError('Invalid booking amount');
    }

    // 6. Create Stripe PaymentIntent via Provider
    const intent = await this.stripe.createPaymentIntent(
      {
        amountCents,
        currency,
        bookingId: booking.id,
        travelerId: booking.travelerId,
        providerId: booking.providerId,
        metadata: {
          guestCount: String(booking.guestCount),
        },
      },
      idempotencyKey,
    );

    // 7. Atomic Local Payment Record & Booking State Transition
    const payment = await prisma.$transaction(async (tx) => {
      let p;
      if (existingPayment && existingPayment.status !== PaymentStatus.succeeded) {
        p = await this.repo.updateStatus(
          existingPayment.id,
          {
            status: PaymentStatus.requires_payment_method,
            stripePaymentIntentId: intent.paymentIntentId,
            metadata: { clientSecret: intent.clientSecret },
          },
          tx,
        );
      } else {
        p = await this.repo.create(
          {
            bookingId: booking.id,
            stripePaymentIntentId: intent.paymentIntentId,
            status: PaymentStatus.requires_payment_method,
            amountCents,
            currency,
            metadata: { clientSecret: intent.clientSecret },
          },
          tx,
        );
      }

      // Transition booking from accepted -> awaiting_payment if necessary
      if (booking.status === BookingStatus.accepted) {
        await this.bookingRepo.updateStatusWithLock(
          booking.id,
          booking.version,
          { status: BookingStatus.awaiting_payment },
          tx,
        );

        await this.bookingRepo.createEvent(
          {
            bookingId: booking.id,
            fromStatus: BookingStatus.accepted,
            toStatus: BookingStatus.awaiting_payment,
            actorId: travelerId,
            actorRole: 'traveler',
            reason: 'Payment intent generated by traveler',
          },
          tx,
        );
      }

      await auditService.logInTransaction(tx, context, {
        action: 'PAYMENT_INTENT_CREATED',
        resource: 'payment',
        resourceId: p.id,
        metadata: {
          bookingId: booking.id,
          stripePaymentIntentId: intent.paymentIntentId,
          amountCents,
        },
      });

      return p;
    });

    return {
      paymentId: payment.id,
      bookingId: booking.id,
      clientSecret: intent.clientSecret,
      status: intent.status,
      amountCents,
      currency,
    };
  }

  async handleWebhookEvent(
    rawBody: string | Buffer,
    signature: string | string[] | undefined,
    context: AuditContext,
  ): Promise<{ received: boolean; duplicate?: boolean }> {
    // 1. Cryptographic Signature Verification
    const event = StripeWebhookVerifier.constructEvent(rawBody, signature);
    const stripeEventId = event.id;
    const eventType = event.type;

    log.info({ stripeEventId, eventType }, 'Processing Stripe webhook event');

    // 2. Webhook Idempotency Check
    const existingWebhook = await this.repo.findWebhookEvent(stripeEventId);
    if (existingWebhook && existingWebhook.processed) {
      log.info({ stripeEventId }, 'Webhook event already processed — returning 204');
      return { received: true, duplicate: true };
    }

    // 3. Process Event atomically
    await prisma.$transaction(async (tx) => {
      // Record webhook event if not present
      if (!existingWebhook) {
        await this.repo.recordWebhookEvent(
          {
            stripeEventId,
            eventType,
            payload: event as unknown as Prisma.InputJsonValue,
          },
          tx,
        );
      }

      // Handle specific Stripe event types
      switch (eventType) {
        case 'payment_intent.succeeded': {
          const paymentIntent = event.data.object as any;
          const intentId = paymentIntent.id;

          const payment = await this.repo.findByStripeIntentId(intentId, tx);
          if (!payment) {
            log.warn({ intentId }, 'Payment record not found for succeeded PaymentIntent');
            break;
          }

          // Update Payment status to succeeded
          await this.repo.updateStatus(
            payment.id,
            {
              status: PaymentStatus.succeeded,
              paidAt: new Date(),
            },
            tx,
          );

          // Transition Booking: awaiting_payment -> paid -> confirmed
          const booking = await this.bookingRepo.findById(payment.bookingId, tx);
          if (booking && booking.status !== BookingStatus.confirmed) {
            // Validate transition to confirmed
            BookingStateMachine.validateTransition({
              fromStatus: booking.status,
              toStatus: BookingStatus.confirmed,
              actorRole: 'system',
            });

            await this.bookingRepo.updateStatusWithLock(
              booking.id,
              booking.version,
              {
                status: BookingStatus.confirmed,
                confirmedAt: new Date(),
              },
              tx,
            );

            // Record immutable booking events
            await this.bookingRepo.createEvent(
              {
                bookingId: booking.id,
                fromStatus: booking.status,
                toStatus: BookingStatus.confirmed,
                actorId: null,
                actorRole: 'system',
                reason: 'Stripe payment confirmed',
                metadata: { stripePaymentIntentId: intentId, amountCents: payment.amountCents },
              },
              tx,
            );
          }

          await auditService.logInTransaction(tx, context, {
            action: 'PAYMENT_SUCCEEDED',
            resource: 'payment',
            resourceId: payment.id,
            metadata: {
              bookingId: payment.bookingId,
              stripePaymentIntentId: intentId,
              amountCents: payment.amountCents,
            },
          });
          break;
        }

        case 'payment_intent.payment_failed': {
          const paymentIntent = event.data.object as any;
          const intentId = paymentIntent.id;
          const failureReason = paymentIntent.last_payment_error?.message || 'Payment failed';

          const payment = await this.repo.findByStripeIntentId(intentId, tx);
          if (payment) {
            await this.repo.updateStatus(
              payment.id,
              {
                status: PaymentStatus.failed,
                failureReason,
              },
              tx,
            );

            await auditService.logInTransaction(tx, context, {
              action: 'PAYMENT_FAILED',
              resource: 'payment',
              resourceId: payment.id,
              metadata: { failureReason, stripePaymentIntentId: intentId },
            });
          }
          break;
        }

        case 'payment_intent.canceled': {
          const paymentIntent = event.data.object as any;
          const intentId = paymentIntent.id;

          const payment = await this.repo.findByStripeIntentId(intentId, tx);
          if (payment) {
            await this.repo.updateStatus(
              payment.id,
              {
                status: PaymentStatus.cancelled,
              },
              tx,
            );

            await auditService.logInTransaction(tx, context, {
              action: 'PAYMENT_CANCELLED',
              resource: 'payment',
              resourceId: payment.id,
              metadata: { stripePaymentIntentId: intentId },
            });
          }
          break;
        }

        case 'charge.refunded': {
          const charge = event.data.object as any;
          const intentId = charge.payment_intent;

          const payment = await this.repo.findByStripeIntentId(intentId, tx);
          if (payment) {
            // Update refund record if exists
            await tx.refund.updateMany({
              where: { bookingId: payment.bookingId, status: 'pending' },
              data: { status: 'succeeded', processedAt: new Date() },
            });

            await auditService.logInTransaction(tx, context, {
              action: 'REFUND_SUCCEEDED',
              resource: 'payment',
              resourceId: payment.id,
              metadata: { stripePaymentIntentId: intentId },
            });
          }
          break;
        }

        case 'charge.dispute.created': {
          const dispute = event.data.object as any;
          log.error({ disputeId: dispute.id, chargeId: dispute.charge }, 'Stripe dispute created!');

          await auditService.logInTransaction(tx, context, {
            action: 'CHARGE_DISPUTE_CREATED',
            resource: 'payment',
            resourceId: dispute.id,
            metadata: { dispute },
          });
          break;
        }

        default:
          log.info({ eventType }, 'Unhandled Stripe event type safely acknowledged');
          break;
      }

      // Mark webhook processed
      await this.repo.markWebhookProcessed(stripeEventId, tx);
    });

    // 4. Post-Commit Asynchronous Jobs
    if (eventType === 'payment_intent.succeeded') {
      try {
        const paymentIntent = event.data.object as any;
        const payment = await this.repo.findByStripeIntentId(paymentIntent.id);
        if (payment && (payment as any).booking) {
          const booking = (payment as any).booking;
          const notificationQueue = getQueue(QUEUE_NAMES.NOTIFICATIONS);

          // Enqueue traveler payment confirmation & receipt
          await notificationQueue.add(
            'payment.receipt',
            {
              type: 'email',
              to: booking.traveler.email,
              subject: `Booking Confirmed & Payment Receipt #${booking.id.slice(0, 8)}`,
              text: `Thank you for your payment of ${payment.amountCents / 100} ${payment.currency.toUpperCase()} for ${booking.service.name}. Your booking is officially confirmed!`,
              requestId: context.requestId,
            },
            { jobId: `receipt:${payment.id}` },
          );

          // Enqueue provider confirmation notification
          if (booking.provider?.email) {
            await notificationQueue.add(
              'booking.payment_confirmed_provider',
              {
                type: 'email',
                to: booking.provider.email,
                subject: `Payment Received for Booking #${booking.id.slice(0, 8)}`,
                text: `Payment of ${booking.providerEarningsCents / 100} ${booking.currency} has been secured for ${booking.service.name}.`,
                requestId: context.requestId,
              },
              { jobId: `notify_provider_paid:${booking.id}` },
            );
          }
        }
      } catch (err) {
        log.error({ err }, 'Failed to enqueue post-payment notification jobs');
      }
    }

    return { received: true };
  }

  async getPaymentById(id: string) {
    const payment = await this.repo.findById(id);
    if (!payment) {
      throw new NotFoundError('Payment', id);
    }
    return payment;
  }

  async listPayments(query: ListPaymentsQuery) {
    return this.repo.list(query);
  }

  async reconcilePayments(): Promise<{ reconciledCount: number }> {
    const cutoff = new Date(Date.now() - 60 * 60 * 1000); // older than 1 hour
    const unresolved = await this.repo.findUnresolvedPayments(cutoff);

    let reconciledCount = 0;

    for (const payment of unresolved) {
      if (!payment.stripePaymentIntentId) continue;

      try {
        const intent = await this.stripe.retrievePaymentIntent(payment.stripePaymentIntentId);

        if (intent.status === 'succeeded' && payment.status !== PaymentStatus.succeeded) {
          log.info({ paymentId: payment.id }, 'Reconciling succeeded payment with Stripe');
          await prisma.$transaction(async (tx) => {
            await this.repo.updateStatus(payment.id, { status: PaymentStatus.succeeded, paidAt: new Date() }, tx);
            const booking = await this.bookingRepo.findById(payment.bookingId, tx);
            if (booking && booking.status !== BookingStatus.confirmed) {
              await this.bookingRepo.updateStatusWithLock(booking.id, booking.version, { status: BookingStatus.confirmed }, tx);
            }
          });
          reconciledCount++;
        }
      } catch (err) {
        log.error({ err, paymentId: payment.id }, 'Reconciliation check failed for payment');
      }
    }

    return { reconciledCount };
  }
}

export const paymentService = new PaymentService();
