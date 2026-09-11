'use client';

import React from 'react';
import { AdminSidebar } from '@/components/dashboard/admin-sidebar';
import { AdminTopbar } from '@/components/dashboard/admin-topbar';
import { Headset, Inbox, UserCircle2, AlertTriangle, Calendar, Loader2 } from 'lucide-react';
import { KPICard } from '@/components/ui/kpi-card';
import { useConciergeStats } from '@/hooks/use-admin';
import { ErrorState } from '@/components/ui/error-state';

export default function AdminConciergePage() {
  const { data: stats, isLoading, error, refetch } = useConciergeStats();

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />
      <main className="flex-1 p-8 overflow-y-auto">
        <AdminTopbar title="Concierge" subtitle="Manage emergency cases and traveler support" />

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : error ? (
          <ErrorState message="Could not load concierge stats." onRetry={() => refetch()} />
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
              <KPICard
                label="Unclaimed"
                value={String(stats?.unclaimedConversations ?? 0)}
                icon={Inbox}
                iconBgColor="bg-warning-light text-warning"
              />
              <KPICard
                label="My Conversations"
                value={String(stats?.myConversations ?? 0)}
                icon={Headset}
                iconBgColor="bg-primary-light text-primary"
              />
              <KPICard
                label="Open Cases"
                value={String(stats?.openCases ?? 0)}
                icon={UserCircle2}
                iconBgColor="bg-accent-light text-accent"
              />
              <KPICard
                label="Emergencies"
                value={String(stats?.emergencyConversations ?? 0)}
                icon={AlertTriangle}
                iconBgColor="bg-danger/10 text-danger"
              />
              <KPICard
                label="Today's Bookings"
                value={String(stats?.todaysBookings ?? 0)}
                icon={Calendar}
                iconBgColor="bg-success-light text-success"
              />
            </div>

            <div className="rounded-2xl border border-border bg-surface shadow-card p-8 text-center">
              <Headset className="w-10 h-10 text-text-muted mx-auto mb-3" />
              <h3 className="text-base font-bold text-text mb-1">Concierge management panel coming soon</h3>
              <p className="text-xs text-text-muted max-w-md mx-auto">
                Agent assignment, shift scheduling, and SLA tracking will be available in a future update.
              </p>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
