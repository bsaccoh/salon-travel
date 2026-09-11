'use client';

import React from 'react';
import { ProviderSidebar } from '@/components/dashboard/provider-sidebar';
import { Button } from '@/components/ui/button';
import { CreditCard, CheckCircle2, Loader2 } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { useMyProvider } from '@/hooks/use-providers';

export default function ProviderSettingsPage() {
  const { user } = useAuth();
  const { data: provider, isLoading } = useMyProvider();

  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-background">
        <ProviderSidebar />
        <main className="flex-1 p-8 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      <ProviderSidebar />

      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-4xl space-y-8">
          <div>
            <h1 className="text-2xl font-bold text-text">Account Settings</h1>
            <p className="text-xs text-text-muted mt-1">
              Configure payout bank accounts, Stripe Connect status, and notification preferences
            </p>
          </div>

          {/* Account Info */}
          <div className="p-6 sm:p-8 rounded-2xl border border-border bg-surface shadow-card space-y-4">
            <h3 className="text-base font-bold text-text">Account Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-text-muted">Name</span>
                <p className="font-semibold text-text mt-0.5">{user?.fullName || '—'}</p>
              </div>
              <div>
                <span className="text-text-muted">Email</span>
                <p className="font-semibold text-text mt-0.5">{user?.email || '—'}</p>
              </div>
              <div>
                <span className="text-text-muted">Business</span>
                <p className="font-semibold text-text mt-0.5">{provider?.businessName || '—'}</p>
              </div>
              <div>
                <span className="text-text-muted">Provider Status</span>
                <p className="font-semibold text-text mt-0.5 capitalize">{provider?.status?.replace('_', ' ') || '—'}</p>
              </div>
            </div>
          </div>

          {/* Payouts Box */}
          <div className="p-6 sm:p-8 rounded-2xl border border-border bg-surface shadow-card space-y-5">
            <div className="flex items-center justify-between border-b border-border/70 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-success-light text-success flex items-center justify-center">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-text">Direct Payouts & Stripe Connect</h3>
                  <p className="text-xs text-text-muted">Automatic weekly payouts to your local bank</p>
                </div>
              </div>

              <span className="inline-flex items-center gap-1 text-xs font-bold text-text-muted bg-border/20 px-2.5 py-1 rounded-full">
                <span>Not Connected</span>
              </span>
            </div>

            <p className="text-xs text-text-muted">
              Connect your Stripe account to receive direct payouts from traveler bookings.
            </p>

            <Button variant="outline" size="sm">
              Connect Stripe Account
            </Button>
          </div>

          {/* Notification Preferences */}
          <div className="p-6 sm:p-8 rounded-2xl border border-border bg-surface shadow-card space-y-4">
            <h3 className="text-base font-bold text-text">Notification Channels</h3>

            <div className="space-y-3">
              <label className="flex items-center gap-3 text-xs font-semibold text-text cursor-pointer">
                <input type="checkbox" defaultChecked className="rounded border-border text-primary w-4 h-4" />
                <span>Instant SMS notifications for new booking requests</span>
              </label>

              <label className="flex items-center gap-3 text-xs font-semibold text-text cursor-pointer">
                <input type="checkbox" defaultChecked className="rounded border-border text-primary w-4 h-4" />
                <span>WhatsApp dispatcher coordination alerts</span>
              </label>

              <label className="flex items-center gap-3 text-xs font-semibold text-text cursor-pointer">
                <input type="checkbox" defaultChecked className="rounded border-border text-primary w-4 h-4" />
                <span>Weekly revenue summaries & payout receipts</span>
              </label>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
