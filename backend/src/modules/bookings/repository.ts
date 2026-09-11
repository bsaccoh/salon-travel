import { prisma } from '../../config/database';
import { Booking, BookingEvent, Prisma } from '@prisma/client';
import { buildPaginationArgs, paginateResults } from '../../common/pagination';
import { ConflictError } from '../../common/errors';
import { ListBookingsQuery } from './schemas';

export class BookingRepository {
  /**
   * Full booking with all relations — for detail views and API responses.
   */
  async findById(id: string, tx: Prisma.TransactionClient = prisma): Promise<any | null> {
    return tx.booking.findUnique({
      where: { id },
      include: {
        service: true,
        provider: true,
        traveler: {
          select: {
            id: true,
            email: true,
            fullName: true,
            phone: true,
          },
        },
        events: {
          orderBy: { createdAt: 'asc' },
        },
        review: true,
      },
    });
  }

  /**
   * Lightweight booking fetch — only fields needed for state-transition
   * operations (accept, decline, cancel, complete, no-show).
   * Avoids loading the full service/provider/events/review graph.
   */
  async findByIdLite(id: string, tx: Prisma.TransactionClient = prisma) {
    return tx.booking.findUnique({
      where: { id },
      select: {
        id: true,
        status: true,
        version: true,
        travelerId: true,
        providerId: true,
        serviceId: true,
        totalCents: true,
        providerEarningsCents: true,
        scheduledDate: true,
        reference: true,
        traveler: {
          select: { id: true, email: true, fullName: true },
        },
        provider: {
          select: { id: true, businessName: true, email: true },
        },
        service: {
          select: { id: true, name: true },
        },
      },
    });
  }

  async listByTraveler(travelerId: string, query: ListBookingsQuery) {
    const { status, upcoming, past, limit } = query;
    const now = new Date();

    const where: Prisma.BookingWhereInput = {
      travelerId,
      ...(status ? { status } : {}),
      ...(upcoming ? { scheduledDate: { gte: now } } : {}),
      ...(past ? { scheduledDate: { lt: now } } : {}),
    };

    const paginationArgs = buildPaginationArgs(query);

    const items = await prisma.booking.findMany({
      where,
      orderBy: { scheduledDate: 'desc' },
      ...paginationArgs,
      include: {
        service: { select: { id: true, name: true, type: true, images: true } },
        provider: { select: { id: true, businessName: true, category: true, city: true, phone: true } },
      },
    });

    return paginateResults(items, limit);
  }

  async listByProvider(providerId: string, query: ListBookingsQuery) {
    const { status, upcoming, past, limit } = query;
    const now = new Date();

    const where: Prisma.BookingWhereInput = {
      providerId,
      ...(status ? { status } : {}),
      ...(upcoming ? { scheduledDate: { gte: now } } : {}),
      ...(past ? { scheduledDate: { lt: now } } : {}),
    };

    const paginationArgs = buildPaginationArgs(query);

    const items = await prisma.booking.findMany({
      where,
      orderBy: { scheduledDate: 'desc' },
      ...paginationArgs,
      include: {
        service: { select: { id: true, name: true, type: true } },
        traveler: { select: { id: true, fullName: true, phone: true, email: true } },
      },
    });

    return paginateResults(items, limit);
  }

  async listAll(query: ListBookingsQuery) {
    const { status, limit } = query;

    const where: Prisma.BookingWhereInput = {
      ...(status ? { status } : {}),
    };

    const paginationArgs = buildPaginationArgs(query);

    const items = await prisma.booking.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      ...paginationArgs,
      include: {
        service: { select: { id: true, name: true, type: true, priceCents: true } },
        provider: { select: { id: true, businessName: true, category: true, city: true } },
        traveler: { select: { id: true, fullName: true, email: true } },
      },
    });

    return paginateResults(items, limit);
  }

  async create(
    data: Prisma.BookingUncheckedCreateInput,
    tx: Prisma.TransactionClient = prisma,
  ): Promise<Booking> {
    return tx.booking.create({
      data,
    });
  }

  async createEvent(
    data: {
      bookingId: string;
      fromStatus?: string | null;
      toStatus: string;
      actorId?: string | null;
      actorRole?: string | null;
      reason?: string | null;
      metadata?: Prisma.InputJsonValue;
    },
    tx: Prisma.TransactionClient = prisma,
  ): Promise<BookingEvent> {
    return tx.bookingEvent.create({
      data: {
        bookingId: data.bookingId,
        fromStatus: data.fromStatus,
        toStatus: data.toStatus,
        actorId: data.actorId,
        actorRole: data.actorRole,
        reason: data.reason,
        metadata: data.metadata ?? Prisma.JsonNull,
      },
    });
  }

  /**
   * Update booking state with optimistic concurrency check (`version`).
   */
  async updateStatusWithLock(
    bookingId: string,
    currentVersion: number,
    data: Prisma.BookingUpdateInput,
    tx: Prisma.TransactionClient = prisma,
  ): Promise<Booking> {
    const result = await tx.booking.updateMany({
      where: {
        id: bookingId,
        version: currentVersion,
      },
      data: {
        ...data,
        version: { increment: 1 },
      },
    });

    if (result.count === 0) {
      throw new ConflictError(
        'Booking was modified concurrently by another process. Please reload and try again.',
        'VERSION_MISMATCH',
      );
    }

    return tx.booking.findUniqueOrThrow({
      where: { id: bookingId },
    });
  }
}

export const bookingRepository = new BookingRepository();
