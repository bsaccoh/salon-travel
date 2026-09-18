import { Provider, ProviderStatus, UserRole, VerificationStatus } from '@prisma/client';
import { prisma } from '../../config/database';
import { providerRepository, ProviderRepository } from './repository';
import { generateUniqueSlug } from '../../common/utils/slug';
import { parseNearParam, calculateDistanceKm } from '../../common/utils/geo';
import { ConflictError, NotFoundError } from '../../common/errors';
import { ProviderStateMachine } from '../../domain/provider/provider-state-machine';
import { assertVerificationPreconditions } from '../../domain/provider/provider-verification';
import { auditService, AuditContext } from '../audit';
import { CreateProviderInput, UpdateProviderInput, ListProvidersQuery } from './schemas';
import { cache, RedisCache, CACHE_TTL_PROVIDERS, CACHE_TTL_DASHBOARD } from '../../common/cache/redis-cache';

export class ProviderService {
  constructor(private readonly repo: ProviderRepository = providerRepository) {}

  async createProvider(
    userId: string,
    input: CreateProviderInput,
    context: AuditContext,
  ): Promise<Provider> {
    const existing = await this.repo.findByUserId(userId);
    if (existing) {
      throw new ConflictError(
        'User already owns a provider profile',
        'USER_ALREADY_OWNS_PROVIDER',
      );
    }

    const slug = await generateUniqueSlug(input.businessName, (s) => this.repo.isSlugTaken(s));

    const result = await prisma.$transaction(async (tx) => {
      // 1. Create Provider profile
      const provider = await this.repo.create(
        {
          ...input,
          userId,
          slug,
        },
        tx,
      );

      // 2. Upgrade user role to provider if currently traveler
      await tx.user.update({
        where: { id: userId },
        data: { role: UserRole.provider },
      });

      // 3. Log audit event
      await auditService.logInTransaction(
        tx,
        context,
        {
          action: 'PROVIDER_CREATED',
          resource: 'provider',
          resourceId: provider.id,
          metadata: { businessName: provider.businessName, category: provider.category },
        },
      );

      return provider;
    });

    // Invalidate provider caches on creation
    await cache.invalidate('providers:*');

    return result;
  }

  async getOwnProvider(userId: string): Promise<Provider> {
    const provider = await this.repo.findByUserId(userId);
    if (!provider) {
      throw new NotFoundError('Provider profile');
    }
    return provider;
  }

  async updateOwnProvider(
    userId: string,
    input: UpdateProviderInput,
    context: AuditContext,
  ): Promise<Provider> {
    const provider = await this.repo.findByUserId(userId);
    if (!provider) {
      throw new NotFoundError('Provider profile');
    }

    let slug: string | undefined = undefined;
    if (input.businessName && input.businessName !== provider.businessName) {
      slug = await generateUniqueSlug(input.businessName, (s) => this.repo.isSlugTaken(s, provider.id));
    }

    const updated = await this.repo.update(provider.id, {
      ...(input.businessName !== undefined ? { businessName: input.businessName } : {}),
      ...(slug !== undefined ? { slug } : {}),
      ...(input.category !== undefined ? { category: input.category } : {}),
      ...(input.description !== undefined ? { description: input.description } : {}),
      ...(input.phone !== undefined ? { phone: input.phone } : {}),
      ...(input.whatsapp !== undefined ? { whatsapp: input.whatsapp } : {}),
      ...(input.email !== undefined ? { email: input.email } : {}),
      ...(input.website !== undefined ? { website: input.website } : {}),
      ...(input.address !== undefined ? { address: input.address } : {}),
      ...(input.city !== undefined ? { city: input.city } : {}),
      ...(input.region !== undefined ? { region: input.region } : {}),
      ...(input.languages !== undefined ? { languages: input.languages } : {}),
      ...(input.latitude !== undefined ? { latitude: input.latitude } : {}),
      ...(input.longitude !== undefined ? { longitude: input.longitude } : {}),
      ...(input.logoUrl !== undefined ? { logoUrl: input.logoUrl } : {}),
      ...(input.coverUrl !== undefined ? { coverUrl: input.coverUrl } : {}),
    });

    await auditService.log(context, {
      action: 'PROVIDER_UPDATED',
      resource: 'provider',
      resourceId: provider.id,
      metadata: { fields: Object.keys(input) },
    });

    // Invalidate provider caches (list + this provider's slug)
    await cache.invalidate('providers:*');

    return updated;
  }

