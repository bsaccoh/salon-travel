'use client';

import React, { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { Message } from '@/lib/types';

interface ChatAreaProps {
  conversationId: string;
  messages: Message[];
  typingUsers?: string[];
}

export function ChatArea({ conversationId, messages, typingUsers = [] }: ChatAreaProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div ref={scrollRef} className="flex-1 overflow-y-auto custom-scrollbar px-[28px] py-[24px] bg-[#FCFDFD]">
      <div className="flex flex-col space-y-[18px] max-w-4xl mx-auto">
        {messages.map((msg, index) => {
          const prevMsg = messages[index - 1];
          const isSameSender = prevMsg && prevMsg.senderId === msg.senderId;
          const isConcierge = msg.sender?.role === 'concierge' || msg.sender?.role === 'admin';
          const senderName = msg.sender?.fullName || (isConcierge ? 'Concierge' : 'Traveler');
          const time = new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

          return (
            <div key={msg.id} className={cn("flex w-full", {
              "justify-start": !isConcierge,
              "justify-end": isConcierge,
              "mt-2": isSameSender,
            })}>
              {!isConcierge && (
                <div className="flex flex-col items-start w-full max-w-[68%] xl:max-w-[580px]">
                  {!isSameSender && (
                    <span className="text-[11px] text-[#7A8A91] mb-1.5 ml-1 font-medium">{senderName}</span>
                  )}
                  <div className="bg-[#F5F7F8] border border-[#E5ECEE] px-4 py-3 rounded-[16px] rounded-tl-[4px] text-[14px] text-[#14232B] leading-[1.5]">
                    {msg.content}
                  </div>
                  <span className="text-[11px] text-[#7A8A91] mt-1 ml-1 font-medium">{time}</span>
                </div>
              )}

              {isConcierge && (
                <div className="flex flex-col items-end w-full max-w-[68%] xl:max-w-[580px]">
                  <div className="bg-primary text-white px-4 py-3 rounded-[16px] rounded-tr-[4px] text-[14px] leading-[1.5]">
                    {msg.content}
                  </div>
                  <span className="text-[11px] text-[#7A8A91] mt-1 mr-1 font-medium">
                    {time} {msg.isRead && '• Read'}
                  </span>
                </div>
              )}
            </div>
          );
        })}

        {typingUsers.length > 0 && (
          <div className="flex items-center gap-2 text-[12px] text-text-muted italic mt-2 ml-1">
            <div className="flex gap-1 bg-[#F5F7F8] border border-[#E5ECEE] px-3 py-2 rounded-full items-center h-[32px]">
              <span className="w-1.5 h-1.5 rounded-full bg-text-muted/60 animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-1.5 h-1.5 rounded-full bg-text-muted/60 animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-1.5 h-1.5 rounded-full bg-text-muted/60 animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
            <span className="font-medium text-[#7A8A91]">Typing...</span>
          </div>
        )}
      </div>
    </div>
  );
}
