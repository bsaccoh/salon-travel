'use client';

import React from 'react';
import { AdminSidebar } from '@/components/dashboard/admin-sidebar';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import { Eye, Loader2 } from 'lucide-react';
import { ActionDropdown } from '@/components/ui/dropdown';
import { useAdminRefunds } from '@/hooks/use-admin';
import { formatCurrency } from '@/lib/currency';
import { ErrorState } from '@/components/ui/error-state';

export default function AdminRefundsPage() {
  const { data: refunds, isLoading, error, refetch } = useAdminRefunds();

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />

      <main className="flex-1 p-8 overflow-y-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-text">Refund Requests & Ledger</h1>
          <p className="text-xs text-text-muted mt-1">
            Audit customer refund requests, cancellation policy calculations, and Stripe refund settlements
          </p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20 text-primary">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
        ) : error ? (
          <ErrorState onRetry={() => refetch()} />
        ) : (
          <div className="rounded-2xl border border-border bg-surface shadow-card overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Refund ID</TableHead>
                  <TableHead>Booking</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(refunds || []).map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-mono text-xs font-bold text-text-muted">
                      {r.id.slice(0, 12)}...
                    </TableCell>
                    <TableCell className="font-mono text-xs font-semibold text-primary">
                      {r.bookingId.slice(0, 12)}...
                    </TableCell>
                    <TableCell className="font-bold text-primary-dark">
                      {formatCurrency(r.amountCents)}
                    </TableCell>
                    <TableCell className="text-xs text-text-muted max-w-xs truncate">
                      {r.reason}
                    </TableCell>
                    <TableCell className="text-xs text-text-muted font-medium">
                      {new Date(r.createdAt).toLocaleDateString('en-GB', {
                        day: '2-digit', month: 'short', year: 'numeric',
                      })}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`text-xs font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                          r.status === 'succeeded'
                            ? 'bg-success-light text-success'
                            : r.status === 'failed'
                            ? 'bg-danger-light text-danger'
                            : 'bg-warning-light text-text'
                        }`}
                      >
                        {r.status.replace('_', ' ')}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end">
                        <ActionDropdown
                          items={[
                            {
                              label: 'View Refund Details',
                              icon: Eye,
                              onClick: () => {},
                            },
                          ]}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </main>
    </div>
  );
}
