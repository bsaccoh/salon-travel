import { prisma } from '../../config/database';
import { Destination, Prisma } from '@prisma/client';
import { buildPaginationArgs, paginateResults } from '../../common/pagination';
import { ListDestinationsQuery, CreateDestinationInput, UpdateDestinationInput } from './schemas';
import { parseNearParam, calculateBoundingBox, haversineDistanceKm } from '../../common/geo';

export class DestinationRepository {
  async isSlugTaken(slug: string, excludeId?: string): Promise<boolean> {
    const existing = await prisma.destination.findFirst({
      where: {
        slug,
        ...(excludeId ? { id: { not: excludeId } } : {}),
      },
      select: { id: true },
    });
    return existing !== null;
  }

  async findBySlug(slug: string, includeDeleted = false): Promise<Destination | null> {
    return prisma.destination.findFirst({
      where: {
        slug,
        ...(includeDeleted ? {} : { deletedAt: null }),
      },
    });
  }

  async findById(id: string, includeDeleted = false): Promise<Destination | null> {
    return prisma.destination.findFirst({
      where: {
        id,
        ...(includeDeleted ? {} : { deletedAt: null }),
      },
    });
  }

  async list(query: ListDestinationsQuery, includeDeleted = false) {
    const { category, featured, q, near, sort, limit } = query;
    const nearLoc = parseNearParam(near);

    let geoWhere: Prisma.DestinationWhereInput = {};
    if (nearLoc) {
      const box = calculateBoundingBox(nearLoc.latitude, nearLoc.longitude, nearLoc.radiusKm);
      geoWhere = {
        latitude: { gte: box.minLat, lte: box.maxLat },
        longitude: { gte: box.minLon, lte: box.maxLon },
      };
    }

    const where: Prisma.DestinationWhereInput = {
      ...(includeDeleted ? {} : { deletedAt: null }),
      ...(category ? { category } : {}),
      ...(featured !== undefined ? { isFeatured: featured } : {}),
      ...geoWhere,
      ...(q
        ? {
            OR: [
              { name: { contains: q, mode: 'insensitive' } },
              { description: { contains: q, mode: 'insensitive' } },
              { region: { contains: q, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    // Sort order
    let orderBy: Prisma.DestinationOrderByWithRelationInput = { createdAt: 'desc' };
    if (sort === 'name') orderBy = { name: 'asc' };
    else if (sort === '-name') orderBy = { name: 'desc' };
    else if (sort === 'created_at') orderBy = { createdAt: 'asc' };
    else if (sort === '-created_at') orderBy = { createdAt: 'desc' };

    const paginationArgs = buildPaginationArgs(query);

    const items = await prisma.destination.findMany({
      where,
      orderBy: nearLoc ? undefined : orderBy,
      ...paginationArgs,
    });

    let processedItems: (Destination & { distanceKm?: number })[] = items;

    if (nearLoc) {
      processedItems = items
        .map((d) => {
          if (d.latitude != null && d.longitude != null) {
            const distanceKm = haversineDistanceKm(
              nearLoc.latitude,
              nearLoc.longitude,
              d.latitude,
              d.longitude,
            );
            return { ...d, distanceKm };
          }
          return { ...d, distanceKm: undefined };
        })
        .filter((d) => d.distanceKm === undefined || d.distanceKm <= nearLoc.radiusKm)
        .sort((a, b) => (a.distanceKm ?? Infinity) - (b.distanceKm ?? Infinity));
    }

    return paginateResults(processedItems, limit);
  }

  async create(data: CreateDestinationInput & { slug: string }): Promise<Destination> {
    return prisma.destination.create({
      data: {
        name: data.name,
        slug: data.slug,
        category: data.category,
        description: data.description,
        shortDescription: data.shortDescription,
        region: data.region,
        latitude: data.latitude,
        longitude: data.longitude,
        images: data.images,
        highlights: data.highlights,
        isFeatured: data.isFeatured,
      },
    });
  }

  async update(id: string, data: UpdateDestinationInput & { slug?: string }): Promise<Destination> {
    return prisma.destination.update({
      where: { id },
      data: {
        ...(data.name !== undefined ? { name: data.name } : {}),
        ...(data.slug !== undefined ? { slug: data.slug } : {}),
        ...(data.category !== undefined ? { category: data.category } : {}),
        ...(data.description !== undefined ? { description: data.description } : {}),
        ...(data.shortDescription !== undefined ? { shortDescription: data.shortDescription } : {}),
        ...(data.region !== undefined ? { region: data.region } : {}),
        ...(data.latitude !== undefined ? { latitude: data.latitude } : {}),
        ...(data.longitude !== undefined ? { longitude: data.longitude } : {}),
        ...(data.images !== undefined ? { images: data.images } : {}),
        ...(data.highlights !== undefined ? { highlights: data.highlights } : {}),
        ...(data.isFeatured !== undefined ? { isFeatured: data.isFeatured } : {}),
      },
    });
  }

  async softDelete(id: string): Promise<Destination> {
    return prisma.destination.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}

export const destinationRepository = new DestinationRepository();
