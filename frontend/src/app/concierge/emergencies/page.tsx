'use client';

import React from 'react';
import { ConciergeSidebar } from '@/components/concierge/sidebar';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Search, ChevronDown, AlertTriangle, ShieldAlert, Clock, MessageCircle, Loader2 } from 'lucide-react';
import { useConversationInbox } from '@/hooks/use-conversations';
import { ErrorState } from '@/components/ui/error-state';

export default function ConciergeEmergenciesPage() {
  const { data: conversations, isLoading, error, refetch } = useConversationInbox();

  const emergencies = (conversations || []).filter((c: any) => c.isEmergency);
  const activeEmergencies = emergencies.filter((c: any) => !c.isClosed);
  const unassigned = activeEmergencies.filter((c: any) => !c.conciergeId);

  return (
    <div className="grid grid-rows-1 h-screen overflow-hidden bg-background text-text grid-cols-[80px_1fr] lg:grid-cols-[260px_1fr]">
      <ConciergeSidebar />
      <main className="min-h-0 flex-1 flex flex-col min-w-0 h-full overflow-y-auto bg-[#FAFCFC]">
        {/* Page Header */}
        <div className="px-8 py-6 border-b border-border bg-surface sticky top-0 z-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-danger flex items-center gap-2">
                <ShieldAlert className="w-6 h-6" /> Emergencies
              </h1>
              <p className="text-sm text-text-muted mt-1">Actively manage and resolve critical traveler escalations.</p>
            </div>
          </div>
        </div>

        <div className="p-8 max-w-[1400px] w-full mx-auto space-y-6">
          {/* Summary KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-surface border border-danger/30 bg-danger/5 rounded-xl p-5 shadow-sm border-l-4 border-l-danger">
              <div className="text-2xl font-extrabold text-danger">{activeEmergencies.length}</div>
              <div className="text-xs font-semibold text-danger uppercase tracking-wider mt-1">Active Emergencies</div>
            </div>
            <div className="bg-surface border border-border rounded-xl p-5 shadow-sm">
              <div className="text-2xl font-extrabold text-text">{unassigned.length}</div>
              <div className="text-xs font-semibold text-text-muted uppercase tracking-wider mt-1">Unassigned Critical Cases</div>
            </div>
            <div className="bg-surface border border-border rounded-xl p-5 shadow-sm">
              <div className="text-2xl font-extrabold text-text">{emergencies.length}</div>
              <div className="text-xs font-semibold text-text-muted uppercase tracking-wider mt-1">Total Emergency Cases</div>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="bg-surface border border-border rounded-xl p-2 shadow-sm flex flex-wrap items-center gap-2">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input
                type="text"
                placeholder="Search emergency cases..."
                className="w-full pl-9 pr-4 py-2 bg-transparent text-sm focus:outline-none placeholder:text-text-muted"
              />
            </div>
          </div>

          {/* Directory Table */}
          {error ? (
            <ErrorState onRetry={() => refetch()} />
          ) : (
          <div className="bg-surface border border-border rounded-xl shadow-sm overflow-hidden">
            {isLoading ? (
              <div className="flex items-center justify-center py-12 text-primary">
                <Loader2 className="w-6 h-6 animate-spin" />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Subject</TableHead>
                    <TableHead>Traveler</TableHead>
                    <TableHead>Assignee</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {emergencies.length > 0 ? (
                    emergencies.map((c: any) => (
                      <TableRow key={c.id} className="bg-danger/5 hover:bg-danger/10">
                        <TableCell>
                          <div className="flex items-center gap-1.5 text-sm font-bold text-danger">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            <span>{c.subject || 'Emergency'}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm font-semibold">{c.traveler?.fullName || '—'}</span>
                        </TableCell>
                        <TableCell>
                          <span className={`text-sm font-semibold ${!c.conciergeId ? 'text-danger' : 'text-text'}`}>
                            {c.concierge?.fullName || 'Unassigned'}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5 text-sm font-medium text-text-muted">
                            <Clock className="w-3.5 h-3.5" />
                            <span>{new Date(c.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                            c.isClosed ? 'bg-success/10 text-success' :
                            !c.conciergeId ? 'bg-danger text-white' : 'bg-warning/20 text-warning-dark'
                          }`}>
                            {c.isClosed ? 'Resolved' : !c.conciergeId ? 'Action Required' : 'In Progress'}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="primary"
                            size="sm"
                            className="font-bold gap-1.5 h-8"
                            onClick={() => window.location.href = `/concierge/inbox?id=${c.id}`}
                          >
                            <MessageCircle className="w-3.5 h-3.5" /> Open
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-12">
                        <div className="flex flex-col items-center justify-center text-text-muted space-y-3">
                          <ShieldAlert className="w-10 h-10 opacity-20" />
                          <p className="font-medium text-sm">No active emergencies found.</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </div>
          )}
        </div>
      </main>
    </div>
  );
}
