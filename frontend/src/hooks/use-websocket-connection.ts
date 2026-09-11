'use client';

import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/lib/auth-context';
import { wsManager } from '@/lib/websocket-client';

export function useWebSocketConnection() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!user) return;

    const socket = wsManager.connect();

    const handleNewConversation = () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    };

    const handleConversationUpdated = () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    };

    socket.on('conversation:created', handleNewConversation);
    socket.on('conversation:assigned', handleConversationUpdated);
    socket.on('conversation:released', handleConversationUpdated);
    socket.on('conversation:reassigned', handleConversationUpdated);
    socket.on('conversation:emergency', handleConversationUpdated);
    socket.on('conversation:emergency_resolved', handleConversationUpdated);

    return () => {
      socket.off('conversation:created', handleNewConversation);
      socket.off('conversation:assigned', handleConversationUpdated);
      socket.off('conversation:released', handleConversationUpdated);
      socket.off('conversation:reassigned', handleConversationUpdated);
      socket.off('conversation:emergency', handleConversationUpdated);
      socket.off('conversation:emergency_resolved', handleConversationUpdated);
      wsManager.disconnect();
    };
  }, [user, queryClient]);
}
