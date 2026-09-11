'use client';

import React, { useState } from 'react';
import { ConciergeSidebar } from '@/components/concierge/sidebar';
import { InboxFilters } from '@/components/concierge/inbox-filters';
import { ConversationList } from '@/components/concierge/conversation-list';
import { ConversationHeader } from '@/components/concierge/conversation-header';
import { ChatArea } from '@/components/concierge/chat-area';
import { MessageComposer } from '@/components/concierge/message-composer';
import { TravelerProfileCard } from '@/components/concierge/traveler-profile-card';
import { BookingContextCard } from '@/components/concierge/booking-context-card';
import { PaymentSummaryCard } from '@/components/concierge/payment-summary-card';
import { ConciergeActionsCard } from '@/components/concierge/concierge-actions-card';
import { useConversationInbox, useConversationMessages } from '@/hooks/use-conversations';
import { useChatSocket } from '@/hooks/use-chat-socket';

export default function ConciergeInboxPage() {
  const [activeFilter, setActiveFilter] = useState('unclaimed');
  const [selectedConversationId, setSelectedConversationId] = useState('');

  const { data: conversations, isLoading: convsLoading } = useConversationInbox();
  const { data: messages } = useConversationMessages(selectedConversationId || '');
  const { sendMessage: wsSendMessage, sendTyping, sendRead, typingUsers } = useChatSocket({
    conversationId: selectedConversationId || null,
    enabled: !!selectedConversationId,
  });

  const handleSendMessage = (text: string) => {
    if (!text.trim() || !selectedConversationId) return;
    wsSendMessage(text);
  };

  return (
    <div className="grid grid-rows-1 h-screen overflow-hidden bg-background text-text selection:bg-primary-light selection:text-primary-dark grid-cols-[80px_360px_1fr] lg:grid-cols-[260px_360px_1fr] 2xl:grid-cols-[260px_360px_1fr_380px] min-[1800px]:grid-cols-[260px_380px_1fr_400px]">
      <ConciergeSidebar />

      {/* PANEL 1: Left Inbox (360px) */}
        <section className="min-h-0 min-w-0 w-full border-r border-border bg-surface flex flex-col h-full z-10 shadow-sm relative overflow-hidden">
          <div className="pt-5 pb-3 px-5 border-b border-border shrink-0 h-[72px] flex items-center justify-between">
            <h1 className="text-2xl font-bold text-text">Inbox</h1>
            <span className="bg-primary/10 text-primary-dark font-bold text-xs px-2 py-0.5 rounded-full">
              {(conversations || []).length} total
            </span>
          </div>
          <div className="px-4 py-3 shrink-0">
            <InboxFilters active={activeFilter} onChange={setActiveFilter} />
          </div>
          <ConversationList
            activeId={selectedConversationId}
            onSelect={setSelectedConversationId}
            filter={activeFilter}
            conversations={conversations}
            isLoading={convsLoading}
          />
        </section>

        {/* PANEL 2: Center Chat Area */}
        <section className="min-h-0 min-w-0 w-full flex flex-col bg-background h-full overflow-hidden">
          <ConversationHeader conversationId={selectedConversationId} />
          <ChatArea conversationId={selectedConversationId} messages={messages || []} typingUsers={typingUsers} />
          <MessageComposer conversationId={selectedConversationId} onSendMessage={handleSendMessage} onTyping={sendTyping} />
        </section>

        {/* PANEL 3: Right Context */}
        <section className="min-h-0 w-full border-l border-border bg-[#F7FAFA] flex flex-col overflow-y-auto custom-scrollbar p-5 pb-20 space-y-4 hidden 2xl:flex relative">
          <div>
            <h2 className="text-xs font-bold text-text mb-4 uppercase tracking-wider text-text-muted">Traveler Context</h2>
            <TravelerProfileCard />
          </div>
          
          <div>
            <h2 className="text-xs font-bold text-text mb-4 uppercase tracking-wider text-text-muted">Booking Details</h2>
            <BookingContextCard />
          </div>
          
          <PaymentSummaryCard />
          
          <div>
            <h2 className="text-xs font-bold text-text mb-4 uppercase tracking-wider text-text-muted">Operations</h2>
            <ConciergeActionsCard />
          </div>
        </section>
    </div>
  );
}
