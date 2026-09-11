import { prisma } from '../../config/database';
import { Refund, RefundStatus, Prisma } from '@prisma/client';
import { buildPaginationArgs, paginateResults } from '../../common/pagination';
import { ListRefundsQuery } from './schemas';

export class RefundRepository {
  async findById(id: string, tx: Prisma.TransactionClient = prisma): Promise<Refund | null> {
    return tx.refund.findUnique({
      where: { id },
      include: {
        booking: {
          include: {
            traveler: true,
            provider: true,
          },
        },
      },
    });
  }

  async findByBookingId(bookingId: string): Promise<Refund[]> {
    return prisma.refund.findMany({
      where: { bookingId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getSuccessfulRefundsTotal(bookingId: string, tx: Prisma.TransactionClient = prisma): Promise<number> {
    const aggregate = await tx.refund.aggregate({
      where: {
        bookingId,
        status: RefundStatus.succeeded,
      },
      _sum: {
        amountCents: true,
      },
    });

    return aggregate._sum.amountCents || 0;
  }

  async create(
    data: Prisma.RefundUncheckedCreateInput,
    tx: Prisma.TransactionClient = prisma,
  ): Promise<Refund> {
    return tx.refund.create({
      data,
    });
  }

  async updateStatus(
    id: string,
    data: {
      status: RefundStatus;
      stripeRefundId?: string;
      processedAt?: Date | null;
    },
    tx: Prisma.TransactionClient = prisma,
  ): Promise<Refund> {
    return tx.refund.update({
      where: { id },
      data: {
        status: data.status,
        ...(data.stripeRefundId ? { stripeRefundId: data.stripeRefundId } : {}),
        ...(data.processedAt !== undefined ? { processedAt: data.processedAt } : {}),
        version: { increment: 1 },
      },
    });
  }

  async list(query: ListRefundsQuery) {
    const { status, bookingId, limit } = query;

    const where: Prisma.RefundWhereInput = {
      ...(status ? { status } : {}),
      ...(bookingId ? { bookingId } : {}),
    };

    const paginationArgs = buildPaginationArgs(query);

    const items = await prisma.refund.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      ...paginationArgs,
      include: {
        booking: {
          select: {
            id: true,
            traveler: { select: { id: true, fullName: true, email: true } },
            provider: { select: { id: true, businessName: true } },
          },
        },
      },
    });

    return paginateResults(items, limit);
  }
}

export const refundRepository = new RefundRepository();
