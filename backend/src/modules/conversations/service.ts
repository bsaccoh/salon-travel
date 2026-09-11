import { Conversation, Message, UserRole } from '@prisma/client';
import { prisma } from '../../config/database';
import { conversationRepository, ConversationRepository } from './repository';
import { bookingRepository, BookingRepository } from '../bookings/repository';
import { AuthorizationError, NotFoundError } from '../../common/errors';
import { auditService, AuditContext } from '../audit';
import { getQueue, QUEUE_NAMES } from '../../jobs/queues';
import { CreateConversationInput, ListInboxQuery, SendMessageInput, ListMessagesQuery } from './schemas';
import { createModuleLogger } from '../../config/logger';

const log = createModuleLogger('conversation-service');

// Optional reference to Socket.io broadcaster
let wsBroadcaster: ((room: string, event: string, payload: any) => void) | null = null;

export function setWebSocketBroadcaster(broadcaster: (room: string, event: string, payload: any) => void) {
  wsBroadcaster = broadcaster;
}

export class ConversationService {
  constructor(
    private readonly repo: ConversationRepository = conversationRepository,
    private readonly bookingRepo: BookingRepository = bookingRepository,
  ) {}

  async createConversation(
    travelerId: string,
    input: CreateConversationInput,
    context: AuditContext,
  ): Promise<Conversation> {
    const { subject, bookingId, initialMessage } = input;

    // 1. If linked to booking, validate traveler ownership
    if (bookingId) {
      const booking = await this.bookingRepo.findById(bookingId);
      if (!booking || booking.travelerId !== travelerId) {
        throw new NotFoundError('Booking', bookingId);
      }
    }

    // 2. Prevent excessive duplicate open threads for same booking
    if (bookingId) {
      const existing = await this.repo.findActiveByTraveler(travelerId, bookingId);
      if (existing) {
        // If initialMessage was provided, append it to existing conversation
        if (initialMessage) {
          await this.repo.createMessage({
            conversationId: existing.id,
            senderId: travelerId,
            content: initialMessage,
            attachments: [],
          });
        }
        return existing;
      }
    }

    // 3. Create conversation & optional initial message
    const conversation = await prisma.$transaction(async (tx) => {
      const conv = await this.repo.create(
        {
          travelerId,
          bookingId: bookingId || null,
          subject: subject || (bookingId ? `Booking #${bookingId.slice(0, 8)} Inquiry` : 'Concierge Inquiry'),
          isEmergency: false,
          isClosed: false,
        },
        tx,
      );

      if (initialMessage) {
        await this.repo.createMessage(
          {
            conversationId: conv.id,
            senderId: travelerId,
            content: initialMessage,
            attachments: [],
          },
          tx,
        );
      }

      await auditService.logInTransaction(tx, context, {
        action: 'CONVERSATION_CREATED',
        resource: 'conversation',
        resourceId: conv.id,
        metadata: { travelerId, bookingId },
      });

      return conv;
    });

    // Notify concierge channel
    if (wsBroadcaster) {
      wsBroadcaster('staff:concierge', 'conversation:created', { conversationId: conversation.id });
    }

    return conversation;
  }

  async getMine(travelerId: string, query: ListInboxQuery) {
    return this.repo.listForTraveler(travelerId, query);
  }

  async getInbox(conciergeId: string, query: ListInboxQuery) {
    return this.repo.listInbox(query, conciergeId);
  }

  async getConversationById(userId: string, userRole: UserRole, conversationId: string) {
    const conv = await this.repo.findById(conversationId);
    if (!conv) {
      throw new NotFoundError('Conversation', conversationId);
    }

    // Authorization check
    if (userRole === UserRole.traveler && conv.travelerId !== userId) {
      throw new NotFoundError('Conversation', conversationId);
    }

    if (userRole === UserRole.provider) {
      throw new AuthorizationError('Providers do not have access to traveler concierge conversations');
    }

    return conv;
  }

