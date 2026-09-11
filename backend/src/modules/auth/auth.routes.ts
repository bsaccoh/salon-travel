import { Router } from 'express';
import { authController } from './auth.controller';
import { validate } from '../../common/middleware/validate';
import { authenticate } from '../../common/middleware/authenticate';
import { rateLimit } from '../../common/middleware/rateLimiter';
import {
  registerSchema,
  loginSchema,
  refreshSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  confirmEmailVerificationSchema,
  updateProfileSchema,
} from './auth.validation';

export const authRoutes = Router();

// Public auth endpoints (Rate limited: 20 req/min/IP)
authRoutes.post(
  '/register',
  rateLimit('AUTH_UNAUTHENTICATED'),
  validate({ body: registerSchema }),
  authController.register,
);

authRoutes.post(
  '/login',
  rateLimit('AUTH_UNAUTHENTICATED'),
  validate({ body: loginSchema }),
  authController.login,
);

authRoutes.post(
  '/refresh',
  rateLimit('AUTH_UNAUTHENTICATED'),
  validate({ body: refreshSchema }),
  authController.refresh,
);

authRoutes.post(
  '/password/forgot',
  rateLimit('AUTH_UNAUTHENTICATED'),
  validate({ body: forgotPasswordSchema }),
  authController.forgotPassword,
);

authRoutes.post(
  '/password/reset',
  rateLimit('AUTH_UNAUTHENTICATED'),
  validate({ body: resetPasswordSchema }),
  authController.resetPassword,
);

authRoutes.post(
  '/email/verify/confirm',
  rateLimit('AUTH_UNAUTHENTICATED'),
  validate({ body: confirmEmailVerificationSchema }),
  authController.confirmEmailVerification,
);

// Protected auth endpoints (Rate limited: 10 req/min/user)
authRoutes.post('/logout', authenticate, rateLimit('AUTH_AUTHENTICATED'), authController.logout);

authRoutes.post(
  '/email/verify/send',
  authenticate,
  rateLimit('AUTH_AUTHENTICATED'),
  authController.sendEmailVerification,
);

authRoutes.get('/me', authenticate, rateLimit('AUTH_AUTHENTICATED'), authController.getMe);

authRoutes.patch(
  '/me',
  authenticate,
  rateLimit('AUTH_AUTHENTICATED'),
  validate({ body: updateProfileSchema }),
  authController.updateMe,
);