  async submitForVerification(userId: string, context: AuditContext): Promise<Provider> {
    const provider = await this.repo.findByUserId(userId, undefined, true);
    if (!provider) {
      throw new NotFoundError('Provider profile');
    }

    // documents and services are loaded via includeRelations=true
    const documents = (provider as any)?.documents || [];
    const services = (provider as any)?.services || [];

    // Verify preconditions
    assertVerificationPreconditions(provider, documents, services);

    // Validate state machine transition
    const { nextStatus, nextVerificationStatus } = ProviderStateMachine.transition({
      currentStatus: provider.status,
      targetStatus: ProviderStatus.submitted,
    });

    const updated = await prisma.$transaction(async (tx) => {
      const p = await this.repo.update(
        provider.id,
        {
          status: nextStatus,
          verificationStatus: nextVerificationStatus || VerificationStatus.pending,
        },
        tx,
      );

      await auditService.logInTransaction(tx, context, {
        action: 'PROVIDER_VERIFICATION_SUBMITTED',
        resource: 'provider',
        resourceId: provider.id,
      });

      return p;
    });

    return updated;
  }

  async getDashboardStats(providerId: string) {
    const cacheKey = `providers:dashboard:${providerId}`;

    return cache.getOrSet(cacheKey, CACHE_TTL_DASHBOARD, async () => {
      // Use DB aggregation instead of loading all rows into memory
      const [statusGroups, revenueAgg, ratingAgg, refundAgg] = await Promise.all([
        // Count bookings per status in one query
        prisma.booking.groupBy({
          by: ['status'],
          where: { providerId },
          _count: { id: true },
          _sum: { totalCents: true, commissionCents: true, providerEarningsCents: true },
        }),
        // Confirmed/paid/completed revenue totals
        prisma.booking.aggregate({
          where: {
            providerId,
            status: { in: ['paid', 'confirmed', 'completed'] as any },
          },
          _sum: { totalCents: true, commissionCents: true, providerEarningsCents: true },
        }),
        prisma.review.aggregate({
          where: { providerId, status: 'published', deletedAt: null },
          _avg: { rating: true },
        }),
        prisma.refund.aggregate({
          where: { booking: { providerId }, status: 'succeeded' },
          _sum: { amountCents: true },
        }),
      ]);

      const countByStatus = Object.fromEntries(
        statusGroups.map((g) => [g.status, g._count.id]),
      );

      const pendingRequests = countByStatus['pending'] ?? 0;
      const upcomingBookings = (countByStatus['confirmed'] ?? 0) + (countByStatus['paid'] ?? 0);
      const completedBookings = countByStatus['completed'] ?? 0;
      const grossBookingValue = revenueAgg._sum.totalCents ?? 0;
      const providerEarnings = revenueAgg._sum.providerEarningsCents ?? 0;
      const commission = revenueAgg._sum.commissionCents ?? 0;

      const averageRating = ratingAgg._avg.rating ?? null;
      const refundAdjustments = refundAgg._sum.amountCents ?? 0;

      return {
        pendingRequests,
        upcomingBookings,
        completedBookings,
        grossBookingValue,
        providerEarnings,
        commission,
        averageRating,
        netEarnings: providerEarnings - refundAdjustments,
        refundAdjustments,
      };
    });
  }

  async listPublic(query: ListProvidersQuery) {
    const nearFilter = parseNearParam(query.near);

    // Cache public list queries
    const cacheKey = `providers:list:${RedisCache.hashQuery(query as unknown as Record<string, unknown>)}`;
    const result = await cache.getOrSet(cacheKey, CACHE_TTL_PROVIDERS, () =>
      this.repo.list(query, true),
    );

    if (nearFilter) {
      const filtered = result.data.filter((p) => {
        if (p.latitude === null || p.longitude === null) return false;
        const dist = calculateDistanceKm(
          nearFilter.latitude,
          nearFilter.longitude,
          p.latitude,
          p.longitude,
        );
        return dist <= nearFilter.radiusKm;
      });

      return {
        data: filtered,
        pagination: result.pagination,
      };
    }

    return result;
  }

  async getPublicBySlug(slug: string) {
    const cacheKey = `providers:slug:${slug}`;
    const provider = await cache.getOrSet(cacheKey, CACHE_TTL_PROVIDERS, () =>
      this.repo.findBySlug(slug, true),
    );
    if (!provider) {
      throw new NotFoundError('Provider', slug);
    }
    return provider;
  }

  // ── Admin Operations ───────────────────────────────────

  async listAdmin(query: ListProvidersQuery) {
    return this.repo.list(query, false);
  }

  async getAdminById(id: string) {
    const provider = await this.repo.findById(id, undefined, true);
    if (!provider) {
      throw new NotFoundError('Provider', id);
    }
    return provider;
  }

