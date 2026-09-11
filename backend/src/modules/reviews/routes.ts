import { Router } from 'express';
import { reviewController } from './controller';
import { validate } from '../../common/middleware/validate';
import { authenticate, optionalAuth } from '../../common/middleware/authenticate';
import { authorize } from '../../common/middleware/authorize';
import { rateLimit } from '../../common/middleware/rateLimiter';
import {
  createReviewSchema,
  updateReviewSchema,
  moderateReviewSchema,
  listReviewsQuerySchema,
} from './schemas';

export const reviewRoutes = Router();

// Public provider reviews listing
reviewRoutes.get(
  '/provider/:providerId',
  optionalAuth,
  rateLimit('READ_UNAUTHENTICATED'),
  validate({ query: listReviewsQuerySchema }),
  reviewController.listByProvider,
);

// Traveler review creation & update
reviewRoutes.post(
  '/',
  authenticate,
  rateLimit('WRITE'),
  validate({ body: createReviewSchema }),
  reviewController.create,
);

reviewRoutes.patch(
  '/:id',
  authenticate,
  rateLimit('WRITE'),
  validate({ body: updateReviewSchema }),
  reviewController.update,
);

// Admin review moderation
reviewRoutes.post(
  '/:id/moderate',
  authenticate,
  authorize('admin'),
  rateLimit('WRITE'),
  validate({ body: moderateReviewSchema }),
  reviewController.moderate,
);
