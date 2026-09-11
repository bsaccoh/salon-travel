'use client';

import React from 'react';
import { ConciergeSidebar } from '@/components/concierge/sidebar';
import { AlertCircle, Clock, Calendar, CheckCircle2, MessageSquare, ShieldAlert, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { useConciergeStats } from '@/hooks/use-admin';
import { useAdminBookings } from '@/hooks/use-admin';
import { useConversationInbox } from '@/hooks/use-conversations';

export default function ConciergeOverviewPage() {
  const { data: stats, isLoading: statsLoading } = useConciergeStats();
  const { data: bookings } = useAdminBookings({ limit: 5 });
  const { data: conversations } = useConversationInbox();

  const emergencyConvs = (conversations || []).filter((c: any) => c.isEmergency && !c.isClosed);

  return (
    <div className="grid grid-rows-1 h-screen overflow-hidden bg-background text-text grid-cols-[80px_1fr] lg:grid-cols-[260px_1fr]">
      <ConciergeSidebar />

      <main className="min-h-0 flex-1 flex flex-col min-w-0 h-full overflow-y-auto bg-[#FAFCFC]">
        {/* Page Header */}
        <div className="px-8 py-6 border-b border-border bg-surface sticky top-0 z-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-text">Dashboard</h1>
              <p className="text-sm text-text-muted mt-1">Monitor traveler conversations, bookings, emergencies and concierge workload.</p>
            </div>
          </div>
        </div>

        <div className="p-8 max-w-[1400px] w-full mx-auto space-y-8">
          {/* KPI Grid */}
          {statsLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
              <div className="bg-surface border border-border rounded-xl p-5 shadow-sm">
                <div className="text-2xl font-extrabold text-text">{stats?.unclaimedConversations ?? '—'}</div>
                <div className="text-xs font-semibold text-text-muted uppercase tracking-wider mt-1">Unclaimed</div>
              </div>
              <div className="bg-surface border border-border rounded-xl p-5 shadow-sm border-l-4 border-l-primary">
                <div className="text-2xl font-extrabold text-text">{stats?.myConversations ?? '—'}</div>
                <div className="text-xs font-semibold text-primary uppercase tracking-wider mt-1">Assigned to Me</div>
              </div>
              <div className="bg-surface border border-border rounded-xl p-5 shadow-sm">
                <div className="text-2xl font-extrabold text-text">{stats?.openCases ?? '—'}</div>
                <div className="text-xs font-semibold text-text-muted uppercase tracking-wider mt-1">Open Cases</div>
              </div>
              <div className="bg-surface border border-danger/30 bg-danger/5 rounded-xl p-5 shadow-sm border-l-4 border-l-danger">
                <div className="text-2xl font-extrabold text-danger">{stats?.emergencyConversations ?? '—'}</div>
                <div className="text-xs font-semibold text-danger uppercase tracking-wider mt-1">Emergencies</div>
              </div>
              <div className="bg-surface border border-border rounded-xl p-5 shadow-sm">
                <div className="text-2xl font-extrabold text-text">{stats?.todaysBookings ?? '—'}</div>
                <div className="text-xs font-semibold text-text-muted uppercase tracking-wider mt-1">Today's Bookings</div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            {/* Left Column (2/3) */}
            <div className="xl:col-span-2 space-y-8">

              {/* Attention Required */}
              <div className="bg-surface border border-border rounded-xl shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-border bg-background/50">
                  <h2 className="text-base font-bold text-text flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-warning" /> Attention Required
                  </h2>
                </div>
                <div className="divide-y divide-border/50">
                  <div className="p-5 flex items-center justify-between hover:bg-slate-light/30 transition-colors">
                    <div>
                      <h4 className="text-sm font-bold text-danger">Emergency Conversations</h4>
                      <p className="text-xs text-text-muted mt-1">{emergencyConvs.length} active emergencies currently require resolution</p>
                    </div>
                    <Button variant="outline" size="sm" className="text-xs font-bold border-danger/30 text-danger hover:bg-danger/10" onClick={() => window.location.href = '/concierge/emergencies'}>View</Button>
                  </div>
                  <div className="p-5 flex items-center justify-between hover:bg-slate-light/30 transition-colors">
                    <div>
                      <h4 className="text-sm font-bold text-text">Unclaimed Conversations</h4>
                      <p className="text-xs text-text-muted mt-1">{stats?.unclaimedConversations ?? 0} conversations awaiting assignment</p>
                    </div>
                    <Button variant="outline" size="sm" className="text-xs font-bold" onClick={() => window.location.href = '/concierge/inbox'}>View</Button>
                  </div>
                </div>
              </div>

              {/* Recent Bookings */}
              <div className="bg-surface border border-border rounded-xl shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-border bg-background/50 flex justify-between items-center">
                  <h2 className="text-base font-bold text-text flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-primary" /> Recent Bookings
                  </h2>
                  <Button variant="ghost" size="sm" className="text-xs font-bold text-primary" onClick={() => window.location.href = '/concierge/bookings'}>View All</Button>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Reference</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(bookings || []).slice(0, 5).map((b: any) => (
                      <TableRow key={b.id}>
                        <TableCell className="font-mono text-xs font-bold">{b.reference || b.id.slice(0, 8)}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            b.status === 'confirmed' ? 'bg-success/10 text-success' :
                            b.status === 'pending' ? 'bg-warning/10 text-warning' :
                            b.status === 'cancelled' ? 'bg-danger/10 text-danger' :
                            'bg-primary/10 text-primary'
                          }`}>{b.status}</span>
                        </TableCell>
                        <TableCell className="text-sm text-text-muted">
                          {new Date(b.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                        </TableCell>
                      </TableRow>
                    ))}
                    {(bookings || []).length === 0 && (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center py-8 text-xs text-text-muted">No bookings found.</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>

            </div>

            {/* Right Column (1/3) */}
            <div className="space-y-8">
              {/* Quick Stats */}
              <div className="bg-surface border border-border rounded-xl shadow-sm overflow-hidden p-6">
                <h2 className="text-base font-bold text-text mb-6">Quick Stats</h2>
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between items-end mb-2">
                      <span className="text-xs font-bold text-text-muted uppercase tracking-wider">Total Conversations</span>
                      <span className="text-xl font-extrabold text-text">{(conversations || []).length}</span>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between items-end mb-2">
                      <span className="text-xs font-bold text-text-muted uppercase tracking-wider">Open Cases</span>
                      <span className="text-xl font-extrabold text-text">{stats?.openCases ?? '—'}</span>
                    </div>
                  </div>
                  <div className="pt-4 border-t border-border flex justify-between items-center">
                    <div>
                      <div className="text-xl font-extrabold text-text">{stats?.todaysBookings ?? '—'}</div>
                      <div className="text-xs font-bold text-text-muted uppercase tracking-wider mt-0.5">Today's Bookings</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-extrabold text-danger">{stats?.emergencyConversations ?? 0}</div>
                      <div className="text-xs font-bold text-text-muted uppercase tracking-wider mt-0.5">Emergencies</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-surface border border-border rounded-xl shadow-sm overflow-hidden p-6">
                <h2 className="text-base font-bold text-text mb-6">Recent Activity</h2>
                <div className="space-y-6 relative before:absolute before:inset-0 before:ml-4 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-border before:via-border before:to-transparent">
                  {(conversations || []).slice(0, 4).map((c: any, i: number) => (
                    <div key={c.id} className="relative flex items-start gap-4">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 z-10 border-4 border-surface ${
                        c.isEmergency ? 'bg-danger/10 text-danger' : 'bg-primary-light text-primary'
                      }`}>
                        {c.isEmergency ? <ShieldAlert className="w-3.5 h-3.5" /> : <MessageSquare className="w-3.5 h-3.5" />}
                      </div>
                      <div className="flex-1 pb-1">
                        <p className="text-sm font-semibold text-text">
                          {c.isEmergency ? 'Emergency' : 'Conversation'} — {c.subject || 'General inquiry'}
                        </p>
                        <p className="text-xs text-text-muted mt-0.5">
                          {new Date(c.updatedAt || c.createdAt).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  ))}
                  {(conversations || []).length === 0 && (
                    <p className="text-xs text-text-muted text-center py-4">No recent activity.</p>
                  )}
                </div>
              </div>

            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
