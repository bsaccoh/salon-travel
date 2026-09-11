'use client';

import React from 'react';
import Link from 'next/link';
import { AdminSidebar } from '@/components/dashboard/admin-sidebar';
import { AdminTopbar } from '@/components/dashboard/admin-topbar';
import { GlobalFilters } from '@/components/dashboard/global-filters';
import { KPICard } from '@/components/ui/kpi-card';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import {
  Users,
  Building2,
  CalendarCheck2,
  DollarSign,
  Check,
  X,
  Eye,
  ArrowRight,
  TrendingUp,
  FileCheck,
  Loader2,
} from 'lucide-react';
import { ActionDropdown } from '@/components/ui/dropdown';
import { useAdminProviders, useAdminApproveProvider, useAdminRejectProvider, useAdminDashboard, useAdminChart } from '@/hooks/use-admin';
import { formatCurrency } from '@/lib/currency';
import { useDestinations } from '@/hooks/use-destinations';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from 'recharts';

export default function AdminOverviewPage() {
  const { data: pendingProviders, isLoading: pendingLoading } = useAdminProviders({ status: 'submitted' });
  const { data: dashboard } = useAdminDashboard();
  const { data: chartRaw } = useAdminChart();
  const { data: destinations } = useDestinations({ limit: 4 });
  const approveProvider = useAdminApproveProvider();
  const rejectProvider = useAdminRejectProvider();

  const chartData = (chartRaw || []).map((d) => ({
    month: d.month,
    bookings: d.bookings,
    revenue: d.revenueCents / 100,
  }));

  const topDestinations = (destinations || []).slice(0, 4).map((d, i, arr) => {
    const maxViews = Math.max(...arr.map((x) => x.viewCount || 1));
    return {
      name: d.name,
      count: d.viewCount || 0,
      percentage: `${Math.round(((d.viewCount || 0) / maxViews) * 100)}%`,
    };
  });

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />

      <main className="flex-1 p-8 overflow-y-auto">
        <AdminTopbar
          title="Overview"
          subtitle="Monitor marketplace performance, bookings, revenue, providers, payments and operational activity."
        />
        
        <GlobalFilters />

        {/* 6 Executive KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
          <KPICard
            label="Registered Travelers"
            value={dashboard ? String(dashboard.totalTravelers) : '—'}
            icon={Users}
            iconBgColor="bg-primary-light text-primary"
          />
          <KPICard
            label="Active Providers"
            value={dashboard ? String(dashboard.approvedProviders) : '—'}
            icon={Building2}
            subtext={dashboard ? `${dashboard.pendingProviders} pending verification` : undefined}
            iconBgColor="bg-warning-light text-warning"
          />
          <KPICard
            label="Total Bookings"
            value={dashboard ? String(dashboard.totalBookings) : '—'}
            icon={CalendarCheck2}
            subtext={dashboard ? `${dashboard.recentBookings} new this week` : undefined}
            iconBgColor="bg-success-light text-success"
          />
          <KPICard
            label="Gross Booking Value"
            value={dashboard ? formatCurrency(dashboard.grossRevenueCents) : '—'}
            icon={DollarSign}
            iconBgColor="bg-accent-light text-accent"
          />
          <KPICard
            label="Platform Commission"
            value={dashboard ? formatCurrency(dashboard.commissionCents) : '—'}
            icon={DollarSign}
            subtext="15% effective commission"
            iconBgColor="bg-primary-light text-primary-dark"
          />
          <KPICard
            label="Total Confirmed"
            value={dashboard?.bookingsByStatus?.confirmed != null ? String(dashboard.bookingsByStatus.confirmed) : '—'}
            icon={TrendingUp}
            iconBgColor="bg-surface text-text-muted border border-border"
          />
        </div>

        {/* Analytics Section: Chart on Left, Top Destinations on Right (Section 44 & 45) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
          {/* Chart Left (Section 44) */}
          <div className="lg:col-span-8 p-6 rounded-2xl border border-border bg-surface shadow-card">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-base font-bold text-text">Bookings & Revenue</h3>
                <p className="text-xs text-text-muted">Last 6 months performance</p>
              </div>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
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
                  <Legend
                    wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
                  />
                  <Bar dataKey="bookings" fill="#0E4C5B" name="Bookings" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="revenue" fill="#EE6C4D" name="Revenue ($)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Top Destinations Widget Right (Section 45) */}
          <div className="lg:col-span-4 p-6 rounded-2xl border border-border bg-surface shadow-card flex flex-col justify-between">
            <div>
              <h3 className="text-base font-bold text-text mb-1">Top Destinations</h3>
              <p className="text-xs text-text-muted mb-6">Ranked by total traveler bookings</p>

              <div className="space-y-4">
                {topDestinations.map((d, i) => (
                  <div key={i} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-text truncate">{d.name}</span>
                      <span className="text-primary-dark font-bold">{d.count}</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-background overflow-hidden">
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{ width: d.percentage }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Link
              href="/admin/destinations"
              className="mt-6 pt-4 border-t border-border flex items-center justify-between text-xs font-bold text-primary hover:text-accent transition-smooth"
            >
              <span>Manage all destinations</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Providers Pending Verification Table (Section 46) */}
        <div className="rounded-2xl border border-border bg-surface shadow-card overflow-hidden">
          <div className="p-6 border-b border-border/70 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-text">Providers Pending Verification</h3>
              <p className="text-xs text-text-muted">Applications awaiting executive review and compliance audit</p>
            </div>
            <Link
              href="/admin/providers"
              className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
            >
              <span>All Providers</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {pendingLoading ? (
            <div className="flex items-center justify-center py-12 text-primary">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Provider</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>City</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(pendingProviders || []).length > 0 ? (
                  (pendingProviders || []).map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="font-bold text-text">{p.businessName}</TableCell>
                      <TableCell className="text-text-muted font-medium">{p.category}</TableCell>
                      <TableCell className="text-text-muted font-medium">{p.city}</TableCell>
                      <TableCell>
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-warning bg-warning-light px-2.5 py-0.5 rounded-full">
                          <FileCheck className="w-3.5 h-3.5" />
                          <span>{p.status.replace('_', ' ')}</span>
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end">
                          <ActionDropdown
                            items={[
                              {
                                label: 'View Application',
                                icon: Eye,
                                onClick: () => {
                                  window.location.href = `/admin/providers/${p.id}`;
                                },
                              },
                              {
                                label: 'Approve Provider',
                                icon: Check,
                                variant: 'success' as const,
                                onClick: () => approveProvider.mutate(p.id),
                              },
                              {
                                label: 'Reject Provider',
                                icon: X,
                                variant: 'danger' as const,
                                onClick: () => rejectProvider.mutate({ id: p.id }),
                              }
                            ]}
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-xs text-text-muted font-medium">
                      No providers currently waiting in the verification queue.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </div>
      </main>
    </div>
  );
}
