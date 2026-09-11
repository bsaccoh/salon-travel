'use client';

import React, { useState } from 'react';
import { Send, Paperclip, CreditCard, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function MessageComposer({ conversationId, onSendMessage, onTyping }: { conversationId: string, onSendMessage?: (text: string) => void, onTyping?: (isTyping: boolean) => void }) {
  const [text, setText] = useState('');
  const typingTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSend = () => {
    if (text.trim() && onSendMessage) {
      onSendMessage(text);
      setText('');
      onTyping?.(false);
    }
  };

  const handleChange = (value: string) => {
    setText(value);
    onTyping?.(true);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => onTyping?.(false), 2000);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const insertText = (str: string) => {
    setText(prev => prev ? `${prev} ${str}` : str);
  };

  return (
    <div className="shrink-0 bg-[#FAFCFC] border-t border-[#E5ECEE] sticky bottom-0 z-20">
      {/* Quick Action Chips */}
      <div className="flex items-center gap-[8px] px-4 py-2.5 overflow-x-auto scrollbar-hide border-b border-[#E5ECEE]">
        <button 
          onClick={() => insertText("Here are your provider options:")}
          className="flex items-center justify-center gap-1.5 px-3 h-[34px] rounded-[10px] border border-[#E5ECEE] bg-[#FFFFFF] hover:border-primary hover:text-primary transition-colors text-[12px] font-semibold text-[#7A8A91] whitespace-nowrap"
        >
          <Calendar className="w-3.5 h-3.5" />
          Share Provider Options
        </button>
        <button 
          onClick={() => insertText("Please use this link to complete your payment:")}
          className="flex items-center justify-center gap-1.5 px-3 h-[34px] rounded-[10px] border border-[#E5ECEE] bg-[#FFFFFF] hover:border-primary hover:text-primary transition-colors text-[12px] font-semibold text-[#7A8A91] whitespace-nowrap"
        >
          <CreditCard className="w-3.5 h-3.5" />
          Send Payment Link
        </button>
      </div>

      <div className="px-4 py-3 pb-4">
        <div className="relative flex items-end gap-2 bg-[#FFFFFF] border border-[#D9E4E7] rounded-[12px] p-2 focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all min-h-[52px]">
          <button className="p-2 text-text-muted hover:text-text rounded-lg hover:bg-surface shrink-0 self-end mb-0.5">
            <Paperclip className="w-5 h-5" />
          </button>
          
          <textarea 
            placeholder="Type a message... (Press Enter to send)"
            className="flex-1 max-h-[120px] min-h-[34px] bg-transparent text-[14px] text-text focus:outline-none resize-none py-1.5 leading-[1.5] custom-scrollbar self-center"
            rows={1}
            value={text}
            onChange={(e) => handleChange(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          
          <Button 
            onClick={handleSend}
            variant="primary" 
            className="shrink-0 rounded-full h-[42px] w-[42px] p-0 flex items-center justify-center self-end bg-[#0E4C5B] hover:bg-primary-dark"
          >
            <Send className="w-4 h-4 ml-0.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
