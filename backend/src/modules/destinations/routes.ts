import { Router } from 'express';
import { destinationController } from './controller';
import { validate } from '../../common/middleware/validate';
import { authenticate, optionalAuth } from '../../common/middleware/authenticate';
import { authorize } from '../../common/middleware/authorize';
import { rateLimit } from '../../common/middleware/rateLimiter';
import {
  createDestinationSchema,
  updateDestinationSchema,
  listDestinationsQuerySchema,
} from './schemas';

export const destinationRoutes = Router();

// Public destination discovery
destinationRoutes.get(
  '/',
  optionalAuth,
  rateLimit('READ_UNAUTHENTICATED'),
  validate({ query: listDestinationsQuerySchema }),
  destinationController.list,
);

destinationRoutes.get(
  '/:slug',
  optionalAuth,
  rateLimit('READ_UNAUTHENTICATED'),
  destinationController.getBySlug,
);

// Admin-only management
destinationRoutes.post(
  '/',
  authenticate,
  authorize('admin'),
  rateLimit('WRITE'),
  validate({ body: createDestinationSchema }),
  destinationController.create,
);

destinationRoutes.patch(
  '/:id',
  authenticate,
  authorize('admin'),
  rateLimit('WRITE'),
  validate({ body: updateDestinationSchema }),
  destinationController.update,
);

destinationRoutes.delete(
  '/:id',
  authenticate,
  authorize('admin'),
  rateLimit('WRITE'),
  destinationController.delete,
);
