'use client';

import React from 'react';
import Link from 'next/link';
import { ProviderSidebar } from '@/components/dashboard/provider-sidebar';
import { ProviderTopbar } from '@/components/dashboard/provider-topbar';
import { ProviderFilters } from '@/components/dashboard/provider-filters';
import { KPICard } from '@/components/ui/kpi-card';
import { BookingStatusBadge } from '@/components/ui/booking-status-badge';
import { Button } from '@/components/ui/button';
import { ProviderKPISkeleton, BookingTableSkeleton, ChartSkeleton } from '@/components/dashboard/provider-skeletons';
import { formatCurrency } from '@/lib/currency';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import {
  Clock,
  CalendarCheck2,
  CheckCircle2,
  Star,
  Banknote,
  Wallet,
  AlertCircle,
  ArrowRight,
  Eye,
  Check,
} from 'lucide-react';
import { ActionDropdown } from '@/components/ui/dropdown';
import { useProviderDashboard } from '@/hooks/use-providers';
import { useProviderBookings, useCompleteBooking } from '@/hooks/use-bookings';

export default function ProviderOverviewPage() {
  const { data: stats, isLoading: loading } = useProviderDashboard();
  const { data: upcomingBookingsList } = useProviderBookings({ status: 'confirmed' as any });
  const completeBooking = useCompleteBooking();

  return (
    <div className="flex min-h-screen bg-background">
      <ProviderSidebar />

      <main className="flex-1 p-8 overflow-y-auto">
        <ProviderTopbar />

        <ProviderFilters />

        {/* Attention Required Section */}
        {stats?.pendingRequests && stats.pendingRequests > 0 && (
          <div className="mb-8 p-4 rounded-xl border border-warning/30 bg-warning/5 flex items-start justify-between">
            <div className="flex gap-3">
              <AlertCircle className="w-5 h-5 text-warning mt-0.5" />
              <div>
                <h3 className="text-sm font-bold text-text">Attention Required</h3>
                <p className="text-xs text-text-muted mt-1">
                  You have {stats.pendingRequests} booking request{stats.pendingRequests > 1 ? 's' : ''} awaiting your response.
                </p>
              </div>
            </div>
            <Link href="/provider/bookings">
              <Button variant="secondary" size="sm" className="font-bold">
                Review Requests
              </Button>
            </Link>
          </div>
        )}

        {/* KPI Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
          {loading ? (
            Array(6).fill(0).map((_, i) => <ProviderKPISkeleton key={i} />)
          ) : (
            <>
              <KPICard
                label="Pending Requests"
                value={stats?.pendingRequests?.toString() || '0'}
                icon={Clock}
                iconBgColor="bg-warning-light text-warning"
              />
              <KPICard
                label="Upcoming"
                value={stats?.upcomingBookings?.toString() || '0'}
                icon={CalendarCheck2}
                iconBgColor="bg-primary-light text-primary"
              />
              <KPICard
                label="Completed"
                value={stats?.completedBookings?.toString() || '0'}
                icon={CheckCircle2}
                iconBgColor="bg-success-light text-success"
              />
              <KPICard
                label="Gross Booking Value"
                value={formatCurrency(stats?.grossBookingValue)}
                icon={Banknote}
                iconBgColor="bg-primary-light text-primary"
              />
              <KPICard
                label="Provider Earnings"
                value={formatCurrency(stats?.providerEarnings)}
                icon={Wallet}
                iconBgColor="bg-success-light text-success"
              />
              <KPICard
                label="Average Rating"
                value={`${stats?.averageRating ?? '0'} ★`}
                icon={Star}
                iconBgColor="bg-warning-light text-warning"
              />
            </>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Financial Summary */}
          <div className="lg:col-span-1 rounded-2xl border border-border bg-surface shadow-card overflow-hidden p-6 flex flex-col h-full">
            <h3 className="text-base font-bold text-text mb-6">Financial Summary</h3>

            {loading ? (
              <div className="space-y-4 animate-pulse">
                <div className="h-4 w-full bg-border/40 rounded"></div>
                <div className="h-4 w-full bg-border/40 rounded"></div>
                <div className="h-4 w-full bg-border/40 rounded"></div>
                <div className="h-8 w-full bg-border/60 rounded mt-4"></div>
              </div>
            ) : (
              <div className="space-y-4 text-sm font-medium flex-1">
                <div className="flex justify-between items-center text-text-muted">
                  <span>Gross Booking Value</span>
                  <span className="text-text">{formatCurrency(stats?.grossBookingValue)}</span>
                </div>
                <div className="flex justify-between items-center text-text-muted">
                  <span>Platform Commission</span>
                  <span className="text-danger">-{formatCurrency(stats?.commission)}</span>
                </div>
                <div className="flex justify-between items-center text-text-muted">
                  <span>Refund Adjustments</span>
                  <span className="text-danger">-{formatCurrency(stats?.refundAdjustments)}</span>
                </div>

                <div className="pt-4 mt-4 border-t border-border flex justify-between items-center">
                  <span className="font-bold text-text">Net Earnings</span>
                  <span className="text-xl font-bold text-success">{formatCurrency(stats?.netEarnings)}</span>
                </div>
              </div>
            )}

            <div className="mt-6 pt-4">
              <Button variant="outline" className="w-full text-xs font-bold">
                View Detailed Earnings
              </Button>
            </div>
          </div>

          {/* Bookings vs Earnings Chart (Phase P1 placeholder) */}
          <div className="lg:col-span-2">
            {loading ? (
              <ChartSkeleton />
            ) : (
              <div className="rounded-2xl border border-border bg-surface shadow-card p-6 h-full flex flex-col">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-base font-bold text-text">Bookings & Earnings Trend</h3>
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1.5 text-xs font-semibold text-text-muted">
                      <span className="w-2 h-2 rounded-full bg-primary"></span> Bookings
                    </span>
                    <span className="flex items-center gap-1.5 text-xs font-semibold text-text-muted">
                      <span className="w-2 h-2 rounded-full bg-success"></span> Earnings
                    </span>
                  </div>
                </div>

                <div className="flex-1 min-h-[200px] flex items-end justify-between px-2 gap-2 mt-4 relative">
                  <div className="absolute inset-0 flex flex-col justify-between border-l border-b border-border/50">
                    {[1,2,3,4].map(i => <div key={i} className="w-full border-t border-border/30 h-full"></div>)}
                  </div>

                  {[40, 60, 30, 80, 50, 90, 75].map((h, i) => (
                    <div key={i} className="relative z-10 w-full flex flex-col justify-end items-center group h-full">
                      <div className="w-3/4 max-w-[2rem] bg-primary/20 hover:bg-primary transition-smooth rounded-t-sm" style={{ height: `${h}%` }}></div>
                      <div className="absolute w-2 h-2 rounded-full bg-success ring-2 ring-surface shadow-sm" style={{ bottom: `${h * 0.8}%` }}></div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Upcoming Bookings Table */}
        {loading ? (
          <BookingTableSkeleton />
        ) : (
          <div className="rounded-2xl border border-border bg-surface shadow-card overflow-hidden">
            <div className="p-6 border-b border-border/70 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-text">Upcoming Services</h3>
                <p className="text-xs text-text-muted">Travelers scheduled for the next 7 days</p>
              </div>
              <Link
                href="/provider/bookings"
                className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
              >
                <span>Manage all bookings</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {!upcomingBookingsList?.length ? (
              <div className="p-12 text-center flex flex-col items-center justify-center">
                <CalendarCheck2 className="w-12 h-12 text-border mb-3" />
                <h3 className="text-sm font-bold text-text mb-1">No upcoming bookings</h3>
                <p className="text-xs text-text-muted">You have no confirmed services scheduled for the next week.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Traveler</TableHead>
                    <TableHead>Service</TableHead>
                    <TableHead>Date / Time</TableHead>
                    <TableHead>Guests</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {upcomingBookingsList.map((booking) => (
                    <TableRow key={booking.id}>
                      <TableCell className="font-semibold text-text">
                        {booking.traveler?.fullName || 'Traveler'}
                      </TableCell>
                      <TableCell className="text-text-muted font-medium">
                        {booking.service?.name || 'Service'}
                      </TableCell>
                      <TableCell>
                        <div className="font-medium text-text">
                          {new Date(booking.scheduledDate).toLocaleDateString('en-GB', {
                            day: '2-digit', month: 'short', year: 'numeric',
                          })}
                        </div>
                        <div className="text-[10px] text-text-muted">
                          {new Date(booking.scheduledDate).toLocaleTimeString([], {
                            hour: '2-digit', minute: '2-digit',
                          })}
                        </div>
                      </TableCell>
                      <TableCell>{booking.guestCount} guest{booking.guestCount !== 1 ? 's' : ''}</TableCell>
                      <TableCell className="font-bold text-primary-dark">
                        {formatCurrency(booking.totalCents)}
                      </TableCell>
                      <TableCell>
                        <BookingStatusBadge status={booking.status} />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end">
                          <ActionDropdown
                            items={[
                              {
                                label: 'View Booking',
                                icon: Eye,
                                onClick: () => window.location.href = `/provider/bookings`,
                              },
                              {
                                label: 'Mark Completed',
                                icon: Check,
                                variant: 'success' as const,
                                onClick: () => completeBooking.mutate(booking.id),
                              }
                            ]}
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
