'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { wsManager } from '@/lib/websocket-client';
import { Message } from '@/lib/types';

interface TypingState {
  userId: string;
  isTyping: boolean;
}

interface UseChatSocketOptions {
  conversationId: string | null;
  enabled?: boolean;
}

export function useChatSocket({ conversationId, enabled = true }: UseChatSocketOptions) {
  const queryClient = useQueryClient();
  const [typingUsers, setTypingUsers] = useState<Record<string, boolean>>({});
  const joinedRoomRef = useRef<string | null>(null);

  useEffect(() => {
    if (!conversationId || !enabled) return;

    const socket = wsManager.connect();

    wsManager.joinConversation(conversationId, (success) => {
      if (success) {
        joinedRoomRef.current = conversationId;
      }
    });

    const handleMessage = (msg: Message) => {
      if (msg.conversationId !== conversationId) return;

      queryClient.setQueryData<Message[]>(
        ['messages', conversationId],
        (old) => {
          if (!old) return [msg];
          if (old.some((m) => m.id === msg.id)) return old;
          return [...old, msg];
        },
      );

      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    };

    const handleTyping = (data: TypingState & { conversationId: string }) => {
      if (data.conversationId !== conversationId) return;
      setTypingUsers((prev) => ({ ...prev, [data.userId]: data.isTyping }));
    };

    const handleRead = (data: { conversationId: string; readerId: string; readAt: string }) => {
      if (data.conversationId !== conversationId) return;

      queryClient.setQueryData<Message[]>(
        ['messages', conversationId],
        (old) => {
          if (!old) return old;
          return old.map((m) =>
            m.senderId !== data.readerId
              ? { ...m, isRead: true, readAt: data.readAt }
              : m,
          );
        },
      );
    };

    socket.on('chat:message', handleMessage);
    socket.on('chat:typing', handleTyping);
    socket.on('chat:read', handleRead);

    return () => {
      socket.off('chat:message', handleMessage);
      socket.off('chat:typing', handleTyping);
      socket.off('chat:read', handleRead);
      joinedRoomRef.current = null;
    };
  }, [conversationId, enabled, queryClient]);

  const sendMessage = useCallback(
    (content: string, attachments: string[] = []) => {
      if (!conversationId) return;
      wsManager.sendMessage(conversationId, content, attachments);
    },
    [conversationId],
  );

  const sendTyping = useCallback(
    (isTyping: boolean) => {
      if (!conversationId) return;
      wsManager.sendTyping(conversationId, isTyping);
    },
    [conversationId],
  );

  const sendRead = useCallback(() => {
    if (!conversationId) return;
    wsManager.sendRead(conversationId);
  }, [conversationId]);

  const activeTypingUsers = Object.entries(typingUsers)
    .filter(([, v]) => v)
    .map(([k]) => k);

  return {
    sendMessage,
    sendTyping,
    sendRead,
    typingUsers: activeTypingUsers,
    isConnected: !!wsManager.getSocket()?.connected,
  };
}
