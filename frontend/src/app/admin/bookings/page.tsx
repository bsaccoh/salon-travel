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
import { Eye, Loader2, Search, CheckCircle2, XCircle, Ban, Flag, AlertCircle } from 'lucide-react';
import { ActionDropdown } from '@/components/ui/dropdown';
import {
  useAdminBookings,
  useAdminAcceptBooking,
  useAdminDeclineBooking,
  useAdminCancelBooking,
  useAdminCompleteBooking,
} from '@/hooks/use-admin';
import { formatCurrency } from '@/lib/currency';
import { ErrorState } from '@/components/ui/error-state';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';

const BOOKING_STATUSES = [
  { value: '', label: 'All Statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'accepted', label: 'Accepted' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled_by_traveler', label: 'Cancelled' },
  { value: 'declined', label: 'Declined' },
];

type ConfirmAction = 'accept' | 'decline' | 'cancel' | 'complete';

interface ConfirmState {
  action: ConfirmAction;
  bookingId: string;
  reference: string;
}

const ACTION_META: Record<ConfirmAction, { title: string; description: string; confirmLabel: string; variant: 'primary' | 'danger'; needsReason: boolean }> = {
  accept: {
    title: 'Accept Booking',
    description: 'Accept this booking on behalf of the provider. The traveler will be notified.',
    confirmLabel: 'Accept Booking',
    variant: 'primary',
    needsReason: false,
  },
  decline: {
    title: 'Decline Booking',
    description: 'Decline this booking request. The traveler will be notified with your reason.',
    confirmLabel: 'Decline Booking',
    variant: 'danger',
    needsReason: true,
  },
  cancel: {
    title: 'Cancel Booking',
    description: 'Cancel this booking as an admin override. The traveler will be notified.',
    confirmLabel: 'Cancel Booking',
    variant: 'danger',
    needsReason: true,
  },
  complete: {
    title: 'Mark as Completed',
    description: 'Mark this booking as completed. This cannot be undone.',
    confirmLabel: 'Mark Completed',
    variant: 'primary',
    needsReason: false,
  },
};

function getActions(status: string): ConfirmAction[] {
  switch (status) {
    case 'pending':
      return ['accept', 'decline'];
    case 'accepted':
    case 'awaiting_payment':
    case 'paid':
    case 'confirmed':
    case 'in_progress':
      return ['complete', 'cancel'];
    default:
      return [];
  }
}

export default function AdminBookingsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [confirm, setConfirm] = useState<ConfirmState | null>(null);
  const [reason, setReason] = useState('');
  const [actionError, setActionError] = useState<string | null>(null);

  const { data: bookings, isLoading, error, refetch } = useAdminBookings({
    status: statusFilter || undefined,
    search: searchQuery || undefined,
  });

  const acceptMutation = useAdminAcceptBooking();
  const declineMutation = useAdminDeclineBooking();
  const cancelMutation = useAdminCancelBooking();
  const completeMutation = useAdminCompleteBooking();

  const isActionPending =
    acceptMutation.isPending ||
    declineMutation.isPending ||
    cancelMutation.isPending ||
    completeMutation.isPending;

  function openConfirm(action: ConfirmAction, bookingId: string, reference: string) {
    setConfirm({ action, bookingId, reference });
    setReason('');
    setActionError(null);
  }

  function closeConfirm() {
    if (isActionPending) return;
    setConfirm(null);
    setReason('');
    setActionError(null);
  }

  async function handleConfirm() {
    if (!confirm) return;
    setActionError(null);

    try {
      const { action, bookingId } = confirm;
      if (action === 'accept') await acceptMutation.mutateAsync(bookingId);
      else if (action === 'decline') await declineMutation.mutateAsync({ id: bookingId, reason: reason.trim() || undefined });
      else if (action === 'cancel') await cancelMutation.mutateAsync({ id: bookingId, reason: reason.trim() || undefined });
      else if (action === 'complete') await completeMutation.mutateAsync(bookingId);
      setConfirm(null);
      setReason('');
    } catch (err: any) {
      setActionError(err?.message || 'Action failed. Please try again.');
    }
  }

  const meta = confirm ? ACTION_META[confirm.action] : null;

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
                  ) : (bookings || []).map((b) => {
                    const actions = getActions(b.status);
                    const dropdownItems = [
                      ...actions.map((action) => {
                        const icons: Record<ConfirmAction, React.ElementType> = {
                          accept: CheckCircle2,
                          decline: XCircle,
                          cancel: Ban,
                          complete: Flag,
                        };
                        const labels: Record<ConfirmAction, string> = {
                          accept: 'Accept',
                          decline: 'Decline',
                          cancel: 'Cancel Booking',
                          complete: 'Mark Completed',
                        };
                        return {
                          label: labels[action],
                          icon: icons[action],
                          onClick: () => openConfirm(action, b.id, b.reference),
                          variant: (action === 'decline' || action === 'cancel') ? 'danger' as const : undefined,
                        };
                      }),
                      {
                        label: 'Audit Booking',
                        icon: Eye,
                        onClick: () => {},
                      },
                    ];

                    return (
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
                            <ActionDropdown items={dropdownItems} />
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </main>

      {/* Confirm Action Modal */}
      {confirm && meta && (
        <Modal
          isOpen={!!confirm}
          onClose={closeConfirm}
          title={meta.title}
        >
          <div className="space-y-4">
            <p className="text-sm text-text-muted">{meta.description}</p>

            <div className="px-3 py-2 rounded-lg bg-background border border-border text-xs font-mono text-text-muted">
              Booking: <span className="font-bold text-text">{confirm.reference}</span>
            </div>

            {meta.needsReason && (
              <div>
                <label className="block text-xs font-semibold text-text uppercase tracking-wider mb-1.5">
                  Reason {meta.needsReason ? '' : '(Optional)'}
                </label>
                <textarea
                  rows={3}
                  placeholder="Enter a reason for the traveler..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="flex w-full rounded-lg border border-border bg-surface p-3 text-sm text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            )}

            {actionError && (
              <div className="flex items-start gap-2 p-3 rounded-lg bg-danger-light border border-danger/20 text-danger text-xs font-semibold">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{actionError}</span>
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                size="md"
                className="flex-1"
                onClick={closeConfirm}
                disabled={isActionPending}
              >
                Cancel
              </Button>
              <Button
                variant={meta.variant === 'danger' ? 'danger' : 'primary'}
                size="md"
                className="flex-1 font-bold"
                isLoading={isActionPending}
                onClick={handleConfirm}
              >
                {meta.confirmLabel}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
