'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { AdminSidebar } from '@/components/dashboard/admin-sidebar';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import {
  ArrowLeft,
  Check,
  X,
  Loader2,
  PauseCircle,
  PlayCircle,
} from 'lucide-react';
import {
  useAdminProvider,
  useAdminApproveProvider,
  useAdminRejectProvider,
  useAdminSuspendProvider,
  useAdminReinstateProvider,
} from '@/hooks/use-admin';

type ActionType = 'approve' | 'reject' | 'suspend' | 'reinstate';

const ACTION_META: Record<ActionType, { title: string; description: string; confirmLabel: string; variant: 'success' | 'danger' | 'primary' | 'outline' }> = {
  approve: {
    title: 'Approve Provider',
    description: 'This will approve and list the provider. They will be notified.',
    confirmLabel: 'Approve & List',
    variant: 'success',
  },
  reject: {
    title: 'Reject Application',
    description: 'This will reject the provider application. They will be notified.',
    confirmLabel: 'Reject',
    variant: 'danger',
  },
  suspend: {
    title: 'Suspend Provider',
    description: 'This will suspend the provider and hide their listings from travelers.',
    confirmLabel: 'Suspend',
    variant: 'danger',
  },
  reinstate: {
    title: 'Reinstate Provider',
    description: 'This will reinstate the provider and restore their active listings.',
    confirmLabel: 'Reinstate',
    variant: 'success',
  },
};

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    approved: 'bg-success-light text-success',
    listed: 'bg-success-light text-success',
    rejected: 'bg-danger-light text-danger',
    suspended: 'bg-danger-light text-danger',
    under_review: 'bg-warning-light text-warning-dark',
    submitted: 'bg-primary-light text-primary',
    draft: 'bg-border text-text-muted',
    changes_requested: 'bg-warning-light text-warning-dark',
  };
  return (
    <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${colors[status] || 'bg-border text-text-muted'}`}>
      {status.replace(/_/g, ' ')}
    </span>
  );
}

export default function AdminProviderVerificationAuditPage({
  params,
}: {
  params: { id: string };
}) {
  const { data: provider, isLoading } = useAdminProvider(params.id);
  const approveProvider = useAdminApproveProvider();
  const rejectProvider = useAdminRejectProvider();
  const suspendProvider = useAdminSuspendProvider();
  const reinstateProvider = useAdminReinstateProvider();

  const [modalAction, setModalAction] = useState<ActionType | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const isPending =
    approveProvider.isPending ||
    rejectProvider.isPending ||
    suspendProvider.isPending ||
    reinstateProvider.isPending;

  const handleConfirm = async () => {
    if (!provider || !modalAction) return;
    setActionError(null);
    try {
      if (modalAction === 'approve') await approveProvider.mutateAsync(provider.id);
      else if (modalAction === 'reject') await rejectProvider.mutateAsync({ id: provider.id });
      else if (modalAction === 'suspend') await suspendProvider.mutateAsync({ id: provider.id });
      else if (modalAction === 'reinstate') await reinstateProvider.mutateAsync(provider.id);
      setModalAction(null);
    } catch (err: any) {
      setActionError(err?.message || 'Action failed. Please try again.');
    }
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
  const meta = modalAction ? ACTION_META[modalAction] : null;

  // Determine which actions are valid for this status
  const canApprove = status === 'submitted' || status === 'under_review';
  const canReject = status === 'submitted' || status === 'under_review';
  const canSuspend = status === 'listed' || status === 'approved';
  const canReinstate = status === 'suspended';

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
                <StatusBadge status={status} />
              </div>
              <p className="text-xs text-text-muted mt-1 font-medium">
                {provider.phone} · {provider.city}
              </p>
            </div>

            <div className="flex items-center gap-2">
              {canApprove && (
                <Button variant="success" size="md" className="font-bold gap-1.5" onClick={() => setModalAction('approve')}>
                  <Check className="w-4 h-4" />
                  <span>Approve Provider</span>
                </Button>
              )}
              {canReject && (
                <Button
                  variant="outline"
                  size="md"
                  className="text-danger border-danger/30 hover:bg-danger-light font-semibold"
                  onClick={() => setModalAction('reject')}
                >
                  <X className="w-4 h-4 mr-1" />
                  <span>Reject</span>
                </Button>
              )}
              {canSuspend && (
                <Button
                  variant="outline"
                  size="md"
                  className="text-danger border-danger/30 hover:bg-danger-light font-semibold gap-1.5"
                  onClick={() => setModalAction('suspend')}
                >
                  <PauseCircle className="w-4 h-4" />
                  <span>Suspend</span>
                </Button>
              )}
              {canReinstate && (
                <Button variant="success" size="md" className="font-bold gap-1.5" onClick={() => setModalAction('reinstate')}>
                  <PlayCircle className="w-4 h-4" />
                  <span>Reinstate</span>
                </Button>
              )}
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
        {modalAction && meta && (
          <Modal
            isOpen={!!modalAction}
            onClose={() => { if (!isPending) { setModalAction(null); setActionError(null); } }}
            title={meta.title}
            description={meta.description}
          >
            {actionError && (
              <div className="mb-4 p-3 rounded-lg bg-danger-light border border-danger/20 text-danger text-xs font-semibold">
                {actionError}
              </div>
            )}
            <div className="pt-2 flex items-center justify-end gap-3">
              <Button variant="outline" size="md" onClick={() => { setModalAction(null); setActionError(null); }} disabled={isPending}>
                Cancel
              </Button>
              <Button
                variant={meta.variant as any}
                size="md"
                className="font-bold"
                isLoading={isPending}
                onClick={handleConfirm}
              >
                {meta.confirmLabel}
              </Button>
            </div>
          </Modal>
        )}
      </main>
    </div>
  );
}