  async claimConversation(
    conciergeId: string,
    conversationId: string,
    context: AuditContext,
  ): Promise<Conversation> {
    const conv = await this.repo.findById(conversationId);
    if (!conv) throw new NotFoundError('Conversation', conversationId);

    const claimed = await prisma.$transaction(async (tx) => {
      const c = await this.repo.claim(conversationId, conciergeId, tx);

      // Create system announcement message
      await this.repo.createMessage(
        {
          conversationId,
          senderId: conciergeId,
          content: 'A concierge has joined the conversation to assist you.',
          attachments: [],
        },
        tx,
      );

      await auditService.logInTransaction(tx, context, {
        action: 'CONVERSATION_CLAIMED',
        resource: 'conversation',
        resourceId: conversationId,
        metadata: { conciergeId },
      });

      return c;
    });

    if (wsBroadcaster) {
      wsBroadcaster(`conv:${conversationId}`, 'conversation:assigned', {
        conversationId,
        conciergeId,
      });
    }

    return claimed;
  }

  async releaseConversation(
    conciergeId: string,
    conversationId: string,
    context: AuditContext,
  ): Promise<Conversation> {
    const conv = await this.repo.findById(conversationId);
    if (!conv) throw new NotFoundError('Conversation', conversationId);

    const released = await prisma.$transaction(async (tx) => {
      const c = await this.repo.release(conversationId, conciergeId, tx);

      await this.repo.createMessage(
        {
          conversationId,
          senderId: conciergeId,
          content: 'Conversation has been returned to the concierge queue.',
          attachments: [],
        },
        tx,
      );

      await auditService.logInTransaction(tx, context, {
        action: 'CONVERSATION_RELEASED',
        resource: 'conversation',
        resourceId: conversationId,
        metadata: { releasedBy: conciergeId },
      });

      return c;
    });

    if (wsBroadcaster) {
      wsBroadcaster(`conv:${conversationId}`, 'conversation:released', { conversationId });
      wsBroadcaster('staff:concierge', 'conversation:updated', { conversationId });
    }

    return released;
  }

  async adminReassign(
    adminId: string,
    conversationId: string,
    newConciergeId: string | null,
    context: AuditContext,
  ): Promise<Conversation> {
    const conv = await this.repo.findById(conversationId);
    if (!conv) throw new NotFoundError('Conversation', conversationId);

    const reassigned = await prisma.$transaction(async (tx) => {
      const c = await this.repo.adminReassign(conversationId, newConciergeId, tx);

      await this.repo.createMessage(
        {
          conversationId,
          senderId: adminId,
          content: newConciergeId
            ? `Conversation reassigned by administrator to concierge ${newConciergeId}.`
            : 'Conversation reassigned to unassigned queue by administrator.',
          attachments: [],
        },
        tx,
      );

      await auditService.logInTransaction(tx, context, {
        action: 'CONVERSATION_REASSIGNED',
        resource: 'conversation',
        resourceId: conversationId,
        metadata: { assignedTo: newConciergeId, adminId },
      });

      return c;
    });

    if (wsBroadcaster) {
      wsBroadcaster(`conv:${conversationId}`, 'conversation:reassigned', {
        conversationId,
        conciergeId: newConciergeId,
      });
    }

    return reassigned;
  }

  async flagEmergency(
    actorId: string,
    actorRole: UserRole,
    conversationId: string,
    notes: string | undefined,
    context: AuditContext,
  ): Promise<Conversation> {
    const conv = await this.repo.findById(conversationId);
    if (!conv) throw new NotFoundError('Conversation', conversationId);

    const updated = await prisma.$transaction(async (tx) => {
      const c = await this.repo.setEmergency(conversationId, true, tx);

      await this.repo.createMessage(
        {
          conversationId,
          senderId: actorId,
          content: `🚨 EMERGENCY ESCALATED: ${notes || 'Immediate assistance requested'}`,
          attachments: [],
        },
        tx,
      );

      await auditService.logInTransaction(tx, context, {
        action: 'EMERGENCY_FLAGGED',
        resource: 'conversation',
        resourceId: conversationId,
        metadata: { notes, actorRole },
      });

      return c;
    });

    // Enqueue emergency paging jobs (SMS & WhatsApp)
    try {
      const notificationQueue = getQueue(QUEUE_NAMES.NOTIFICATIONS);
      await notificationQueue.add(
        'emergency.page_oncall',
        {
          conversationId,
          notes: notes || 'Emergency assistance requested',
          travelerName: (conv as any).traveler?.fullName || 'Traveler',
          travelerPhone: (conv as any).traveler?.phone,
          requestId: context.requestId,
        },
        { priority: 1 },
      );
    } catch (err) {
      log.error({ err, conversationId }, 'Failed to enqueue emergency paging job');
    }

    if (wsBroadcaster) {
      wsBroadcaster(`conv:${conversationId}`, 'conversation:emergency', {
        conversationId,
        isEmergency: true,
        notes,
      });
      wsBroadcaster('staff:concierge', 'conversation:emergency', {
        conversationId,
        isEmergency: true,
      });
    }

    return updated;
  }

