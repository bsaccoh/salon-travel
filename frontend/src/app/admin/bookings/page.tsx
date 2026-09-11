'use client';

import React, { useState } from 'react';
import { AdminSidebar } from '@/components/dashboard/admin-sidebar';
import { BookingStatusBadge } from '@/components/ui/booking-status-badge';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import { Eye, Loader2, Search } from 'lucide-react';
import { ActionDropdown } from '@/components/ui/dropdown';
import { useAdminBookings } from '@/hooks/use-admin';
import { formatCurrency } from '@/lib/currency';
import { ErrorState } from '@/components/ui/error-state';

const BOOKING_STATUSES = [
  { value: '', label: 'All Statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled_by_traveler', label: 'Cancelled' },
  { value: 'declined', label: 'Declined' },
];

export default function AdminBookingsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const { data: bookings, isLoading, error, refetch } = useAdminBookings({
    status: statusFilter || undefined,
    search: searchQuery || undefined,
  });

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />

      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-text">Platform Bookings</h1>
          <p className="text-xs text-text-muted mt-1">
            Global ledger of all traveler bookings, reservations, and lifecycle statuses
          </p>
        </div>

        <div className="bg-surface rounded-xl p-4 border border-border shadow-subtle mb-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 w-full md:w-80 px-3 py-2 rounded-lg bg-background border border-border">
            <Search className="w-4 h-4 text-text-muted" />
            <input
              type="text"
              placeholder="Search by reference, traveler, or provider..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent text-xs text-text focus:outline-none w-full"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
            {BOOKING_STATUSES.map((s) => (
              <button
                key={s.value}
                onClick={() => setStatusFilter(s.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap ${
                  statusFilter === s.value ? 'bg-primary-dark text-white' : 'bg-background text-text-muted hover:text-text'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20 text-primary">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
        ) : error ? (
          <ErrorState onRetry={() => refetch()} />
        ) : (
          <div className="rounded-2xl border border-border bg-surface shadow-card overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Booking Ref</TableHead>
                    <TableHead>Traveler</TableHead>
                    <TableHead>Provider</TableHead>
                    <TableHead>Service</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(bookings || []).length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-12 text-text-muted">
                        No bookings found{statusFilter || searchQuery ? ' matching your filters' : ''}.
                      </TableCell>
                    </TableRow>
                  ) : (bookings || []).map((b) => (
                    <TableRow key={b.id}>
                      <TableCell className="font-mono text-xs font-bold text-text-muted">
                        {b.reference}
                      </TableCell>
                      <TableCell className="font-semibold text-text">
                        {b.traveler?.fullName || 'Traveler'}
                      </TableCell>
                      <TableCell className="text-primary font-medium">
                        {b.provider?.businessName || 'Provider'}
                      </TableCell>
                      <TableCell className="text-text-muted font-medium">
                        {b.service?.name || 'Service'}
                      </TableCell>
                      <TableCell className="text-text font-medium">
                        {new Date(b.scheduledDate).toLocaleDateString('en-GB', {
                          day: '2-digit', month: 'short', year: 'numeric',
                        })}
                      </TableCell>
                      <TableCell className="font-bold text-primary-dark">
                        {formatCurrency(b.totalCents)}
                      </TableCell>
                      <TableCell>
                        <BookingStatusBadge status={b.status} />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end">
                          <ActionDropdown
                            items={[
                              {
                                label: 'Audit Booking',
                                icon: Eye,
                                onClick: () => {},
                              }
                            ]}
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
