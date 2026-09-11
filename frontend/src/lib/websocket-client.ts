'use client';

import { io, Socket } from 'socket.io-client';
import { apiClient } from './api-client';

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3000';

class WebSocketManager {
  private socket: Socket | null = null;
  private currentConversationId: string | null = null;

  connect(): Socket {
    if (this.socket && this.socket.connected) {
      return this.socket;
    }

    const token = apiClient.getAccessToken();

    this.socket = io(WS_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });

    this.socket.on('connect', () => {
      if (this.currentConversationId) {
        this.joinConversation(this.currentConversationId);
      }
    });

    return this.socket;
  }

  joinConversation(conversationId: string, onAck?: (success: boolean) => void) {
    if (!this.socket) this.connect();
    this.currentConversationId = conversationId;
    this.socket?.emit('chat:join', { conversationId }, (ack: { success: boolean }) => {
      onAck?.(ack?.success || false);
    });
  }

  sendMessage(
    conversationId: string,
    content: string,
    attachments: string[] = [],
    onAck?: (res: { success: boolean; messageId?: string; error?: string }) => void,
  ) {
    if (!this.socket) this.connect();
    this.socket?.emit('chat:send', { conversationId, content, attachments }, onAck);
  }

  sendTyping(conversationId: string, isTyping: boolean) {
    if (!this.socket) this.connect();
    this.socket?.emit('chat:typing', { conversationId, isTyping });
  }

  sendRead(conversationId: string) {
    if (!this.socket) this.connect();
    this.socket?.emit('chat:read', { conversationId });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.currentConversationId = null;
    }
  }

  getSocket() {
    return this.socket;
  }
}

export const wsManager = new WebSocketManager();
