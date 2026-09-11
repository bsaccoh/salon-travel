import { prisma } from '../../config/database';
import { Review, ReviewStatus, Prisma } from '@prisma/client';
import { buildPaginationArgs, paginateResults } from '../../common/pagination';
import { ListReviewsQuery, CreateReviewInput, UpdateReviewInput } from './schemas';

export class ReviewRepository {
  async findById(id: string): Promise<Review | null> {
    return prisma.review.findUnique({
      where: { id },
      include: {
        author: { select: { id: true, fullName: true } },
        booking: { select: { id: true, travelerId: true, providerId: true } },
      },
    });
  }

  async findByBookingId(bookingId: string): Promise<Review | null> {
    return prisma.review.findUnique({
      where: { bookingId },
    });
  }

  async listByProvider(providerId: string, query: ListReviewsQuery) {
    const { limit } = query;

    const where: Prisma.ReviewWhereInput = {
      providerId,
      status: ReviewStatus.published,
      deletedAt: null,
    };

    const paginationArgs = buildPaginationArgs(query);

    const items = await prisma.review.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      ...paginationArgs,
      include: {
        author: {
          select: { id: true, fullName: true },
        },
      },
    });

    return paginateResults(items, limit);
  }

  async create(
    data: CreateReviewInput & { authorId: string; providerId: string },
    tx: Prisma.TransactionClient = prisma,
  ): Promise<Review> {
    return tx.review.create({
      data: {
        bookingId: data.bookingId,
        authorId: data.authorId,
        providerId: data.providerId,
        rating: data.rating,
        title: data.title,
        content: data.content,
        status: ReviewStatus.published,
      },
    });
  }

  async update(
    id: string,
    data: UpdateReviewInput | { status: ReviewStatus; moderatedBy?: string; moderatedAt?: Date },
    tx: Prisma.TransactionClient = prisma,
  ): Promise<Review> {
    return tx.review.update({
      where: { id },
      data,
    });
  }

  /**
   * Recalculate and persist provider's avgRating and reviewCount.
   */
  async recalculateProviderRating(
    providerId: string,
    tx: Prisma.TransactionClient = prisma,
  ): Promise<{ avgRating: number; reviewCount: number }> {
    const aggregations = await tx.review.aggregate({
      where: {
        providerId,
        status: ReviewStatus.published,
        deletedAt: null,
      },
      _avg: { rating: true },
      _count: { rating: true },
    });

    const avgRating = aggregations._avg.rating ? parseFloat(aggregations._avg.rating.toFixed(2)) : 0;
    const reviewCount = aggregations._count.rating || 0;

    await tx.provider.update({
      where: { id: providerId },
      data: {
        avgRating,
        reviewCount,
      },
    });

    return { avgRating, reviewCount };
  }
}

export const reviewRepository = new ReviewRepository();
