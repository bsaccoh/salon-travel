'use client';

import React, { useState } from 'react';
import { AdminSidebar } from '@/components/dashboard/admin-sidebar';
import { AdminTopbar } from '@/components/dashboard/admin-topbar';
import { Headset, Inbox, UserCircle2, AlertTriangle, Calendar, Loader2, UserPlus, X } from 'lucide-react';
import { KPICard } from '@/components/ui/kpi-card';
import { useConciergeStats } from '@/hooks/use-admin';
import { ErrorState } from '@/components/ui/error-state';
import { apiClient } from '@/lib/api-client';

function AddConciergeModal({ onClose }: { onClose: () => void }) {
  const [form, setForm] = useState({ fullName: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await apiClient.post('/admin/users', { ...form, role: 'concierge' });
      setSuccess(`Concierge account created for ${form.email}`);
      setForm({ fullName: '', email: '', password: '' });
    } catch (err: any) {
      setError(err.message || 'Failed to create concierge');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-surface border border-border rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-text">Add Concierge Staff</h2>
          <button onClick={onClose} className="text-text-muted hover:text-text transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {success && (
          <div className="mb-4 px-4 py-2.5 bg-success-light text-success text-sm rounded-lg">{success}</div>
        )}
        {error && (
          <div className="mb-4 px-4 py-2.5 bg-danger-light text-danger text-sm rounded-lg">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-bold text-text-muted mb-1.5">Full Name</label>
            <input
              required
              value={form.fullName}
              onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))}
              className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-text text-sm focus:outline-none focus:border-primary"
              placeholder="Jane Doe"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-text-muted mb-1.5">Email</label>
            <input
              required
              type="email"
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-text text-sm focus:outline-none focus:border-primary"
              placeholder="concierge@example.com"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-text-muted mb-1.5">Temporary Password</label>
            <input
              required
              type="password"
              minLength={8}
              value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-text text-sm focus:outline-none focus:border-primary"
              placeholder="Min. 8 characters"
            />
          </div>
          <p className="text-xs text-text-muted -mt-1">Role will be set to <strong>Concierge</strong>.</p>
          <div className="flex gap-3 mt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-lg border border-border text-text text-sm font-semibold hover:bg-background transition-colors"
            >
              {success ? 'Close' : 'Cancel'}
            </button>
            {!success && (
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-2.5 rounded-lg bg-primary text-white text-sm font-bold hover:bg-primary-dark transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create Account'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AdminConciergePage() {
  const { data: stats, isLoading, error, refetch } = useConciergeStats();
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />
      {showModal && <AddConciergeModal onClose={() => setShowModal(false)} />}

      <main className="flex-1 p-8 overflow-y-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-text">Concierge</h1>
            <p className="text-xs text-text-muted mt-1">Manage emergency cases and traveler support</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-white text-sm font-bold hover:bg-primary-dark transition-colors shadow-sm"
          >
            <UserPlus className="w-4 h-4" />
            Add Concierge
          </button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : error ? (
          <ErrorState message="Could not load concierge stats." onRetry={() => refetch()} />
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
              <KPICard
                label="Unclaimed"
                value={String(stats?.unclaimedConversations ?? 0)}
                icon={Inbox}
                iconBgColor="bg-warning-light text-warning"
              />
              <KPICard
                label="My Conversations"
                value={String(stats?.myConversations ?? 0)}
                icon={Headset}
                iconBgColor="bg-primary-light text-primary"
              />
              <KPICard
                label="Open Cases"
                value={String(stats?.openCases ?? 0)}
                icon={UserCircle2}
                iconBgColor="bg-accent-light text-accent"
              />
              <KPICard
                label="Emergencies"
                value={String(stats?.emergencyConversations ?? 0)}
                icon={AlertTriangle}
                iconBgColor="bg-danger/10 text-danger"
              />
              <KPICard
                label="Today's Bookings"
                value={String(stats?.todaysBookings ?? 0)}
                icon={Calendar}
                iconBgColor="bg-success-light text-success"
              />
            </div>

            <div className="rounded-2xl border border-border bg-surface shadow-card p-8 text-center">
              <Headset className="w-10 h-10 text-text-muted mx-auto mb-3" />
              <h3 className="text-base font-bold text-text mb-1">Concierge management panel coming soon</h3>
              <p className="text-xs text-text-muted max-w-md mx-auto">
                Agent assignment, shift scheduling, and SLA tracking will be available in a future update.
              </p>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
