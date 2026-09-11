import { Router } from 'express';
import { conversationController } from './controller';
import { validate } from '../../common/middleware/validate';
import { authenticate } from '../../common/middleware/authenticate';
import { authorize } from '../../common/middleware/authorize';
import { rateLimit } from '../../common/middleware/rateLimiter';
import {
  createConversationSchema,
  listInboxQuerySchema,
  sendMessageSchema,
  assignConversationSchema,
  emergencyActionSchema,
  listMessagesQuerySchema,
} from './schemas';

export const conversationRoutes = Router();

conversationRoutes.use(authenticate);

// Traveler Endpoints
conversationRoutes.post(
  '/',
  authorize('traveler', 'admin'),
  rateLimit('WRITE'),
  validate({ body: createConversationSchema }),
  conversationController.create,
);

conversationRoutes.get(
  '/mine',
  authorize('traveler', 'admin'),
  rateLimit('READ_AUTHENTICATED'),
  validate({ query: listInboxQuerySchema }),
  conversationController.getMine,
);

// Concierge / Staff Inbox
conversationRoutes.get(
  '/inbox',
  authorize('concierge', 'admin'),
  rateLimit('READ_AUTHENTICATED'),
  validate({ query: listInboxQuerySchema }),
  conversationController.getInbox,
);

// Individual Conversation Detail
conversationRoutes.get(
  '/:id',
  rateLimit('READ_AUTHENTICATED'),
  conversationController.getById,
);

// Assignment & Queue Management
conversationRoutes.post(
  '/:id/assign',
  authorize('concierge', 'admin'),
  rateLimit('WRITE'),
  conversationController.claim,
);

conversationRoutes.post(
  '/:id/release',
  authorize('concierge', 'admin'),
  rateLimit('WRITE'),
  conversationController.release,
);

// Emergency Escalation & Resolution
conversationRoutes.post(
  '/:id/emergency',
  authorize('concierge', 'admin'),
  rateLimit('WRITE'),
  validate({ body: emergencyActionSchema }),
  conversationController.flagEmergency,
);

conversationRoutes.post(
  '/:id/emergency/resolve',
  authorize('concierge', 'admin'),
  rateLimit('WRITE'),
  validate({ body: emergencyActionSchema }),
  conversationController.resolveEmergency,
);

// Messages History & HTTP Sending Fallback
conversationRoutes.get(
  '/:id/messages',
  rateLimit('READ_AUTHENTICATED'),
  validate({ query: listMessagesQuerySchema }),
  conversationController.listMessages,
);

conversationRoutes.post(
  '/:id/messages',
  rateLimit('WRITE'),
  validate({ body: sendMessageSchema }),
  conversationController.sendMessage,
);

conversationRoutes.post(
  '/:id/read',
  rateLimit('WRITE'),
  conversationController.markRead,
);

// Admin Reassignment Router (mounted under /v1/admin/conversations)
export const adminConversationRoutes = Router();

adminConversationRoutes.use(authenticate, authorize('admin'), rateLimit('WRITE'));

adminConversationRoutes.post(
  '/:id/assign',
  validate({ body: assignConversationSchema }),
  conversationController.adminReassign,
);