  async resolveEmergency(
    actorId: string,
    _actorRole: UserRole,
    conversationId: string,
    notes: string | undefined,
    context: AuditContext,
  ): Promise<Conversation> {
    const conv = await this.repo.findById(conversationId);
    if (!conv) throw new NotFoundError('Conversation', conversationId);

    const updated = await prisma.$transaction(async (tx) => {
      const c = await this.repo.setEmergency(conversationId, false, tx);

      await this.repo.createMessage(
        {
          conversationId,
          senderId: actorId,
          content: `Emergency marked resolved: ${notes || 'Situation addressed'}`,
          attachments: [],
        },
        tx,
      );

      await auditService.logInTransaction(tx, context, {
        action: 'EMERGENCY_RESOLVED',
        resource: 'conversation',
        resourceId: conversationId,
        metadata: { notes },
      });

      return c;
    });

    if (wsBroadcaster) {
      wsBroadcaster(`conv:${conversationId}`, 'conversation:emergency_resolved', {
        conversationId,
        isEmergency: false,
      });
    }

    return updated;
  }

  // ── Persistent Messaging ──────────────────────────────

  async sendMessage(
    senderId: string,
    senderRole: UserRole,
    conversationId: string,
    input: SendMessageInput,
    _context?: AuditContext,
  ): Promise<Message> {
    const conv = await this.repo.findById(conversationId);
    if (!conv) {
      throw new NotFoundError('Conversation', conversationId);
    }

    // Access authorization
    if (senderRole === UserRole.traveler && conv.travelerId !== senderId) {
      throw new NotFoundError('Conversation', conversationId);
    }

    if (senderRole === UserRole.provider) {
      throw new AuthorizationError('Providers cannot post to concierge chat');
    }

    // 1. Authoritative persistence in PostgreSQL FIRST
    const message = await this.repo.createMessage({
      conversationId,
      senderId,
      content: input.content,
      attachments: input.attachments || [],
    });

    // 2. Real-time fan-out via Socket.io/Redis
    if (wsBroadcaster) {
      try {
        wsBroadcaster(`conv:${conversationId}`, 'chat:message', {
          id: message.id,
          conversationId: message.conversationId,
          senderId: message.senderId,
          content: message.content,
          attachments: message.attachments,
          createdAt: message.createdAt,
          sender: (message as any).sender,
        });
      } catch (err) {
        log.error({ err, messageId: message.id }, 'Realtime broadcast failed after DB persistence');
      }
    }

    return message;
  }

  async listMessages(
    userId: string,
    userRole: UserRole,
    conversationId: string,
    query: ListMessagesQuery,
  ) {
    // Check permission to view
    await this.getConversationById(userId, userRole, conversationId);
    return this.repo.listMessages(conversationId, query);
  }

  async markRead(userId: string, conversationId: string): Promise<void> {
    await this.repo.markMessagesRead(conversationId, userId);

    if (wsBroadcaster) {
      wsBroadcaster(`conv:${conversationId}`, 'chat:read', {
        conversationId,
        readerId: userId,
        readAt: new Date(),
      });
    }
  }
}

export const conversationService = new ConversationService();