  async reviewProvider(id: string, context: AuditContext): Promise<Provider> {
    const provider = await this.repo.findById(id);
    if (!provider) throw new NotFoundError('Provider', id);

    const { nextStatus } = ProviderStateMachine.transition({
      currentStatus: provider.status,
      targetStatus: ProviderStatus.under_review,
    });

    return prisma.$transaction(async (tx) => {
      const updated = await this.repo.update(id, { status: nextStatus }, tx);
      await auditService.logInTransaction(tx, context, {
        action: 'PROVIDER_REVIEW_STARTED',
        resource: 'provider',
        resourceId: id,
      });
      await cache.invalidate('providers:*');
      return updated;
    });
  }

  async approveProvider(id: string, context: AuditContext): Promise<Provider> {
    const provider = await this.repo.findById(id);
    if (!provider) throw new NotFoundError('Provider', id);

    const { nextVerificationStatus } = ProviderStateMachine.transition({
      currentStatus: provider.status,
      targetStatus: ProviderStatus.approved,
    });

    return prisma.$transaction(async (tx) => {
      // Approve and automatically list
      const updated = await this.repo.update(
        id,
        {
          status: ProviderStatus.listed,
          verificationStatus: nextVerificationStatus || VerificationStatus.verified,
          verifiedAt: new Date(),
          verifiedBy: context.actorId,
        },
        tx,
      );

      await auditService.logInTransaction(tx, context, {
        action: 'PROVIDER_APPROVED',
        resource: 'provider',
        resourceId: id,
        metadata: { approvedBy: context.actorId },
      });

      return updated;
    });
  }

  async requestChanges(id: string, reason: string | undefined, context: AuditContext): Promise<Provider> {
    const provider = await this.repo.findById(id);
    if (!provider) throw new NotFoundError('Provider', id);

    const { nextStatus } = ProviderStateMachine.transition({
      currentStatus: provider.status,
      targetStatus: ProviderStatus.changes_requested,
      reason,
    });

    return prisma.$transaction(async (tx) => {
      const updated = await this.repo.update(
        id,
        {
          status: nextStatus,
          verificationStatus: VerificationStatus.pending,
        },
        tx,
      );

      await auditService.logInTransaction(tx, context, {
        action: 'PROVIDER_CHANGES_REQUESTED',
        resource: 'provider',
        resourceId: id,
        metadata: { reason },
      });

      return updated;
    });
  }

  async rejectProvider(id: string, reason: string | undefined, context: AuditContext): Promise<Provider> {
    const provider = await this.repo.findById(id);
    if (!provider) throw new NotFoundError('Provider', id);

    const { nextStatus, nextVerificationStatus } = ProviderStateMachine.transition({
      currentStatus: provider.status,
      targetStatus: ProviderStatus.rejected,
      reason,
    });

    return prisma.$transaction(async (tx) => {
      const updated = await this.repo.update(
        id,
        {
          status: nextStatus,
          verificationStatus: nextVerificationStatus || VerificationStatus.rejected,
        },
        tx,
      );

      await auditService.logInTransaction(tx, context, {
        action: 'PROVIDER_REJECTED',
        resource: 'provider',
        resourceId: id,
        metadata: { reason },
      });

      return updated;
    });
  }

  async suspendProvider(id: string, reason: string | undefined, context: AuditContext): Promise<Provider> {
    const provider = await this.repo.findById(id);
    if (!provider) throw new NotFoundError('Provider', id);

    const { nextStatus } = ProviderStateMachine.transition({
      currentStatus: provider.status,
      targetStatus: ProviderStatus.suspended,
      reason,
    });

    return prisma.$transaction(async (tx) => {
      const updated = await this.repo.update(id, { status: nextStatus }, tx);

      await auditService.logInTransaction(tx, context, {
        action: 'PROVIDER_SUSPENDED',
        resource: 'provider',
        resourceId: id,
        metadata: { reason },
      });

      return updated;
    });
  }

  async reinstateProvider(id: string, context: AuditContext): Promise<Provider> {
    const provider = await this.repo.findById(id);
    if (!provider) throw new NotFoundError('Provider', id);

    const { nextStatus } = ProviderStateMachine.transition({
      currentStatus: provider.status,
      targetStatus: ProviderStatus.listed,
    });

    return prisma.$transaction(async (tx) => {
      const updated = await this.repo.update(id, { status: nextStatus }, tx);

      await auditService.logInTransaction(tx, context, {
        action: 'PROVIDER_REINSTATED',
        resource: 'provider',
        resourceId: id,
      });

      return updated;
    });
  }
}

export const providerService = new ProviderService();
