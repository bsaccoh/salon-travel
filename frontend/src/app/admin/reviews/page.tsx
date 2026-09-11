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
import { Eye, EyeOff, Check, Loader2 } from 'lucide-react';
import { ActionDropdown } from '@/components/ui/dropdown';
import { useAdminReviews, useAdminModerateReview } from '@/hooks/use-admin';
import { ErrorState } from '@/components/ui/error-state';

export default function AdminReviewsPage() {
  const { data: reviews, isLoading, error, refetch } = useAdminReviews();
  const moderateReview = useAdminModerateReview();

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />

      <main className="flex-1 p-8 overflow-y-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-text">Review Moderation</h1>
          <p className="text-xs text-text-muted mt-1">
            Audit traveler reviews, publish ratings, and moderate flagged content
          </p>
        </div>

        {error ? (
          <ErrorState onRetry={() => refetch()} />
        ) : (
        <div className="rounded-2xl border border-border bg-surface shadow-card overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center py-12 text-primary">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Traveler</TableHead>
                  <TableHead>Provider</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Comment</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(reviews || []).length > 0 ? (
                  (reviews || []).map((r) => (
                    <TableRow key={r.id}>
                      <TableCell className="font-bold text-text">{r.author.fullName}</TableCell>
                      <TableCell className="text-primary font-medium">{r.provider.businessName}</TableCell>
                      <TableCell className="font-bold text-warning">{r.rating} ★</TableCell>
                      <TableCell className="text-xs text-text-muted max-w-xs truncate">
                        {r.content}
                      </TableCell>
                      <TableCell className="text-xs text-text-muted">
                        {new Date(r.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`text-xs font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                            r.status === 'published'
                              ? 'bg-success-light text-success'
                              : 'bg-danger-light text-danger'
                          }`}
                        >
                          {r.status}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end">
                          <ActionDropdown
                            items={[
                              r.status === 'published'
                                ? {
                                    label: 'Hide Review',
                                    icon: EyeOff,
                                    variant: 'danger' as const,
                                    onClick: () => moderateReview.mutate({ id: r.id, status: 'hidden' }),
                                  }
                                : {
                                    label: 'Publish Review',
                                    icon: Check,
                                    variant: 'success' as const,
                                    onClick: () => moderateReview.mutate({ id: r.id, status: 'published' }),
                                  },
                            ]}
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-xs text-text-muted font-medium">
                      No reviews found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </div>
        )}
      </main>
    </div>
  );
}
