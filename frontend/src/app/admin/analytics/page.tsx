'use client';

import React from 'react';
import { AdminSidebar } from '@/components/dashboard/admin-sidebar';
import { KPICard } from '@/components/ui/kpi-card';
import { ErrorState } from '@/components/ui/error-state';
import {
  DollarSign,
  TrendingUp,
  Users,
  Building2,
  Loader2,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';
import { useAdminDashboard, useAdminChart } from '@/hooks/use-admin';
import { formatCurrency } from '@/lib/currency';

export default function AdminAnalyticsPage() {
  const { data: stats, isLoading: statsLoading, error: statsError, refetch: refetchStats } = useAdminDashboard();
  const { data: chartRaw, isLoading: chartLoading, error: chartError, refetch: refetchChart } = useAdminChart();

  const isLoading = statsLoading || chartLoading;
  const error = statsError || chartError;

  const chartData = (chartRaw || []).map((d) => ({
    month: d.month,
    bookings: d.bookings,
    revenue: d.revenueCents / 100,
  }));

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />

      <main className="flex-1 p-8 overflow-y-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-text">Platform Analytics</h1>
          <p className="text-xs text-text-muted mt-1">
            Growth metrics, commission earnings, and booking trends
          </p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : error ? (
          <ErrorState message="Could not load analytics data." onRetry={() => { refetchStats(); refetchChart(); }} />
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <KPICard
                label="Gross Revenue"
                value={stats ? formatCurrency(stats.grossRevenueCents) : '—'}
                icon={DollarSign}
                iconBgColor="bg-primary-light text-primary"
              />
              <KPICard
                label="Platform Commission"
                value={stats ? formatCurrency(stats.commissionCents) : '—'}
                icon={TrendingUp}
                iconBgColor="bg-success-light text-success"
              />
              <KPICard
                label="Total Travelers"
                value={stats ? String(stats.totalTravelers) : '—'}
                icon={Users}
                iconBgColor="bg-warning-light text-warning"
              />
              <KPICard
                label="Active Providers"
                value={stats ? String(stats.approvedProviders) : '—'}
                icon={Building2}
                iconBgColor="bg-accent-light text-accent"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-7 p-6 rounded-2xl border border-border bg-surface shadow-card">
                <h3 className="text-base font-bold text-text mb-1">Booking & Revenue Trend</h3>
                <p className="text-xs text-text-muted mb-6">Monthly bookings and revenue</p>

                {chartData.length > 0 ? (
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E5ECEE" />
                        <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#5E7078' }} />
                        <YAxis tick={{ fontSize: 12, fill: '#5E7078' }} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#FFFFFF',
                            borderRadius: '10px',
                            border: '1px solid #E5ECEE',
                            fontSize: '12px',
                          }}
                        />
                        <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                        <Line type="monotone" dataKey="bookings" stroke="#1C8FA6" strokeWidth={3} name="Bookings" />
                        <Line type="monotone" dataKey="revenue" stroke="#F2B84B" strokeWidth={3} name="Revenue (Le)" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <p className="text-xs text-text-muted text-center py-10">No chart data available yet.</p>
                )}
              </div>

              <div className="lg:col-span-5 p-6 rounded-2xl border border-border bg-surface shadow-card">
                <h3 className="text-base font-bold text-text mb-1">Bookings by Status</h3>
                <p className="text-xs text-text-muted mb-6">Current distribution</p>

                {stats?.bookingsByStatus ? (
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={Object.entries(stats.bookingsByStatus).map(([status, count]) => ({ status, count }))}
                        layout="vertical"
                      >
                        <XAxis type="number" tick={{ fontSize: 12, fill: '#5E7078' }} />
                        <YAxis dataKey="status" type="category" width={100} tick={{ fontSize: 11, fill: '#5E7078' }} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#FFFFFF',
                            borderRadius: '10px',
                            border: '1px solid #E5ECEE',
                            fontSize: '12px',
                          }}
                        />
                        <Bar dataKey="count" fill="#3F9D7C" name="Bookings" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <p className="text-xs text-text-muted text-center py-10">No booking data yet.</p>
                )}
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
