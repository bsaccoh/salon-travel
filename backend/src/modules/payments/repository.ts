import { prisma } from '../../config/database';
import { Payment, PaymentStatus, Prisma, WebhookEvent } from '@prisma/client';
import { buildPaginationArgs, paginateResults } from '../../common/pagination';
import { ListPaymentsQuery } from './schemas';

export class PaymentRepository {
  async findById(id: string, tx: Prisma.TransactionClient = prisma): Promise<Payment | null> {
    return tx.payment.findUnique({
      where: { id },
      include: {
        booking: {
          include: {
            traveler: true,
            provider: true,
            service: true,
          },
        },
      },
    });
  }

  async findByBookingId(bookingId: string, tx: Prisma.TransactionClient = prisma): Promise<Payment | null> {
    return tx.payment.findFirst({
      where: { bookingId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByStripeIntentId(
    stripePaymentIntentId: string,
    tx: Prisma.TransactionClient = prisma,
  ): Promise<Payment | null> {
    return tx.payment.findUnique({
      where: { stripePaymentIntentId },
      include: {
        booking: {
          include: {
            traveler: true,
            provider: true,
            service: true,
          },
        },
      },
    });
  }

  async create(
    data: Prisma.PaymentUncheckedCreateInput,
    tx: Prisma.TransactionClient = prisma,
  ): Promise<Payment> {
    return tx.payment.create({
      data,
    });
  }

  async updateStatus(
    id: string,
    data: {
      status: PaymentStatus;
      stripePaymentIntentId?: string;
      paidAt?: Date | null;
      failureReason?: string | null;
      metadata?: Prisma.InputJsonValue;
    },
    tx: Prisma.TransactionClient = prisma,
  ): Promise<Payment> {
    return tx.payment.update({
      where: { id },
      data: {
        status: data.status,
        ...(data.stripePaymentIntentId ? { stripePaymentIntentId: data.stripePaymentIntentId } : {}),
        ...(data.paidAt !== undefined ? { paidAt: data.paidAt } : {}),
        ...(data.failureReason !== undefined ? { failureReason: data.failureReason } : {}),
        ...(data.metadata !== undefined ? { metadata: data.metadata ?? Prisma.JsonNull } : {}),
        version: { increment: 1 },
      },
    });
  }

  async list(query: ListPaymentsQuery) {
    const { status, bookingId, limit } = query;

    const where: Prisma.PaymentWhereInput = {
      ...(status ? { status } : {}),
      ...(bookingId ? { bookingId } : {}),
    };

    const paginationArgs = buildPaginationArgs(query);

    const items = await prisma.payment.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      ...paginationArgs,
      include: {
        booking: {
          select: {
            id: true,
            scheduledDate: true,
            traveler: { select: { id: true, fullName: true, email: true } },
            provider: { select: { id: true, businessName: true } },
          },
        },
      },
    });

    return paginateResults(items, limit);
  }

  // ── Webhook Events Tracking (Idempotency) ──────────────

  async findWebhookEvent(stripeEventId: string, tx: Prisma.TransactionClient = prisma): Promise<WebhookEvent | null> {
    return tx.webhookEvent.findUnique({
      where: { stripeEventId },
    });
  }

  async recordWebhookEvent(
    data: {
      stripeEventId: string;
      eventType: string;
      payload: Prisma.InputJsonValue;
    },
    tx: Prisma.TransactionClient = prisma,
  ): Promise<WebhookEvent> {
    return tx.webhookEvent.create({
      data: {
        stripeEventId: data.stripeEventId,
        eventType: data.eventType,
        payload: data.payload,
        processed: false,
      },
    });
  }

  async markWebhookProcessed(
    stripeEventId: string,
    tx: Prisma.TransactionClient = prisma,
  ): Promise<WebhookEvent> {
    return tx.webhookEvent.update({
      where: { stripeEventId },
      data: {
        processed: true,
        processedAt: new Date(),
      },
    });
  }

  async findUnresolvedPayments(cutoffDate: Date): Promise<Payment[]> {
    return prisma.payment.findMany({
      where: {
        status: { in: [PaymentStatus.requires_payment_method, PaymentStatus.processing, PaymentStatus.requires_action] },
        createdAt: { lt: cutoffDate },
      },
      include: {
        booking: true,
      },
      take: 50,
    });
  }
}

export const paymentRepository = new PaymentRepository();
