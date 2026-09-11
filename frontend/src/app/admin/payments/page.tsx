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
import { useAdminPayments } from '@/hooks/use-admin';
import { formatCurrency } from '@/lib/currency';
import { ErrorState } from '@/components/ui/error-state';

export default function AdminPaymentsPage() {
  const { data: payments, isLoading, error, refetch } = useAdminPayments();

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />

      <main className="flex-1 p-8 overflow-y-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-text">Payment Transactions</h1>
          <p className="text-xs text-text-muted mt-1">
            Audited Stripe PaymentIntent transactions, platform commission, and settlement records
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
                  <TableHead>Payment ID</TableHead>
                  <TableHead>Booking</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Currency</TableHead>
                  <TableHead>Payment Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(payments || []).map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-mono text-xs font-bold text-text-muted">
                      {p.id.slice(0, 12)}...
                    </TableCell>
                    <TableCell className="font-mono text-xs font-semibold text-primary">
                      {p.bookingId.slice(0, 12)}...
                    </TableCell>
                    <TableCell className="font-bold text-primary-dark">
                      {formatCurrency(p.amountCents)}
                    </TableCell>
                    <TableCell className="text-text-muted font-medium uppercase">
                      {p.currency}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`text-xs font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                          p.status === 'succeeded' || p.status === 'paid'
                            ? 'bg-success-light text-success'
                            : p.status === 'failed'
                            ? 'bg-danger-light text-danger'
                            : 'bg-warning-light text-warning'
                        }`}
                      >
                        {p.status.replace('_', ' ')}
                      </span>
                    </TableCell>
                    <TableCell className="text-text-muted font-medium">
                      {new Date(p.createdAt).toLocaleDateString('en-GB', {
                        day: '2-digit', month: 'short', year: 'numeric',
                      })}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end">
                        <ActionDropdown
                          items={[
                            {
                              label: 'View Receipt',
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
        )}
      </main>
    </div>
  );
}
