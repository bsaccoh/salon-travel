import { prisma } from '../../config/database';
import { Provider, Prisma, ProviderStatus, VerificationStatus } from '@prisma/client';
import { buildPaginationArgs, paginateResults } from '../../common/pagination';
import { ListProvidersQuery, CreateProviderInput } from './schemas';
import { parseNearParam, calculateBoundingBox, haversineDistanceKm } from '../../common/geo';

export class ProviderRepository {
  async isSlugTaken(slug: string, excludeId?: string): Promise<boolean> {
    const existing = await prisma.provider.findFirst({
      where: {
        slug,
        ...(excludeId ? { id: { not: excludeId } } : {}),
      },
      select: { id: true },
    });
    return existing !== null;
  }

  async findByUserId(
    userId: string,
    tx: Prisma.TransactionClient = prisma,
    includeRelations = false,
  ): Promise<Provider | null> {
    return tx.provider.findUnique({
      where: { userId },
      ...(includeRelations
        ? {
            include: {
              documents: true,
              services: { where: { deletedAt: null } },
            },
          }
        : {}),
    });
  }

  async findBySlug(slug: string, publicOnly = true): Promise<(Provider & { services?: any[]; reviews?: any[] }) | null> {
    return prisma.provider.findFirst({
      where: {
        slug,
        ...(publicOnly ? { status: { in: [ProviderStatus.listed, ProviderStatus.approved] }, deletedAt: null } : {}),
      },
      include: {
        services: {
          where: { isActive: true, deletedAt: null },
          orderBy: { createdAt: 'desc' },
        },
        reviews: {
          where: { status: 'published', deletedAt: null },
          take: 5,
          orderBy: { createdAt: 'desc' },
          include: {
            author: { select: { id: true, fullName: true } },
          },
        },
      },
    });
  }

  async findById(
    id: string,
    tx: Prisma.TransactionClient = prisma,
    includeRelations = false,
  ): Promise<Provider | null> {
    return tx.provider.findUnique({
      where: { id },
      ...(includeRelations
        ? {
            include: {
              documents: true,
              services: { where: { deletedAt: null } },
            },
          }
        : {}),
    });
  }

  async list(query: ListProvidersQuery, publicOnly = true) {
    const { category, verified, status, q, near, sort, limit } = query;
    const nearLoc = parseNearParam(near);

    let geoWhere: Prisma.ProviderWhereInput = {};
    if (nearLoc) {
      const box = calculateBoundingBox(nearLoc.latitude, nearLoc.longitude, nearLoc.radiusKm);
      geoWhere = {
        latitude: { gte: box.minLat, lte: box.maxLat },
        longitude: { gte: box.minLon, lte: box.maxLon },
      };
    }

    const where: Prisma.ProviderWhereInput = {
      ...(publicOnly
        ? { status: { in: [ProviderStatus.listed, ProviderStatus.approved] }, deletedAt: null }
        : {
            ...(status ? { status } : {}),
            deletedAt: null,
          }),
      ...(category ? { category } : {}),
      ...(verified !== undefined
        ? { verificationStatus: verified ? VerificationStatus.verified : { not: VerificationStatus.verified } }
        : {}),
      ...geoWhere,
      ...(q
        ? {
            OR: [
              { businessName: { contains: q, mode: 'insensitive' } },
              { description: { contains: q, mode: 'insensitive' } },
              { city: { contains: q, mode: 'insensitive' } },
              { address: { contains: q, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    let orderBy: Prisma.ProviderOrderByWithRelationInput = { createdAt: 'desc' };
    if (sort === 'rating') orderBy = { avgRating: 'asc' };
    else if (sort === '-rating') orderBy = { avgRating: 'desc' };
    else if (sort === 'created_at') orderBy = { createdAt: 'asc' };
    else if (sort === '-created_at') orderBy = { createdAt: 'desc' };

    const paginationArgs = buildPaginationArgs(query);

    const items = await prisma.provider.findMany({
      where,
      orderBy: nearLoc ? undefined : orderBy,
      ...paginationArgs,
      include: {
        services: {
          where: { isActive: true, deletedAt: null },
          take: 3,
        },
      },
    });

    let processedItems: (Provider & { services: any[]; distanceKm?: number })[] = items;

    if (nearLoc) {
      processedItems = items
        .map((p) => {
          if (p.latitude != null && p.longitude != null) {
            const distanceKm = haversineDistanceKm(
              nearLoc.latitude,
              nearLoc.longitude,
              p.latitude,
              p.longitude,
            );
            return { ...p, distanceKm };
          }
          return { ...p, distanceKm: undefined };
        })
        .filter((p) => p.distanceKm === undefined || p.distanceKm <= nearLoc.radiusKm)
        .sort((a, b) => (a.distanceKm ?? Infinity) - (b.distanceKm ?? Infinity));
    }

    return paginateResults(processedItems, limit);
  }

  async create(
    data: CreateProviderInput & { userId: string; slug: string },
    tx: Prisma.TransactionClient = prisma,
  ): Promise<Provider> {
    return tx.provider.create({
      data: {
        userId: data.userId,
        businessName: data.businessName,
        slug: data.slug,
        category: data.category,
        description: data.description,
        phone: data.phone,
        whatsapp: data.whatsapp,
        email: data.email,
        website: data.website,
        address: data.address,
        city: data.city,
        region: data.region,
        languages: data.languages,
        latitude: data.latitude,
        longitude: data.longitude,
        logoUrl: data.logoUrl,
        coverUrl: data.coverUrl,
      },
    });
  }

  async update(
    id: string,
    data: Prisma.ProviderUpdateInput,
    tx: Prisma.TransactionClient = prisma,
  ): Promise<Provider> {
    return tx.provider.update({
      where: { id },
      data,
    });
  }

  async updateRatingAndCount(
    id: string,
    avgRating: number,
    reviewCount: number,
    tx: Prisma.TransactionClient = prisma,
  ): Promise<Provider> {
    return tx.provider.update({
      where: { id },
      data: { avgRating, reviewCount },
    });
  }
}

export const providerRepository = new ProviderRepository();
