import { prisma } from '../../config/database';
import { Service, Prisma } from '@prisma/client';
import { buildPaginationArgs, paginateResults } from '../../common/pagination';
import { ListServicesQuery, CreateServiceInput, UpdateServiceInput } from './schemas';

export class ServiceRepository {
  async findById(id: string, includeDeleted = false): Promise<Service | null> {
    return prisma.service.findFirst({
      where: {
        id,
        ...(includeDeleted ? {} : { deletedAt: null }),
      },
      include: {
        provider: true,
      },
    });
  }

  async listByProvider(
    providerId: string,
    query: ListServicesQuery,
    includeInactive = false,
  ) {
    const { type, isActive, limit } = query;

    const where: Prisma.ServiceWhereInput = {
      providerId,
      deletedAt: null,
      ...(includeInactive
        ? isActive !== undefined
          ? { isActive }
          : {}
        : { isActive: true }),
      ...(type ? { type } : {}),
    };

    const paginationArgs = buildPaginationArgs(query);

    const items = await prisma.service.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      ...paginationArgs,
    });

    return paginateResults(items, limit);
  }

  async listAll(query: ListServicesQuery) {
    const { type, isActive, limit } = query;

    const where: Prisma.ServiceWhereInput = {
      deletedAt: null,
      isActive: isActive !== undefined ? isActive : true,
      ...(type ? { type } : {}),
      provider: {
        status: 'listed',
        deletedAt: null,
      },
    };

    const paginationArgs = buildPaginationArgs(query);

    const items = await prisma.service.findMany({
      where,
      include: {
        provider: {
          select: {
            id: true,
            businessName: true,
            slug: true,
            category: true,
            logoUrl: true,
            coverUrl: true,
            avgRating: true,
            reviewCount: true,
            verificationStatus: true,
            city: true,
            region: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      ...paginationArgs,
    });

    return paginateResults(items, limit);
  }

  async create(data: CreateServiceInput & { providerId: string }): Promise<Service> {
    return prisma.service.create({
      data: {
        providerId: data.providerId,
        name: data.name,
        type: data.type,
        description: data.description,
        shortDescription: data.shortDescription,
        priceCents: data.priceCents,
        currency: data.currency || 'SLL',
        durationMinutes: data.durationMinutes,
        maxCapacity: data.maxCapacity,
        commissionRate: data.commissionRate,
        images: data.images,
        inclusions: data.inclusions,
        exclusions: data.exclusions,
        isActive: data.isActive,
      },
    });
  }

  async update(id: string, data: UpdateServiceInput): Promise<Service> {
    return prisma.service.update({
      where: { id },
      data: {
        ...(data.name !== undefined ? { name: data.name } : {}),
        ...(data.type !== undefined ? { type: data.type } : {}),
        ...(data.description !== undefined ? { description: data.description } : {}),
        ...(data.shortDescription !== undefined ? { shortDescription: data.shortDescription } : {}),
        ...(data.priceCents !== undefined ? { priceCents: data.priceCents } : {}),
        ...(data.currency !== undefined ? { currency: data.currency } : {}),
        ...(data.durationMinutes !== undefined ? { durationMinutes: data.durationMinutes } : {}),
        ...(data.maxCapacity !== undefined ? { maxCapacity: data.maxCapacity } : {}),
        ...(data.commissionRate !== undefined ? { commissionRate: data.commissionRate } : {}),
        ...(data.images !== undefined ? { images: data.images } : {}),
        ...(data.inclusions !== undefined ? { inclusions: data.inclusions } : {}),
        ...(data.exclusions !== undefined ? { exclusions: data.exclusions } : {}),
        ...(data.isActive !== undefined ? { isActive: data.isActive } : {}),
      },
    });
  }

  async softDelete(id: string): Promise<Service> {
    return prisma.service.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        isActive: false,
      },
    });
  }
}

export const serviceRepository = new ServiceRepository();
