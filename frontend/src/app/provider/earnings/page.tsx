'use client';

import React from 'react';
import { ProviderSidebar } from '@/components/dashboard/provider-sidebar';
import { CreditCard, TrendingUp, DollarSign, Loader2 } from 'lucide-react';
import { KPICard } from '@/components/ui/kpi-card';
import { useProviderDashboard } from '@/hooks/use-providers';
import { formatCurrency } from '@/lib/currency';

export default function ProviderEarningsPage() {
  const { data: dashboard } = useProviderDashboard();

  return (
    <div className="flex min-h-screen bg-background">
      <ProviderSidebar />
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-text flex items-center gap-2">
            <CreditCard className="w-6 h-6" /> Earnings & Payouts
          </h1>
          <p className="text-xs text-text-muted mt-1">
            Track your revenue, commission deductions, and payout history.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          <KPICard
            label="Gross Booking Value"
            value={dashboard ? formatCurrency(dashboard.grossBookingValue) : '—'}
            icon={DollarSign}
            iconBgColor="bg-success-light text-success"
          />
          <KPICard
            label="Net Earnings"
            value={dashboard ? formatCurrency(dashboard.netEarnings) : '—'}
            icon={TrendingUp}
            iconBgColor="bg-primary-light text-primary"
          />
          <KPICard
            label="Commission Deducted"
            value={dashboard ? formatCurrency(dashboard.commission) : '—'}
            icon={CreditCard}
            subtext="15% effective rate"
            iconBgColor="bg-warning-light text-warning"
          />
        </div>

        <div className="rounded-2xl border border-border bg-surface shadow-card p-8 text-center">
          <DollarSign className="w-10 h-10 text-text-muted mx-auto mb-3" />
          <h3 className="text-base font-bold text-text mb-1">Payout history coming soon</h3>
          <p className="text-xs text-text-muted max-w-md mx-auto">
            Detailed payout breakdowns and bank transfer history will be available once Stripe Connect payouts are activated.
          </p>
        </div>
      </main>
    </div>
  );
}
