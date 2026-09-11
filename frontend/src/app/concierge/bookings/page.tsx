'use client';

import React, { useState } from 'react';
import { ConciergeSidebar } from '@/components/concierge/sidebar';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Search, Calendar, CreditCard, ClipboardList, Loader2 } from 'lucide-react';
import { BookingStatusBadge } from '@/components/ui/booking-status-badge';
import { useAdminBookings, useAdminDashboard } from '@/hooks/use-admin';
import { formatCurrency } from '@/lib/currency';
import { ErrorState } from '@/components/ui/error-state';

const STATUS_OPTIONS = [
  { value: '', label: 'All Status' },
  { value: 'pending', label: 'Pending' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled_by_traveler', label: 'Cancelled' },
];

export default function ConciergeBookingsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const { data: bookings, isLoading, error, refetch } = useAdminBookings({
    status: statusFilter || undefined,
    search: searchQuery || undefined,
  });
  const { data: dashboard } = useAdminDashboard();

  return (
    <div className="grid grid-rows-1 h-screen overflow-hidden bg-background text-text grid-cols-[80px_1fr] lg:grid-cols-[260px_1fr]">
      <ConciergeSidebar />
      <main className="min-h-0 flex-1 flex flex-col min-w-0 h-full overflow-y-auto bg-[#FAFCFC]">
        <div className="px-4 md:px-8 py-6 border-b border-border bg-surface sticky top-0 z-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-text">Bookings</h1>
              <p className="text-sm text-text-muted mt-1">View and assist with traveler bookings across the platform.</p>
            </div>
            <Button variant="primary" size="sm" className="font-bold gap-2">
              <ClipboardList className="w-4 h-4" />
              <span>Create Booking</span>
            </Button>
          </div>
        </div>

        <div className="p-4 md:p-8 max-w-[1400px] w-full mx-auto space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
            <div className="bg-surface border border-border rounded-xl p-5 shadow-sm">
              <div className="text-2xl font-extrabold text-warning">{dashboard?.bookingsByStatus?.pending ?? '—'}</div>
              <div className="text-[11px] font-bold text-text-muted uppercase tracking-wider mt-1">Pending</div>
            </div>
            <div className="bg-surface border border-border rounded-xl p-5 shadow-sm">
              <div className="text-2xl font-extrabold text-warning">{dashboard?.bookingsByStatus?.accepted ?? '—'}</div>
              <div className="text-[11px] font-bold text-text-muted uppercase tracking-wider mt-1">Accepted</div>
            </div>
            <div className="bg-surface border border-border rounded-xl p-5 shadow-sm">
              <div className="text-2xl font-extrabold text-success">{dashboard?.bookingsByStatus?.confirmed ?? '—'}</div>
              <div className="text-[11px] font-bold text-text-muted uppercase tracking-wider mt-1">Confirmed</div>
            </div>
            <div className="bg-surface border border-border rounded-xl p-5 shadow-sm border-l-4 border-l-primary">
              <div className="text-2xl font-extrabold text-primary">{dashboard?.bookingsByStatus?.in_progress ?? '—'}</div>
              <div className="text-[11px] font-bold text-primary uppercase tracking-wider mt-1">In Progress</div>
            </div>
            <div className="bg-surface border border-border rounded-xl p-5 shadow-sm">
              <div className="text-2xl font-extrabold text-danger">{dashboard?.bookingsByStatus?.cancelled ?? '—'}</div>
              <div className="text-[11px] font-bold text-text-muted uppercase tracking-wider mt-1">Cancelled</div>
            </div>
            <div className="bg-surface border border-border rounded-xl p-5 shadow-sm">
              <div className="text-2xl font-extrabold text-text">{dashboard?.totalBookings ?? '—'}</div>
              <div className="text-[11px] font-bold text-text-muted uppercase tracking-wider mt-1">Total Bookings</div>
            </div>
          </div>

          <div className="bg-surface border border-border rounded-xl p-2 shadow-sm flex flex-wrap items-center gap-2">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input
                type="text"
                placeholder="Search booking ref, traveler, or provider..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-transparent text-sm focus:outline-none placeholder:text-text-muted"
              />
            </div>
            <div className="h-6 w-px bg-border mx-1 hidden sm:block" />
            {STATUS_OPTIONS.map((s) => (
              <button
                key={s.value}
                onClick={() => setStatusFilter(s.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors ${
                  statusFilter === s.value ? 'bg-primary-dark text-white' : 'text-text-muted hover:text-text hover:bg-background'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>

          <div className="bg-surface border border-border rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Booking Ref</TableHead>
                    <TableHead>Traveler</TableHead>
                    <TableHead>Provider</TableHead>
                    <TableHead>Service</TableHead>
                    <TableHead>Date / Time</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-12">
                        <Loader2 className="w-6 h-6 animate-spin text-primary mx-auto" />
                      </TableCell>
                    </TableRow>
                  ) : error ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-12">
                        <ErrorState onRetry={() => refetch()} />
                      </TableCell>
                    </TableRow>
                  ) : (bookings ?? []).length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-12 text-text-muted">
                        No bookings found{statusFilter || searchQuery ? ' matching your filters' : ''}.
                      </TableCell>
                    </TableRow>
                  ) : (
                    (bookings ?? []).map((booking) => (
                      <TableRow key={booking.id}>
                        <TableCell>
                          <span className="font-mono text-xs font-bold text-text">{booking.reference}</span>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm font-semibold">{booking.traveler?.fullName ?? '—'}</span>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-text-muted">{booking.provider?.businessName ?? '—'}</span>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm font-medium">{booking.service?.name ?? '—'}</span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5 text-sm text-text-muted">
                            <Calendar className="w-3.5 h-3.5" />
                            <span>{new Date(booking.scheduledDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm font-bold text-text">{formatCurrency(booking.totalCents)}</span>
                        </TableCell>
                        <TableCell>
                          <BookingStatusBadge status={booking.status} />
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" className="font-bold text-primary hover:text-primary-dark">
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
