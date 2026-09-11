import { Review, BookingStatus, ReviewStatus } from '@prisma/client';
import { prisma } from '../../config/database';
import { reviewRepository, ReviewRepository } from './repository';
import { bookingRepository, BookingRepository } from '../bookings/repository';
import { ConflictError, NotFoundError } from '../../common/errors';
import { auditService, AuditContext } from '../audit';
import { CreateReviewInput, UpdateReviewInput, ModerateReviewInput, ListReviewsQuery } from './schemas';

export class ReviewService {
  constructor(
    private readonly repo: ReviewRepository = reviewRepository,
    private readonly bookingRepo: BookingRepository = bookingRepository,
  ) {}

  async createReview(
    userId: string,
    input: CreateReviewInput,
    context: AuditContext,
  ): Promise<Review> {
    const { bookingId } = input;

    // 1. Verify Booking Eligibility
    const booking = await this.bookingRepo.findById(bookingId);
    if (!booking || booking.travelerId !== userId) {
      throw new NotFoundError('Booking', bookingId);
    }

    if (booking.status !== BookingStatus.completed) {
      throw new ConflictError(
        'Reviews can only be submitted for completed bookings',
        'REVIEW_NOT_ALLOWED',
      );
    }

    // 2. Enforce one review per booking
    const existing = await this.repo.findByBookingId(bookingId);
    if (existing) {
      throw new ConflictError(
        'A review has already been submitted for this booking',
        'REVIEW_ALREADY_EXISTS',
      );
    }

    // 3. Atomic Transaction
    const result = await prisma.$transaction(async (tx) => {
      const review = await this.repo.create(
        {
          ...input,
          authorId: userId,
          providerId: booking.providerId,
        },
        tx,
      );

      // Recalculate provider aggregate rating
      await this.repo.recalculateProviderRating(booking.providerId, tx);

      // Audit Log
      await auditService.logInTransaction(tx, context, {
        action: 'REVIEW_CREATED',
        resource: 'review',
        resourceId: review.id,
        metadata: { bookingId, providerId: booking.providerId, rating: input.rating },
      });

      return review;
    });

    return result;
  }

  async updateReview(
    userId: string,
    reviewId: string,
    input: UpdateReviewInput,
    context: AuditContext,
  ): Promise<Review> {
    const review = await this.repo.findById(reviewId);
    if (!review || review.authorId !== userId) {
      throw new NotFoundError('Review', reviewId);
    }

    // 24-hour edit window rule
    const now = Date.now();
    const createdAtTime = new Date(review.createdAt).getTime();
    const hoursSinceCreation = (now - createdAtTime) / (1000 * 60 * 60);

    if (hoursSinceCreation > 24) {
      throw new ConflictError(
        'Reviews can only be edited within 24 hours of submission',
        'EDIT_WINDOW_CLOSED',
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      const updated = await this.repo.update(reviewId, input, tx);

      if (input.rating && input.rating !== review.rating) {
        await this.repo.recalculateProviderRating(review.providerId, tx);
      }

      await auditService.logInTransaction(tx, context, {
        action: 'REVIEW_UPDATED',
        resource: 'review',
        resourceId: review.id,
        metadata: { fields: Object.keys(input) },
      });

      return updated;
    });

    return result;
  }

  async moderateReview(
    adminId: string,
    reviewId: string,
    input: ModerateReviewInput,
    context: AuditContext,
  ): Promise<Review> {
    const review = await this.repo.findById(reviewId);
    if (!review) {
      throw new NotFoundError('Review', reviewId);
    }

    const targetStatus = input.status === 'published' ? ReviewStatus.published : ReviewStatus.hidden;

    const result = await prisma.$transaction(async (tx) => {
      const updated = await this.repo.update(
        reviewId,
        {
          status: targetStatus,
          moderatedBy: adminId,
          moderatedAt: new Date(),
        },
        tx,
      );

      // Recalculate provider aggregate rating (hidden reviews excluded)
      await this.repo.recalculateProviderRating(review.providerId, tx);

      await auditService.logInTransaction(tx, context, {
        action: 'REVIEW_MODERATED',
        resource: 'review',
        resourceId: review.id,
        metadata: { status: targetStatus, notes: input.notes },
      });

      return updated;
    });

    return result;
  }

  async listProviderReviews(providerId: string, query: ListReviewsQuery) {
    return this.repo.listByProvider(providerId, query);
  }
}

export const reviewService = new ReviewService();
