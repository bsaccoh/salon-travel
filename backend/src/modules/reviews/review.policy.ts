import { Principal } from '../../common/types/principal';
import { Review, UserRole } from '@prisma/client';

export class ReviewPolicy {
  static canCreateReview(principal: Principal, bookingTravelerId: string): boolean {
    return principal.userId === bookingTravelerId;
  }

  static canUpdateReview(principal: Principal, review: Review): boolean {
    const isOwner = principal.userId === review.authorId;
    const isWithin24Hours = Date.now() - new Date(review.createdAt).getTime() < 24 * 60 * 60 * 1000;
    return isOwner && isWithin24Hours;
  }

  static canModerateReview(principal: Principal): boolean {
    return principal.role === UserRole.admin;
  }
}
