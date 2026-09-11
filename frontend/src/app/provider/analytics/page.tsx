'use client';

import React from 'react';
import { ProviderSidebar } from '@/components/dashboard/provider-sidebar';
import { BarChart3, Eye, Star, CalendarCheck2, Loader2 } from 'lucide-react';
import { KPICard } from '@/components/ui/kpi-card';
import { useProviderDashboard } from '@/hooks/use-providers';

export default function ProviderAnalyticsPage() {
  const { data: dashboard } = useProviderDashboard();

  return (
    <div className="flex min-h-screen bg-background">
      <ProviderSidebar />
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-text flex items-center gap-2">
            <BarChart3 className="w-6 h-6" /> Performance Analytics
          </h1>
          <p className="text-xs text-text-muted mt-1">
            Monitor your booking trends, ratings, and traveler engagement metrics.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <KPICard
            label="Total Bookings"
            value={dashboard ? String((dashboard.pendingRequests || 0) + (dashboard.upcomingBookings || 0) + (dashboard.completedBookings || 0)) : '—'}
            icon={CalendarCheck2}
            iconBgColor="bg-primary-light text-primary"
          />
          <KPICard
            label="Completed"
            value={dashboard ? String(dashboard.completedBookings) : '—'}
            icon={CalendarCheck2}
            iconBgColor="bg-success-light text-success"
          />
          <KPICard
            label="Average Rating"
            value={dashboard?.averageRating ? dashboard.averageRating.toFixed(1) : '—'}
            icon={Star}
            iconBgColor="bg-warning-light text-warning"
          />
          <KPICard
            label="Profile Views"
            value="—"
            icon={Eye}
            subtext="Coming soon"
            iconBgColor="bg-accent-light text-accent"
          />
        </div>

        <div className="rounded-2xl border border-border bg-surface shadow-card p-8 text-center">
          <BarChart3 className="w-10 h-10 text-text-muted mx-auto mb-3" />
          <h3 className="text-base font-bold text-text mb-1">Detailed analytics coming soon</h3>
          <p className="text-xs text-text-muted max-w-md mx-auto">
            Booking trends, conversion rates, and traveler demographics will appear here as your booking history grows.
          </p>
        </div>
      </main>
    </div>
  );
}
