import { Destination } from '@prisma/client';
import { destinationRepository, DestinationRepository } from './repository';
import { generateUniqueSlug } from '../../common/utils/slug';
import { parseNearParam, calculateDistanceKm } from '../../common/utils/geo';
import { NotFoundError } from '../../common/errors';
import { auditService, AuditContext } from '../audit';
import { CreateDestinationInput, UpdateDestinationInput, ListDestinationsQuery } from './schemas';
import { cache, RedisCache, CACHE_TTL_DESTINATIONS } from '../../common/cache/redis-cache';

export class DestinationService {
  constructor(private readonly repo: DestinationRepository = destinationRepository) {}

  async list(query: ListDestinationsQuery, includeDeleted = false) {
    const nearFilter = parseNearParam(query.near);

    // Cache public (non-admin) list queries
    const cacheKey = includeDeleted
      ? null
      : `destinations:list:${RedisCache.hashQuery(query as unknown as Record<string, unknown>)}`;

    const result = cacheKey
      ? await cache.getOrSet(cacheKey, CACHE_TTL_DESTINATIONS, () =>
          this.repo.list(query, includeDeleted),
        )
      : await this.repo.list(query, includeDeleted);

    if (nearFilter) {
      const filteredData = result.data.filter((dest) => {
        if (dest.latitude === null || dest.longitude === null) return false;
        const dist = calculateDistanceKm(
          nearFilter.latitude,
          nearFilter.longitude,
          dest.latitude,
          dest.longitude,
        );
        return dist <= nearFilter.radiusKm;
      });

      return {
        data: filteredData,
        pagination: result.pagination,
      };
    }

    return result;
  }

  async getBySlug(slug: string, includeDeleted = false): Promise<Destination> {
    // Cache public (non-admin) slug lookups
    if (!includeDeleted) {
      const cacheKey = `destinations:slug:${slug}`;
      const cached = await cache.getOrSet(cacheKey, CACHE_TTL_DESTINATIONS, async () => {
        return this.repo.findBySlug(slug, false);
      });
      if (!cached) {
        throw new NotFoundError('Destination', slug);
      }
      return cached;
    }

    const destination = await this.repo.findBySlug(slug, includeDeleted);
    if (!destination) {
      throw new NotFoundError('Destination', slug);
    }
    return destination;
  }

  async getById(id: string, includeDeleted = false): Promise<Destination> {
    const destination = await this.repo.findById(id, includeDeleted);
    if (!destination) {
      throw new NotFoundError('Destination', id);
    }
    return destination;
  }

  async create(input: CreateDestinationInput, context: AuditContext): Promise<Destination> {
    const slug = await generateUniqueSlug(input.name, (s) => this.repo.isSlugTaken(s));

    const destination = await this.repo.create({
      ...input,
      slug,
    });

    await auditService.log(context, {
      action: 'DESTINATION_CREATED',
      resource: 'destination',
      resourceId: destination.id,
      metadata: { name: destination.name, slug: destination.slug },
    });

    // Invalidate destination list caches
    await cache.invalidate('destinations:list:*');

    return destination;
  }

  async update(id: string, input: UpdateDestinationInput, context: AuditContext): Promise<Destination> {
    const existing = await this.repo.findById(id);
    if (!existing) {
      throw new NotFoundError('Destination', id);
    }

    let slug: string | undefined = undefined;
    if (input.name && input.name !== existing.name) {
      slug = await generateUniqueSlug(input.name, (s) => this.repo.isSlugTaken(s, id));
    }

    const updated = await this.repo.update(id, {
      ...input,
      slug,
    });

    await auditService.log(context, {
      action: 'DESTINATION_UPDATED',
      resource: 'destination',
      resourceId: updated.id,
      metadata: { fields: Object.keys(input) },
    });

    // Invalidate both list and slug caches
    await cache.invalidate('destinations:*');

    return updated;
  }

  async softDelete(id: string, context: AuditContext): Promise<void> {
    const existing = await this.repo.findById(id);
    if (!existing) {
      throw new NotFoundError('Destination', id);
    }

    await this.repo.softDelete(id);

    await auditService.log(context, {
      action: 'DESTINATION_DELETED',
      resource: 'destination',
      resourceId: id,
    });

    // Invalidate all destination caches
    await cache.invalidate('destinations:*');
  }
}

export const destinationService = new DestinationService();
