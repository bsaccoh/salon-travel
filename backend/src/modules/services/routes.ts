import { Router } from 'express';
import { serviceController } from './controller';
import { validate } from '../../common/middleware/validate';
import { authenticate, optionalAuth } from '../../common/middleware/authenticate';
import { rateLimit } from '../../common/middleware/rateLimiter';
import {
  createServiceSchema,
  updateServiceSchema,
  listServicesQuerySchema,
} from './schemas';

// 1. Router for provider-owned services mounted under /v1/providers/me/services
export const providerServiceRoutes = Router();

providerServiceRoutes.post(
  '/',
  authenticate,
  rateLimit('WRITE'),
  validate({ body: createServiceSchema }),
  serviceController.create,
);

providerServiceRoutes.get(
  '/',
  authenticate,
  rateLimit('READ_AUTHENTICATED'),
  validate({ query: listServicesQuerySchema }),
  serviceController.listOwn,
);

providerServiceRoutes.get(
  '/:id',
  authenticate,
  rateLimit('READ_AUTHENTICATED'),
  serviceController.getOwnById,
);

providerServiceRoutes.patch(
  '/:id',
  authenticate,
  rateLimit('WRITE'),
  validate({ body: updateServiceSchema }),
  serviceController.updateOwn,
);

providerServiceRoutes.delete(
  '/:id',
  authenticate,
  rateLimit('WRITE'),
  serviceController.deleteOwn,
);

// 2. Router for public provider service listing mounted under /v1/providers/:providerId/services
export const publicServiceRoutes = Router({ mergeParams: true });

publicServiceRoutes.get(
  '/',
  optionalAuth,
  rateLimit('READ_UNAUTHENTICATED'),
  validate({ query: listServicesQuerySchema }),
  serviceController.listPublic,
);

// 3. Router for general public services catalog mounted under /v1/services
export const publicServicesCatalogRoutes = Router();

publicServicesCatalogRoutes.get(
  '/',
  optionalAuth,
  rateLimit('READ_UNAUTHENTICATED'),
  validate({ query: listServicesQuerySchema }),
  serviceController.listPublicAll,
);

publicServicesCatalogRoutes.get(
  '/:id',
  optionalAuth,
  rateLimit('READ_UNAUTHENTICATED'),
  serviceController.getPublicById,
);
