'use client';

import React from 'react';
import { AdminSidebar } from '@/components/dashboard/admin-sidebar';
import { AdminTopbar } from '@/components/dashboard/admin-topbar';
import { History, User, Loader2 } from 'lucide-react';
import { useAdminActivity } from '@/hooks/use-admin';
import { ErrorState } from '@/components/ui/error-state';

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function AdminAuditPage() {
  const { data: events, isLoading, error, refetch } = useAdminActivity();

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />
      <main className="flex-1 p-8 overflow-y-auto">
        <AdminTopbar title="Audit Logs" subtitle="System-wide security and activity logging" />

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : error ? (
          <ErrorState message="Could not load audit logs." onRetry={() => refetch()} />
        ) : !events?.length ? (
          <div className="flex flex-col items-center justify-center py-20 text-text-muted">
            <History className="w-12 h-12 mb-3 text-border" />
            <h3 className="text-base font-bold text-text mb-1">No activity recorded yet</h3>
            <p className="text-xs">System events will appear here as users interact with the platform.</p>
          </div>
        ) : (
          <div className="rounded-2xl border border-border bg-surface shadow-card overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-border bg-background/50">
                  <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-text-muted">Time</th>
                  <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-text-muted">Actor</th>
                  <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-text-muted">Action</th>
                  <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-text-muted">Resource</th>
                </tr>
              </thead>
              <tbody>
                {events.map((event) => (
                  <tr key={event.id} className="border-b border-border/50 hover:bg-background/30 transition-colors">
                    <td className="px-4 py-3 text-xs text-text-muted whitespace-nowrap">{timeAgo(event.createdAt)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                          <User className="w-3 h-3 text-primary" />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-text">{event.actorName}</p>
                          {event.actorRole && <p className="text-[10px] text-text-muted">{event.actorRole}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-medium text-text bg-background px-2 py-0.5 rounded-md">{event.action}</span>
                    </td>
                    <td className="px-4 py-3 text-xs text-text-muted">
                      {event.resource}{event.resourceId ? ` #${event.resourceId.slice(0, 8)}` : ''}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
