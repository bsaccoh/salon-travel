import { Router } from 'express';
import { refundController } from './controller';
import { validate } from '../../common/middleware/validate';
import { authenticate } from '../../common/middleware/authenticate';
import { authorize } from '../../common/middleware/authorize';
import { rateLimit } from '../../common/middleware/rateLimiter';
import { createRefundSchema, listRefundsQuerySchema } from './schemas';

// 1. Payment Refund Execution Router (mounted under /v1/payments/:paymentId/refund)
export const paymentRefundRoutes = Router({ mergeParams: true });

paymentRefundRoutes.post(
  '/',
  authenticate,
  authorize('concierge', 'admin'),
  rateLimit('WRITE'),
  validate({ body: createRefundSchema }),
  refundController.create,
);

// 2. Admin Refunds Management Router (mounted under /v1/admin/refunds)
export const adminRefundRoutes = Router();

adminRefundRoutes.use(authenticate, authorize('admin'), rateLimit('READ_AUTHENTICATED'));

adminRefundRoutes.get(
  '/',
  validate({ query: listRefundsQuerySchema }),
  refundController.list,
);

adminRefundRoutes.get(
  '/:id',
  refundController.getById,
);
