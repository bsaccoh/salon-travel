import { UserStatus, UserRole, ProviderStatus, PaymentStatus, Prisma } from '@prisma/client';
import { prisma } from '../../config/database';
import { NotFoundError } from '../../common/errors';
import { buildPaginationArgs, paginateResults } from '../../common/pagination';
import { auditService, AuditContext } from '../audit';
import { authRepository } from '../auth/auth.repository';
import { bookingRepository } from '../bookings/repository';
import { ListUsersQuery, UserStatusActionInput, CreateUserInput } from './schemas';
import { authService } from '../auth/auth.service';
import { ListBookingsQuery } from '../bookings/schemas';
import { ListReviewsQuery } from '../reviews/schemas';

export class AdminService {
  async listUsers(query: ListUsersQuery) {
    const { role, status, q, limit } = query;

    const where: Prisma.UserWhereInput = {
      ...(role ? { role } : {}),
      ...(status ? { status } : {}),
      ...(q
        ? {
            OR: [
              { fullName: { contains: q, mode: 'insensitive' } },
              { email: { contains: q, mode: 'insensitive' } },
              { phone: { contains: q, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const paginationArgs = buildPaginationArgs(query);

    const items = await prisma.user.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      ...paginationArgs,
      select: {
        id: true,
        email: true,
        fullName: true,
        phone: true,
        role: true,
        status: true,
        emailVerifiedAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return paginateResults(items, limit);
  }

  async getUserById(id: string) {
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        travelerProfile: true,
        provider: true,
      },
    });

    if (!user) {
      throw new NotFoundError('User', id);
    }

    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      phone: user.phone,
      role: user.role,
      status: user.status,
      locale: user.locale,
      emailVerifiedAt: user.emailVerifiedAt,
      phoneVerifiedAt: user.phoneVerifiedAt,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      travelerProfile: user.travelerProfile,
      provider: user.provider,
    };
  }

  async createUser(input: CreateUserInput) {
    const passwordHash = await authService.hashPassword(input.password);
    const user = await prisma.user.create({
      data: {
        email: input.email,
        fullName: input.fullName,
        passwordHash,
        role: input.role,
        phone: input.phone,
        status: UserStatus.active,
        emailVerifiedAt: new Date(),
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        status: true,
        createdAt: true,
      },
    });
    return user;
  }

  async suspendUser(
    targetUserId: string,
    input: UserStatusActionInput,
    context: AuditContext,
  ) {
    const user = await prisma.user.findUnique({ where: { id: targetUserId } });
    if (!user) {
      throw new NotFoundError('User', targetUserId);
    }

    await prisma.$transaction(async (tx) => {
      // 1. Update user status to suspended
      await tx.user.update({
        where: { id: targetUserId },
        data: { status: UserStatus.suspended },
      });

      // 2. Revoke all active sessions
      await authRepository.revokeAllUserSessions(targetUserId, tx);

      // 3. Log audit event
      await auditService.logInTransaction(tx, context, {
        action: 'USER_SUSPENDED',
        resource: 'user',
        resourceId: targetUserId,
        metadata: { reason: input.reason },
      });
    });
  }

  async reactivateUser(
    targetUserId: string,
    context: AuditContext,
  ) {
    const user = await prisma.user.findUnique({ where: { id: targetUserId } });
    if (!user) {
      throw new NotFoundError('User', targetUserId);
    }

    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: targetUserId },
        data: { status: UserStatus.active },
      });

      await auditService.logInTransaction(tx, context, {
        action: 'USER_REACTIVATED',
        resource: 'user',
        resourceId: targetUserId,
      });
    });
  }

  async listBookings(query: ListBookingsQuery) {
    return bookingRepository.listAll(query);
  }

  async getBookingById(id: string) {
    const booking = await bookingRepository.findById(id);
    if (!booking) {
      throw new NotFoundError('Booking', id);
    }
    return booking;
  }

  async getDashboardStats() {
    const [
      totalTravelers,
      totalProviders,
      approvedProviders,
      pendingProviders,
      totalBookings,
      recentBookings,
      revenueAgg,
      bookingsByStatus,
    ] = await Promise.all([
      prisma.user.count({ where: { role: UserRole.traveler } }),
      prisma.provider.count(),
      prisma.provider.count({ where: { status: ProviderStatus.approved } }),
      prisma.provider.count({ where: { status: ProviderStatus.submitted } }),
      prisma.booking.count(),
      prisma.booking.count({
        where: { createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } },
      }),
      prisma.payment.aggregate({
        where: { status: PaymentStatus.succeeded },
        _sum: { amountCents: true },
      }),
      prisma.booking.groupBy({
        by: ['status'],
        _count: { id: true },
      }),
    ]);

    const grossRevenueCents = revenueAgg._sum?.amountCents || 0;
    const commissionCents = Math.round(grossRevenueCents * 0.15);

    const statusCounts: Record<string, number> = {};
    for (const row of bookingsByStatus) {
      statusCounts[row.status] = row._count.id;
    }

    return {
      totalTravelers,
      totalProviders,
      approvedProviders,
      pendingProviders,
      totalBookings,
      recentBookings,
      grossRevenueCents,
      commissionCents,
      bookingsByStatus: statusCounts,
    };
  }

  async listReviews(query: ListReviewsQuery) {
    const { limit } = query;
    const paginationArgs = buildPaginationArgs(query);

    const items = await prisma.review.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: 'desc' },
      ...paginationArgs,
      include: {
        author: { select: { id: true, fullName: true } },
        provider: { select: { id: true, businessName: true } },
        booking: { select: { id: true } },
      },
    });

    return paginateResults(items, limit);
  }

  async getMonthlyChart(months = 6) {
    const results: { month: string; bookings: number; revenueCents: number }[] = [];
    const now = new Date();

    for (let i = months - 1; i >= 0; i--) {
      const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      const label = start.toLocaleString('en-US', { month: 'short' });

      const [bookingCount, revenueAgg] = await Promise.all([
        prisma.booking.count({
          where: { createdAt: { gte: start, lt: end } },
        }),
        prisma.payment.aggregate({
          where: { status: PaymentStatus.succeeded, createdAt: { gte: start, lt: end } },
          _sum: { amountCents: true },
        }),
      ]);

      results.push({
        month: label,
        bookings: bookingCount,
        revenueCents: revenueAgg._sum?.amountCents || 0,
      });
    }

    return results;
  }

  async getActivityFeed(limit = 20) {
    const events = await prisma.auditLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        actor: { select: { id: true, fullName: true, role: true } },
      },
    });

    return events.map((e) => ({
      id: e.id,
      action: e.action,
      resource: e.resource,
      resourceId: e.resourceId,
      actorName: e.actor?.fullName || 'System',
      actorRole: e.actorRole,
      metadata: e.metadata,
      createdAt: e.createdAt,
    }));
  }

  async getConciergeStats(conciergeId: string) {
    const [
      unclaimedConversations,
      myConversations,
      emergencyConversations,
      todaysBookings,
    ] = await Promise.all([
      prisma.conversation.count({ where: { conciergeId: null, isClosed: false } }),
      prisma.conversation.count({ where: { conciergeId, isClosed: false } }),
      prisma.conversation.count({ where: { isEmergency: true, isClosed: false } }),
      prisma.booking.count({
        where: {
          scheduledDate: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
            lt: new Date(new Date().setHours(23, 59, 59, 999)),
          },
        },
      }),
    ]);

    return {
      unclaimedConversations,
      myConversations,
      openCases: unclaimedConversations + myConversations,
      emergencyConversations,
      todaysBookings,
    };
  }
}

export const adminService = new AdminService();
