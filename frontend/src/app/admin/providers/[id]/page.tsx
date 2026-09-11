'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { AdminSidebar } from '@/components/dashboard/admin-sidebar';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import {
  FileText,
  ArrowLeft,
  Check,
  X,
  Loader2,
} from 'lucide-react';
import { useAdminProvider, useAdminApproveProvider, useAdminRejectProvider } from '@/hooks/use-admin';

export default function AdminProviderVerificationAuditPage({
  params,
}: {
  params: { id: string };
}) {
  const { data: provider, isLoading } = useAdminProvider(params.id);
  const approveProvider = useAdminApproveProvider();
  const rejectProvider = useAdminRejectProvider();
  const [modalType, setModalType] = useState<'approve' | 'reject' | null>(null);

  const handleAction = () => {
    if (!provider) return;
    if (modalType === 'approve') approveProvider.mutate(provider.id);
    if (modalType === 'reject') rejectProvider.mutate({ id: provider.id });
    setModalType(null);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-background">
        <AdminSidebar />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </main>
      </div>
    );
  }

  if (!provider) {
    return (
      <div className="flex min-h-screen bg-background">
        <AdminSidebar />
        <main className="flex-1 p-8">
          <p className="text-text-muted">Provider not found.</p>
        </main>
      </div>
    );
  }

  const status = provider.status;

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />

      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-5xl space-y-8">
          <Link
            href="/admin/providers"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-text-muted hover:text-text"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to provider directory</span>
          </Link>

          {/* Top Info Banner */}
          <div className="p-6 sm:p-8 rounded-2xl border border-border bg-surface shadow-card flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-text">{provider.businessName}</h1>
                <span
                  className={`text-xs font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                    status === 'approved'
                      ? 'bg-success-light text-success'
                      : status === 'rejected'
                      ? 'bg-danger-light text-danger'
                      : status === 'suspended'
                      ? 'bg-danger-light text-danger'
                      : 'bg-warning-light text-text'
                  }`}
                >
                  {status.replace('_', ' ')}
                </span>
              </div>
              <p className="text-xs text-text-muted mt-1 font-medium">
                {provider.phone} · {provider.city}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="success"
                size="md"
                className="font-bold gap-1.5"
                onClick={() => setModalType('approve')}
              >
                <Check className="w-4 h-4" />
                <span>Approve Provider</span>
              </Button>

              <Button
                variant="outline"
                size="md"
                className="text-danger border-danger/30 hover:bg-danger-light font-semibold"
                onClick={() => setModalType('reject')}
              >
                <X className="w-4 h-4 mr-1" />
                <span>Reject</span>
              </Button>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-6 space-y-6">
              <div className="p-6 rounded-2xl border border-border bg-surface shadow-card space-y-4">
                <h3 className="text-base font-bold text-text">Business Information</h3>
                <div className="space-y-2.5 text-xs">
                  <p><strong className="text-text">Category:</strong> <span className="text-text-muted">{provider.category}</span></p>
                  <p><strong className="text-text">Operating Location:</strong> <span className="text-text-muted">{provider.address || provider.city}</span></p>
                  <p><strong className="text-text">Rating:</strong> <span className="text-text-muted">{provider.ratingAverage > 0 ? `${provider.ratingAverage.toFixed(1)} ★ (${provider.ratingCount} reviews)` : 'No reviews yet'}</span></p>
                  <p><strong className="text-text">Bio / Mission:</strong></p>
                  <p className="text-text-muted leading-relaxed font-normal">{provider.description || 'No description provided.'}</p>
                </div>
              </div>
            </div>

            <div className="lg:col-span-6 space-y-6">
              <div className="p-6 rounded-2xl border border-border bg-surface shadow-card space-y-4">
                <h3 className="text-base font-bold text-text">Provider Details</h3>
                <div className="space-y-2.5 text-xs">
                  <p><strong className="text-text">Slug:</strong> <span className="text-text-muted font-mono">{provider.slug}</span></p>
                  <p><strong className="text-text">Phone:</strong> <span className="text-text-muted">{provider.phone || '—'}</span></p>
                  <p><strong className="text-text">Address:</strong> <span className="text-text-muted">{provider.address || '—'}</span></p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Confirmation Modal */}
        <Modal
          isOpen={modalType !== null}
          onClose={() => setModalType(null)}
          title={modalType === 'approve' ? 'Approve Provider Application' : 'Reject Application'}
          description="This will update the provider status and notify the operator via email/SMS."
        >
          <div className="pt-4 flex items-center justify-end gap-3">
            <Button variant="outline" size="md" onClick={() => setModalType(null)}>
              Cancel
            </Button>
            <Button
              variant={modalType === 'approve' ? 'success' : 'danger'}
              size="md"
              className="font-bold"
              onClick={handleAction}
            >
              Confirm
            </Button>
          </div>
        </Modal>
      </main>
    </div>
  );
}
