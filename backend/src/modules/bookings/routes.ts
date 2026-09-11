import { Router } from 'express';
import { bookingController } from './controller';
import { validate } from '../../common/middleware/validate';
import { authenticate } from '../../common/middleware/authenticate';
import { rateLimit } from '../../common/middleware/rateLimiter';
import { idempotency } from '../../common/middleware/idempotency';
import {
  createBookingSchema,
  bookingActionSchema,
  listBookingsQuerySchema,
} from './schemas';

export const bookingRoutes = Router();

// Traveler booking endpoints
bookingRoutes.post(
  '/',
  authenticate,
  rateLimit('WRITE'),
  idempotency(),
  validate({ body: createBookingSchema }),
  bookingController.create,
);

bookingRoutes.get(
  '/mine',
  authenticate,
  rateLimit('READ_AUTHENTICATED'),
  validate({ query: listBookingsQuerySchema }),
  bookingController.getMine,
);

bookingRoutes.get(
  '/:id',
  authenticate,
  rateLimit('READ_AUTHENTICATED'),
  bookingController.getById,
);

// Booking lifecycle action endpoints
bookingRoutes.post(
  '/:id/accept',
  authenticate,
  rateLimit('WRITE'),
  bookingController.accept,
);

bookingRoutes.post(
  '/:id/decline',
  authenticate,
  rateLimit('WRITE'),
  validate({ body: bookingActionSchema }),
  bookingController.decline,
);

bookingRoutes.post(
  '/:id/cancel',
  authenticate,
  rateLimit('WRITE'),
  validate({ body: bookingActionSchema }),
  bookingController.cancel,
);

bookingRoutes.post(
  '/:id/complete',
  authenticate,
  rateLimit('WRITE'),
  bookingController.complete,
);

bookingRoutes.post(
  '/:id/no-show',
  authenticate,
  rateLimit('WRITE'),
  validate({ body: bookingActionSchema }),
  bookingController.noShow,
);

// Provider bookings router for /v1/provider/bookings
export const providerBookingsRoutes = Router();

providerBookingsRoutes.get(
  '/bookings',
  authenticate,
  rateLimit('READ_AUTHENTICATED'),
  validate({ query: listBookingsQuerySchema }),
  bookingController.getProviderBookings,
);
