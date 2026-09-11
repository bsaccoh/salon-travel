import { Router } from 'express';
import { providerController } from './controller';
import { validate } from '../../common/middleware/validate';
import { authenticate, optionalAuth } from '../../common/middleware/authenticate';
import { rateLimit } from '../../common/middleware/rateLimiter';
import {
  createProviderSchema,
  updateProviderSchema,
  listProvidersQuerySchema,
} from './schemas';

export const providerRoutes = Router();

// Public provider discovery
providerRoutes.get(
  '/',
  optionalAuth,
  rateLimit('READ_UNAUTHENTICATED'),
  validate({ query: listProvidersQuerySchema }),
  providerController.listPublic,
);

// Provider self-profile and onboarding (Authenticated)
providerRoutes.post(
  '/',
  authenticate,
  rateLimit('WRITE'),
  validate({ body: createProviderSchema }),
  providerController.create,
);

providerRoutes.get(
  '/me',
  authenticate,
  rateLimit('READ_AUTHENTICATED'),
  providerController.getMe,
);

providerRoutes.get(
  '/me/dashboard',
  authenticate,
  rateLimit('READ_AUTHENTICATED'),
  providerController.getDashboard,
);

providerRoutes.patch(
  '/me',
  authenticate,
  rateLimit('WRITE'),
  validate({ body: updateProviderSchema }),
  providerController.updateMe,
);

providerRoutes.post(
  '/me/submit',
  authenticate,
  rateLimit('WRITE'),
  providerController.submitForVerification,
);

// Public provider detail by slug (registered last to avoid collision with /me)
providerRoutes.get(
  '/:slug',
  optionalAuth,
  rateLimit('READ_UNAUTHENTICATED'),
  providerController.getBySlug,
);
