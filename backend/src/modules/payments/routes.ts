import { Router, raw } from 'express';
import { paymentController } from './controller';
import { validate } from '../../common/middleware/validate';
import { authenticate } from '../../common/middleware/authenticate';
import { rateLimit } from '../../common/middleware/rateLimiter';
import { idempotency } from '../../common/middleware/idempotency';
import { createPaymentIntentSchema } from './schemas';

export const paymentRoutes = Router();

// Stripe Webhook Endpoint (Requires raw body and Stripe-Signature, no JWT)
paymentRoutes.post(
  '/webhooks/stripe',
  raw({ type: 'application/json' }),
  paymentController.handleWebhook,
);

// PaymentIntent Creation for Traveler (Authenticated & Idempotent)
paymentRoutes.post(
  '/intents',
  authenticate,
  rateLimit('PAYMENT'),
  idempotency(),
  validate({ body: createPaymentIntentSchema }),
  paymentController.createIntent,
);

paymentRoutes.get(
  '/:id',
  authenticate,
  rateLimit('READ_AUTHENTICATED'),
  paymentController.getById,
);
