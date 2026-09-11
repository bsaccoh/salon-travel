import { Server } from 'socket.io';
import { AuthenticatedSocket } from '../auth';
import { RoomManager } from '../rooms';
import { conversationService } from '../../modules/conversations/service';
import { createModuleLogger } from '../../config/logger';

const log = createModuleLogger('ws-chat-handler');

export function registerChatHandlers(_io: Server, socket: AuthenticatedSocket): void {
  const { userId, role } = socket.data.user;

  // 1. Join Conversation Room
  socket.on('chat:join', async (payload: { conversationId: string }, callback?: (ack: { success: boolean; error?: string }) => void) => {
    try {
      if (!payload?.conversationId) {
        callback?.({ success: false, error: 'conversationId is required' });
        return;
      }

      const joined = await RoomManager.joinConversationRoom(socket, payload.conversationId);
      if (joined) {
        callback?.({ success: true });
      } else {
        callback?.({ success: false, error: 'Unauthorized to join this conversation' });
      }
    } catch (err: any) {
      log.error({ err: err.message, userId }, 'Error in chat:join handler');
      callback?.({ success: false, error: 'Failed to join conversation room' });
    }
  });

  // 2. Send Message (Durable PostgreSQL Persistence Before Ack & Broadcast)
  socket.on(
    'chat:send',
    async (
      payload: { conversationId: string; content: string; attachments?: string[] },
      callback?: (ack: { success: boolean; messageId?: string; error?: string }) => void,
    ) => {
      try {
        if (!payload?.conversationId || !payload?.content?.trim()) {
          callback?.({ success: false, error: 'conversationId and content are required' });
          return;
        }

        // 1. Persist to DB FIRST
        const message = await conversationService.sendMessage(
          userId,
          role,
          payload.conversationId,
          {
            content: payload.content.trim(),
            attachments: payload.attachments || [],
          },
        );

        // 2. Acknowledge sender with persisted message ID
        callback?.({
          success: true,
          messageId: message.id,
        });

        log.debug({ messageId: message.id, conversationId: payload.conversationId }, 'Chat message persisted and acknowledged');
      } catch (err: any) {
        log.error({ err: err.message, userId, conversationId: payload?.conversationId }, 'chat:send failed');
        callback?.({ success: false, error: err.message || 'Failed to deliver message' });
      }
    },
  );

  // 3. Ephemeral Typing Indicator (No DB Persistence)
  socket.on(
    'chat:typing',
    (payload: { conversationId: string; isTyping: boolean }) => {
      if (!payload?.conversationId) return;

      // Broadcast to other members in the room, excluding sender
      socket.to(`conv:${payload.conversationId}`).emit('chat:typing', {
        conversationId: payload.conversationId,
        userId,
        isTyping: Boolean(payload.isTyping),
      });
    },
  );

  // 4. Read Receipts
  socket.on('chat:read', async (payload: { conversationId: string }) => {
    if (!payload?.conversationId) return;

    try {
      await conversationService.markRead(userId, payload.conversationId);
    } catch (err: any) {
      log.warn({ err: err.message, userId, conversationId: payload.conversationId }, 'Failed to mark messages read');
    }
  });
}
