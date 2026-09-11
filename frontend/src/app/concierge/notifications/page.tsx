'use client';

import React from 'react';
import { ConciergeSidebar } from '@/components/concierge/sidebar';
import { Bell, Info, ShieldAlert, CreditCard, Calendar, CheckCircle2, Loader2, UserCheck, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAdminActivity } from '@/hooks/use-admin';
import { ErrorState } from '@/components/ui/error-state';

function classifyEvent(action: string, resource: string) {
  if (resource === 'booking' && (action === 'cancel' || action === 'cancel_booking'))
    return 'emergency';
  if (resource === 'payment' || resource === 'refund') return 'payment';
  if (resource === 'booking') return 'booking';
  if (resource === 'provider') return 'provider';
  return 'system';
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins} min${mins > 1 ? 's' : ''} ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hour${hrs > 1 ? 's' : ''} ago`;
  const days = Math.floor(hrs / 24);
  return `${days} day${days > 1 ? 's' : ''} ago`;
}

export default function ConciergeNotificationsPage() {
  const { data: events, isLoading, error, refetch } = useAdminActivity();

  return (
    <div className="grid grid-rows-1 h-screen overflow-hidden bg-background text-text grid-cols-[80px_1fr] lg:grid-cols-[260px_1fr]">
      <ConciergeSidebar />
      <main className="min-h-0 flex-1 flex flex-col min-w-0 h-full overflow-y-auto bg-[#FAFCFC]">
        <div className="px-8 py-6 border-b border-border bg-surface sticky top-0 z-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-text flex items-center gap-2">
                <Bell className="w-6 h-6" /> Notifications
              </h1>
              <p className="text-sm text-text-muted mt-1">Review system alerts, task updates, and automated flags.</p>
            </div>
            <Button variant="outline" size="sm" className="font-bold gap-2">
              <CheckCircle2 className="w-4 h-4" /> Mark all as read
            </Button>
          </div>
        </div>

        <div className="p-8 max-w-[800px] w-full mx-auto space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-20 text-primary">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
          ) : error ? (
            <ErrorState onRetry={() => refetch()} />
          ) : (events || []).length === 0 ? (
            <div className="text-center py-20 text-text-muted text-sm font-medium">
              No activity events yet.
            </div>
          ) : (
            (events || []).map((evt) => {
              const type = classifyEvent(evt.action, evt.resource);
              const Icon =
                type === 'emergency' ? ShieldAlert :
                type === 'payment' ? CreditCard :
                type === 'booking' ? Calendar :
                type === 'provider' ? UserCheck : Info;

              const colorClass =
                type === 'emergency' ? 'text-danger bg-danger/10 border-danger/20' :
                type === 'payment' ? 'text-warning bg-warning/10 border-warning/20' :
                type === 'booking' ? 'text-primary bg-primary-light border-primary/20' :
                type === 'provider' ? 'text-success bg-success/10 border-success/20' :
                'text-text-muted bg-slate-light border-border';

              const title = `${evt.action.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())} — ${evt.resource}`;
              const message = `${evt.actorName}${evt.actorRole ? ` (${evt.actorRole})` : ''} performed this action${evt.resourceId ? ` on ${evt.resource} ${evt.resourceId.slice(0, 8)}` : ''}.`;

              return (
                <div
                  key={evt.id}
                  className="relative bg-surface border border-border rounded-xl p-5 shadow-sm transition-colors"
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border ${colorClass}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 pr-6">
                      <h3 className="font-bold text-sm text-text">{title}</h3>
                      <p className="text-sm text-text-muted mt-1">{message}</p>
                      <p className="text-xs font-semibold text-text-muted/60 mt-3 uppercase tracking-wider">{timeAgo(evt.createdAt)}</p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </main>
    </div>
  );
}
