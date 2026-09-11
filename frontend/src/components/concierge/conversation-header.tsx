'use client';

import React from 'react';
import { MoreVertical, CheckCircle2, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useConversation } from '@/hooks/use-conversations';

export function ConversationHeader({ conversationId }: { conversationId: string }) {
  const { data: conversation } = useConversation(conversationId);

  const travelerName = conversation?.traveler?.fullName || 'Select a conversation';
  const initial = travelerName.charAt(0);
  const assignmentLabel = conversation?.concierge
    ? `Assigned to ${conversation.concierge.fullName}`
    : 'Unassigned';

  return (
    <div className="h-[72px] shrink-0 border-b border-border bg-[#FFFFFF] flex items-center justify-between px-6 z-10">
      <div className="flex items-center gap-3 min-w-0">
        <div className="relative shrink-0">
          <div className="w-11 h-11 rounded-full bg-primary-light flex items-center justify-center text-primary-dark font-bold text-lg">
            {initial}
          </div>
          <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-success border-2 border-[#FFFFFF]"></span>
        </div>
        <div className="flex flex-col justify-center min-w-0">
          <div className="flex items-center gap-2 leading-tight">
            <h2 className="text-[15px] font-bold text-text truncate">
              {travelerName}
            </h2>
            {conversation?.booking && (
              <span className="shrink-0 text-[11px] font-mono font-medium text-text-muted bg-surface px-1.5 py-0.5 rounded border border-border">
                {conversation.booking.id.slice(0, 8)}
              </span>
            )}
          </div>
          <div className="text-[12px] text-text-muted mt-0.5 flex items-center gap-1.5 font-medium min-w-0">
            <span className="truncate">{conversation?.subject || ''}</span>
            <span className="shrink-0">&bull;</span>
            <span className={`shrink-0 font-bold ${conversation?.concierge ? 'text-success' : 'text-warning-hover'}`}>
              {assignmentLabel}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0 ml-2">
        <Button variant="outline" className="h-[40px] px-3 font-bold text-[13px] 2xl:hidden flex items-center gap-2 border-[#E5ECEE]">
          <Menu className="w-4 h-4" />
          <span className="hidden sm:inline">Context</span>
        </Button>
        {!conversation?.conciergeId && (
          <Button variant="primary" className="h-[40px] px-4 font-bold text-[13px] whitespace-nowrap">
            Claim Conversation
          </Button>
        )}
        <Button variant="outline" className="h-[40px] px-4 font-bold text-[13px] hidden md:flex whitespace-nowrap">
          Create Booking
        </Button>
        <Button variant="ghost" className="h-[40px] w-[40px] p-0 text-text-muted hover:text-text rounded-[10px]">
          <MoreVertical className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
}
