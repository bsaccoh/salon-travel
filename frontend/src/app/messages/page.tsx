'use client';

import React, { useState, useEffect, useRef } from 'react';
import { TravelerHeader } from '@/components/traveler/header';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth-context';
import { useMyConversations, useConversationMessages } from '@/hooks/use-conversations';
import { useChatSocket } from '@/hooks/use-chat-socket';
import { Message } from '@/lib/types';
import {
  Send,
  ShieldCheck,
  CheckCheck,
  Compass,
  Paperclip,
  Loader2,
  MessageSquare,
  Plus,
} from 'lucide-react';
import { useCreateConversation } from '@/hooks/use-conversations';

export default function TravelerMessagesPage() {
  const { user } = useAuth();
  const { data: conversations, isLoading: convsLoading } = useMyConversations();
  const createConversation = useCreateConversation();
  const [selectedConvId, setSelectedConvId] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [showNewConvForm, setShowNewConvForm] = useState(false);

  useEffect(() => {
    if (conversations?.length && !selectedConvId) {
      setSelectedConvId(conversations[0].id);
    }
  }, [conversations, selectedConvId]);

  const { data: messages, isLoading: msgsLoading } = useConversationMessages(selectedConvId || '');
  const { sendMessage: wsSendMessage, sendTyping, sendRead, typingUsers } = useChatSocket({
    conversationId: selectedConvId,
    enabled: !!selectedConvId,
  });

  const [inputContent, setInputContent] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (selectedConvId) sendRead();
  }, [selectedConvId, messages, sendRead]);

  const handleInputChange = (value: string) => {
    setInputContent(value);
    sendTyping(true);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => sendTyping(false), 2000);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputContent.trim() || !selectedConvId) return;

    wsSendMessage(inputContent.trim());
    setInputContent('');
    sendTyping(false);
  };

  const selectedConv = conversations?.find((c) => c.id === selectedConvId);

  return (
    <div className="flex flex-col h-screen bg-background">
      <TravelerHeader />

      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 flex flex-col min-h-0">
        {convsLoading ? (
          <div className="flex items-center justify-center py-20 text-primary">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
        ) : !conversations?.length ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center space-y-4 max-w-sm w-full">
              <MessageSquare className="w-12 h-12 text-primary mx-auto" />
              <h3 className="text-lg font-bold text-text">No conversations yet</h3>
              <p className="text-xs text-text-muted">
                Send us a message and our concierge team will get back to you.
              </p>
              {!showNewConvForm ? (
                <Button variant="traveler-cta" size="md" className="font-bold gap-2" onClick={() => setShowNewConvForm(true)}>
                  <Plus className="w-4 h-4" />
                  Message Our Concierge
                </Button>
              ) : (
                <div className="bg-surface border border-border rounded-2xl p-4 text-left space-y-3">
                  <p className="text-xs font-semibold text-text">How can we help you?</p>
                  <textarea
                    rows={3}
                    placeholder="Tell us about your trip, questions, or request..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="w-full rounded-lg border border-border bg-background p-3 text-sm text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => setShowNewConvForm(false)}>Cancel</Button>
                    <Button
                      variant="traveler-cta"
                      size="sm"
                      className="flex-1 font-bold"
                      isLoading={createConversation.isPending}
                      disabled={!newMessage.trim()}
                      onClick={async () => {
                        if (!newMessage.trim()) return;
                        try {
                          const res = await createConversation.mutateAsync({ message: newMessage.trim(), subject: 'Concierge enquiry' });
                          setSelectedConvId((res as any).data?.id || null);
                          setShowNewConvForm(false);
                          setNewMessage('');
                        } catch {}
                      }}
                    >
                      Send Message
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-surface rounded-2xl border border-border shadow-card flex-1 flex flex-col overflow-hidden min-h-0">
            {/* Chat Topbar */}
            <div className="p-4 px-6 border-b border-border/80 flex items-center justify-between bg-surface">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center font-bold shadow-sm">
                  <Compass className="w-5 h-5 text-warning" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-bold text-text">
                      {selectedConv?.subject || 'Salone Travel Live Concierge'}
                    </h2>
                    <span className="w-2 h-2 rounded-full bg-success" />
                  </div>
                  <p className="text-xs text-text-muted">
                    {selectedConv?.concierge?.fullName || 'Concierge Support'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="hidden sm:inline-flex items-center gap-1 text-xs font-semibold text-primary bg-primary-light px-2.5 py-1 rounded-full">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Verified Travel Support</span>
                </span>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-background/50">
              {msgsLoading ? (
                <div className="flex items-center justify-center py-12 text-primary">
                  <Loader2 className="w-6 h-6 animate-spin" />
                </div>
              ) : (
                (messages || []).map((msg: Message) => {
                  const isMe = msg.senderId === user?.id;
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                    >
                      <span className="text-[10px] font-semibold text-text-muted mb-1 px-1">
                        {isMe ? 'You' : msg.sender?.fullName || 'Concierge'}
                      </span>
                      <div
                        className={`max-w-md sm:max-w-lg p-4 rounded-2xl text-sm leading-relaxed ${
                          isMe
                            ? 'bg-primary-dark text-white rounded-br-none shadow-sm'
                            : 'bg-surface border border-border text-text rounded-bl-none shadow-xs'
                        }`}
                      >
                        <p>{msg.content}</p>
                        <div
                          className={`mt-1.5 flex items-center justify-end gap-1 text-[10px] ${
                            isMe ? 'text-white/60' : 'text-text-muted'
                          }`}
                        >
                          <span>
                            {new Date(msg.createdAt).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                          {isMe && msg.isRead && <CheckCheck className="w-3.5 h-3.5 text-warning" />}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Typing Indicator */}
            {typingUsers.length > 0 && (
              <div className="px-6 py-1.5 text-xs text-text-muted italic">
                Concierge is typing...
              </div>
            )}

            {/* Composer */}
            <form
              onSubmit={handleSendMessage}
              className="p-3 sm:p-4 border-t border-border bg-surface flex items-center gap-3"
            >
              <button
                type="button"
                className="p-2.5 rounded-lg text-text-muted hover:bg-slate-light hover:text-text transition-smooth"
              >
                <Paperclip className="w-5 h-5" />
              </button>

              <input
                type="text"
                placeholder="Type your message or trip question..."
                value={inputContent}
                onChange={(e) => handleInputChange(e.target.value)}
                className="flex-1 bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary transition-smooth"
              />

              <Button
                type="submit"
                variant="traveler-cta"
                size="md"
                className="h-11 px-5 font-bold"
                disabled={!inputContent.trim()}
              >
                <Send className="w-4 h-4 mr-1" />
                <span className="hidden sm:inline">Send</span>
              </Button>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}
