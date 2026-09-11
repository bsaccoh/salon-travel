import { Router } from 'express';
import { authRoutes } from '../modules/auth';
import { destinationRoutes } from '../modules/destinations';
import { providerRoutes } from '../modules/providers';
import { providerServiceRoutes, publicServiceRoutes, publicServicesCatalogRoutes } from '../modules/services';
import { providerDocumentRoutes } from '../modules/provider-documents';
import { bookingRoutes, providerBookingsRoutes } from '../modules/bookings';
import { paymentRoutes } from '../modules/payments';
import { paymentRefundRoutes } from '../modules/refunds';
import { conversationRoutes } from '../modules/conversations';
import { reviewRoutes } from '../modules/reviews';
import { adminRoutes } from '../modules/admin';
import { storageRoutes } from '../modules/storage';

/**
 * API v1 router — aggregates all domain module routes.
 * Mounted at /v1 in the Express app.
 */
export function createV1Router(): Router {
  const router = Router();

  // Authentication & Identity
  router.use('/auth', authRoutes);

  // Destinations Catalog
  router.use('/destinations', destinationRoutes);

  // Public Services Catalog (Mounted before /providers)
  router.use('/services', publicServicesCatalogRoutes);

  // Provider Documents (mounted before /providers/:slug)
  router.use('/providers/me/documents', providerDocumentRoutes);

  // Provider Services (mounted before /providers/:slug)
  router.use('/providers/me/services', providerServiceRoutes);
  router.use('/providers/:providerId/services', publicServiceRoutes);

  // Provider Management & Discovery
  router.use('/providers', providerRoutes);

  // Provider Bookings
  router.use('/provider', providerBookingsRoutes);

  // Traveler Bookings & Booking Lifecycle
  router.use('/bookings', bookingRoutes);

  // Payment Refunds (must be mounted before /payments)
  router.use('/payments/:paymentId/refund', paymentRefundRoutes);

  // Payments & Stripe Webhooks
  router.use('/payments', paymentRoutes);

  // Concierge Conversations & Messaging
  router.use('/conversations', conversationRoutes);

  // Reviews & Ratings
  router.use('/reviews', reviewRoutes);

  // Admin Operations & Moderation
  router.use('/admin', adminRoutes);

  // File & Media Storage Pipeline
  router.use('/storage', storageRoutes);

  return router;
}
