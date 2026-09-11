'use client';

import React from 'react';
import { ConversationCard } from './conversation-card';
import { Loader2 } from 'lucide-react';
import { Conversation } from '@/lib/types';

function formatTimeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function mapConversation(conv: Conversation) {
  const lastMsg = conv.messages?.[conv.messages.length - 1];
  return {
    id: conv.id,
    travelerName: conv.traveler?.fullName || 'Traveler',
    bookingRef: conv.booking ? `ST-${conv.booking.id.slice(0, 6).toUpperCase()}` : undefined,
    lastMessage: lastMsg?.content || conv.subject || 'No messages yet',
    time: formatTimeAgo(conv.updatedAt),
    unreadCount: 0,
    isEmergency: conv.isEmergency,
    assignmentState: conv.concierge
      ? `Assigned to ${conv.concierge.fullName.split(' ')[0]}`
      : 'Unassigned',
    isOnline: false,
    waitingTime: conv.conciergeId ? undefined : formatTimeAgo(conv.createdAt),
  };
}

export function ConversationList({
  activeId,
  onSelect,
  filter,
  conversations,
  isLoading,
}: {
  activeId: string;
  onSelect: (id: string) => void;
  filter: string;
  conversations?: Conversation[];
  isLoading?: boolean;
}) {
  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="w-5 h-5 animate-spin text-primary" />
      </div>
    );
  }

  const filtered = (conversations || []).filter((conv) => {
    if (filter === 'unclaimed') return !conv.conciergeId;
    if (filter === 'mine') return !!conv.conciergeId;
    if (filter === 'emergency') return conv.isEmergency;
    if (filter === 'closed') return conv.isClosed;
    return true;
  });

  const mapped = filtered.map(mapConversation);

  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2">
      {mapped.length === 0 ? (
        <div className="text-center py-8 text-xs text-text-muted">
          No conversations found.
        </div>
      ) : (
        mapped.map((conv) => (
          <ConversationCard
            key={conv.id}
            data={conv}
            isActive={activeId === conv.id}
            onClick={() => onSelect(conv.id)}
          />
        ))
      )}
    </div>
  );
}
