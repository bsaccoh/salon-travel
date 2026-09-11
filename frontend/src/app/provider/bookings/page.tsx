'use client';

import React, { useState } from 'react';
import { ProviderSidebar } from '@/components/dashboard/provider-sidebar';
import { BookingStatusBadge } from '@/components/ui/booking-status-badge';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import { ActionDropdown } from '@/components/ui/dropdown';
import { Check, X, Eye, Loader2, CalendarCheck2, Search } from 'lucide-react';
import { useProviderBookings, useAcceptBooking, useDeclineBooking, useCompleteBooking } from '@/hooks/use-bookings';
import { formatCurrency } from '@/lib/currency';
import { ErrorState } from '@/components/ui/error-state';
import { BookingStatus } from '@/lib/types';

const STATUS_TABS = [
  { value: '', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled_by_traveler', label: 'Cancelled' },
];

export default function ProviderBookingsPage() {
  const [statusFilter, setStatusFilter] = useState('');
  const { data: bookings, isLoading, error, refetch } = useProviderBookings({
    status: (statusFilter || undefined) as BookingStatus | undefined,
  });
  const acceptBooking = useAcceptBooking();
  const declineBooking = useDeclineBooking();
  const completeBooking = useCompleteBooking();

  return (
    <div className="flex min-h-screen bg-background">
      <ProviderSidebar />

      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-text">Bookings Management</h1>
            <p className="text-xs text-text-muted mt-1">
              Review, accept, or update booking requests from travelers
            </p>
          </div>
        </div>

        <div className="bg-surface rounded-xl p-3 border border-border shadow-subtle mb-6 flex items-center gap-2 overflow-x-auto">
          {STATUS_TABS.map((s) => (
            <button
              key={s.value}
              onClick={() => setStatusFilter(s.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors ${
                statusFilter === s.value ? 'bg-primary-dark text-white' : 'bg-background text-text-muted hover:text-text'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20 text-primary">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
        ) : error ? (
          <ErrorState onRetry={() => refetch()} />
        ) : !bookings?.length ? (
          <div className="p-12 rounded-2xl border border-border bg-surface text-center space-y-4 shadow-subtle">
            <CalendarCheck2 className="w-12 h-12 text-primary mx-auto" />
            <h3 className="text-lg font-bold text-text">
              {statusFilter ? `No ${statusFilter.replace(/_/g, ' ')} bookings` : 'No bookings yet'}
            </h3>
            <p className="text-xs text-text-muted max-w-sm mx-auto">
              {statusFilter
                ? 'Try selecting a different status filter.'
                : 'Booking requests from travelers will appear here once you have active services listed.'}
            </p>
            {statusFilter && (
              <button
                onClick={() => setStatusFilter('')}
                className="text-xs font-bold text-primary hover:underline"
              >
                Clear filter
              </button>
            )}
          </div>
        ) : (
          <div className="rounded-2xl border border-border bg-surface shadow-card overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Booking Ref</TableHead>
                    <TableHead>Traveler</TableHead>
                    <TableHead>Service</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Guests</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bookings.map((b) => (
                    <TableRow key={b.id}>
                      <TableCell className="font-mono text-xs font-bold text-text-muted">
                        {b.reference}
                      </TableCell>
                      <TableCell className="font-semibold text-text">
                        {b.traveler?.fullName || 'Traveler'}
                      </TableCell>
                      <TableCell className="text-text-muted">
                        {b.service?.name || 'Service'}
                      </TableCell>
                      <TableCell className="font-medium text-text">
                        {new Date(b.scheduledDate).toLocaleDateString('en-GB', {
                          day: '2-digit', month: 'short', year: 'numeric',
                        })}
                      </TableCell>
                      <TableCell>{b.guestCount} Guests</TableCell>
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
                                label: 'View Details',
                                icon: Eye,
                                onClick: () => {},
                              },
                              ...(b.status === 'pending'
                                ? [
                                    {
                                      label: 'Accept Request',
                                      icon: Check,
                                      variant: 'success' as const,
                                      onClick: () => acceptBooking.mutate(b.id),
                                    },
                                    {
                                      label: 'Decline',
                                      icon: X,
                                      variant: 'danger' as const,
                                      onClick: () => declineBooking.mutate({ id: b.id, reason: 'Declined by provider' }),
                                    },
                                  ]
                                : []),
                              ...(b.status === 'confirmed'
                                ? [
                                    {
                                      label: 'Mark Completed',
                                      icon: Check,
                                      variant: 'success' as const,
                                      onClick: () => completeBooking.mutate(b.id),
                                    },
                                  ]
                                : []),
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
