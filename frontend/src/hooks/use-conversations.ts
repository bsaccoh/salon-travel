'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { Conversation, Message } from '@/lib/types';

export function useMyConversations() {
  return useQuery({
    queryKey: ['conversations', 'mine'],
    queryFn: () => apiClient.get<Conversation[]>('/conversations/mine'),
    select: (res) => res.data,
  });
}

export function useConversationInbox() {
  return useQuery({
    queryKey: ['conversations', 'inbox'],
    queryFn: () => apiClient.get<Conversation[]>('/conversations/inbox'),
    select: (res) => res.data,
  });
}

export function useConversation(id: string) {
  return useQuery({
    queryKey: ['conversation', id],
    queryFn: () => apiClient.get<Conversation>(`/conversations/${id}`),
    select: (res) => res.data,
    enabled: !!id,
  });
}

export function useConversationMessages(conversationId: string) {
  return useQuery({
    queryKey: ['messages', conversationId],
    queryFn: () => apiClient.get<Message[]>(`/conversations/${conversationId}/messages`),
    select: (res) => res.data,
    enabled: !!conversationId,
  });
}

export function useCreateConversation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { bookingId?: string; subject?: string; message: string }) =>
      apiClient.post<Conversation>('/conversations', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });
}

export function useSendMessage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ conversationId, content }: { conversationId: string; content: string }) =>
      apiClient.post<Message>(`/conversations/${conversationId}/messages`, { content }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['messages', variables.conversationId] });
    },
  });
}

export function useMarkRead() {
  return useMutation({
    mutationFn: (conversationId: string) =>
      apiClient.post(`/conversations/${conversationId}/read`),
  });
}
