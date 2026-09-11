import { Service } from '@prisma/client';
import { serviceRepository, ServiceRepository } from './repository';
import { providerRepository, ProviderRepository } from '../providers/repository';
import { NotFoundError } from '../../common/errors';
import { auditService, AuditContext } from '../audit';
import { CreateServiceInput, UpdateServiceInput, ListServicesQuery } from './schemas';
import { cache, RedisCache, CACHE_TTL_SERVICES } from '../../common/cache/redis-cache';

export class ServicesService {
  constructor(
    private readonly repo: ServiceRepository = serviceRepository,
    private readonly providerRepo: ProviderRepository = providerRepository,
  ) {}

  private async getProviderForUser(userId: string) {
    const provider = await this.providerRepo.findByUserId(userId);
    if (!provider) {
      throw new NotFoundError('Provider profile');
    }
    return provider;
  }

  async createService(
    userId: string,
    input: CreateServiceInput,
    context: AuditContext,
  ): Promise<Service> {
    const provider = await this.getProviderForUser(userId);

    const service = await this.repo.create({
      ...input,
      providerId: provider.id,
    });

    await auditService.log(context, {
      action: 'SERVICE_CREATED',
      resource: 'service',
      resourceId: service.id,
      metadata: { name: service.name, providerId: provider.id, priceCents: service.priceCents },
    });

    // Invalidate services catalog caches
    await cache.invalidate('services:*');
    // Also invalidate provider caches since provider detail includes services
    await cache.invalidate('providers:*');

    return service;
  }

  async getOwnServices(userId: string, query: ListServicesQuery) {
    const provider = await this.getProviderForUser(userId);
    return this.repo.listByProvider(provider.id, query, true);
  }

  async getOwnServiceById(userId: string, serviceId: string): Promise<Service> {
    const provider = await this.getProviderForUser(userId);
    const service = await this.repo.findById(serviceId);

    if (!service || service.providerId !== provider.id) {
      throw new NotFoundError('Service', serviceId);
    }

    return service;
  }

  async updateOwnService(
    userId: string,
    serviceId: string,
    input: UpdateServiceInput,
    context: AuditContext,
  ): Promise<Service> {
    const provider = await this.getProviderForUser(userId);
    const service = await this.repo.findById(serviceId);

    if (!service || service.providerId !== provider.id) {
      throw new NotFoundError('Service', serviceId);
    }

    const updated = await this.repo.update(serviceId, input);

    await auditService.log(context, {
      action: 'SERVICE_UPDATED',
      resource: 'service',
      resourceId: serviceId,
      metadata: { fields: Object.keys(input) },
    });

    // Invalidate services and provider caches
    await cache.invalidate('services:*');
    await cache.invalidate('providers:*');

    return updated;
  }

  async deleteOwnService(
    userId: string,
    serviceId: string,
    context: AuditContext,
  ): Promise<void> {
    const provider = await this.getProviderForUser(userId);
    const service = await this.repo.findById(serviceId);

    if (!service || service.providerId !== provider.id) {
      throw new NotFoundError('Service', serviceId);
    }

    await this.repo.softDelete(serviceId);

    await auditService.log(context, {
      action: 'SERVICE_DELETED',
      resource: 'service',
      resourceId: serviceId,
    });

    // Invalidate services and provider caches
    await cache.invalidate('services:*');
    await cache.invalidate('providers:*');
  }

  async listPublicProviderServices(providerId: string, query: ListServicesQuery) {
    return this.repo.listByProvider(providerId, query, false);
  }

  async getPublicServiceById(serviceId: string): Promise<Service> {
    const service = await this.repo.findById(serviceId);
    if (!service || !service.isActive) {
      throw new NotFoundError('Service', serviceId);
    }
    return service;
  }

  async listPublicAllServices(query: ListServicesQuery) {
    const cacheKey = `services:catalog:${RedisCache.hashQuery(query as unknown as Record<string, unknown>)}`;
    return cache.getOrSet(cacheKey, CACHE_TTL_SERVICES, () =>
      this.repo.listAll(query),
    );
  }
}

export const servicesService = new ServicesService();
