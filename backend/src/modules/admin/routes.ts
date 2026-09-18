import { Router } from 'express';
import { adminController } from './controller';
import { providerController } from '../providers/controller';
import { reviewController } from '../reviews/controller';
import { paymentController } from '../payments/controller';
import { refundController } from '../refunds/controller';
import { conversationController } from '../conversations/controller';
import { validate } from '../../common/middleware/validate';
import { authenticate } from '../../common/middleware/authenticate';
import { authorize } from '../../common/middleware/authorize';
import { rateLimit } from '../../common/middleware/rateLimiter';
import { listUsersQuerySchema, userStatusActionSchema, createUserSchema } from './schemas';
import { listProvidersQuerySchema, adminProviderActionSchema } from '../providers/schemas';
import { listBookingsQuerySchema } from '../bookings/schemas';
import { moderateReviewSchema, listReviewsQuerySchema } from '../reviews/schemas';
import { listPaymentsQuerySchema } from '../payments/schemas';
import { listRefundsQuerySchema } from '../refunds/schemas';
import { assignConversationSchema } from '../conversations/schemas';

export const adminRoutes = Router();

// All admin routes require JWT authentication and 'admin' role
adminRoutes.use(authenticate, authorize('admin', 'concierge'), rateLimit('WRITE'));

// ── 0. Dashboard & Analytics ─────────────────────────

adminRoutes.get(
  '/dashboard',
  adminController.getDashboardStats,
);

adminRoutes.get(
  '/dashboard/concierge',
  adminController.getConciergeStats,
);

adminRoutes.get(
  '/dashboard/chart',
  adminController.getMonthlyChart,
);

adminRoutes.get(
  '/activity',
  adminController.getActivityFeed,
);

adminRoutes.get(
  '/reviews',
  validate({ query: listReviewsQuerySchema }),
  adminController.listReviews,
);

// ── 1. Provider Verification & Moderation Routes ──────

adminRoutes.get(
  '/providers',
  validate({ query: listProvidersQuerySchema }),
  providerController.listAdmin,
);

adminRoutes.get(
  '/providers/:id',
  providerController.getAdminById,
);

adminRoutes.post(
  '/providers/:id/review',
  providerController.review,
);

adminRoutes.post(
  '/providers/:id/approve',
  providerController.approve,
);

adminRoutes.post(
  '/providers/:id/request-changes',
  validate({ body: adminProviderActionSchema }),
  providerController.requestChanges,
);

adminRoutes.post(
  '/providers/:id/reject',
  validate({ body: adminProviderActionSchema }),
  providerController.reject,
);

adminRoutes.post(
  '/providers/:id/suspend',
  validate({ body: adminProviderActionSchema }),
  providerController.suspend,
);

adminRoutes.post(
  '/providers/:id/reinstate',
  providerController.reinstate,
);

// ── 2. User Management Routes ─────────────────────────

adminRoutes.get(
  '/users',
  validate({ query: listUsersQuerySchema }),
  adminController.listUsers,
);

adminRoutes.post(
  '/users',
  authorize('admin'),
  validate({ body: createUserSchema }),
  adminController.createUser,
);

adminRoutes.get(
  '/users/:id',
  adminController.getUserById,
);

adminRoutes.post(
  '/users/:id/suspend',
  validate({ body: userStatusActionSchema }),
  adminController.suspendUser,
);

adminRoutes.post(
  '/users/:id/reactivate',
  adminController.reactivateUser,
);

// ── 3. Platform Bookings Routes ───────────────────────

adminRoutes.get(
  '/bookings',
  validate({ query: listBookingsQuerySchema }),
  adminController.listBookings,
);

adminRoutes.get(
  '/bookings/:id',
  adminController.getBookingById,
);

// ── 4. Review Moderation Routes ───────────────────────

adminRoutes.post(
  '/reviews/:id/moderate',
  validate({ body: moderateReviewSchema }),
  reviewController.moderate,
);

// ── 5. Payment & Refund Admin Visibility ──────────────

adminRoutes.get(
  '/payments',
  validate({ query: listPaymentsQuerySchema }),
  paymentController.list,
);

adminRoutes.get(
  '/payments/:id',
  paymentController.getById,
);

adminRoutes.get(
  '/refunds',
  validate({ query: listRefundsQuerySchema }),
  refundController.list,
);

adminRoutes.get(
  '/refunds/:id',
  refundController.getById,
);

// ── 6. Concierge Conversation Reassignment ────────────

adminRoutes.post(
  '/conversations/:id/assign',
  validate({ body: assignConversationSchema }),
  conversationController.adminReassign,
);

