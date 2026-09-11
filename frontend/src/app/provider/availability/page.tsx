'use client';

import React from 'react';
import { ProviderSidebar } from '@/components/dashboard/provider-sidebar';
import { Calendar, Clock, Loader2 } from 'lucide-react';
import { useMyServices } from '@/hooks/use-services';
import { ErrorState } from '@/components/ui/error-state';

export default function ProviderAvailabilityPage() {
  const { data: services, isLoading, error, refetch } = useMyServices();

  return (
    <div className="flex min-h-screen bg-background">
      <ProviderSidebar />
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-text flex items-center gap-2">
            <Calendar className="w-6 h-6" /> Availability Management
          </h1>
          <p className="text-xs text-text-muted mt-1">
            Configure operating hours and availability windows for your services.
          </p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20 text-primary">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
        ) : error ? (
          <ErrorState onRetry={() => refetch()} />
        ) : (
          <div className="space-y-4">
            {(services || []).length === 0 ? (
              <div className="rounded-2xl border border-border bg-surface shadow-card p-12 text-center">
                <Clock className="w-10 h-10 text-text-muted mx-auto mb-3" />
                <h3 className="text-base font-bold text-text mb-1">No services listed yet</h3>
                <p className="text-xs text-text-muted">Add services first, then configure their availability windows here.</p>
              </div>
            ) : (
              (services || []).map((service) => (
                <div key={service.id} className="rounded-2xl border border-border bg-surface shadow-card p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-bold text-text">{service.name}</h3>
                      <p className="text-xs text-text-muted mt-0.5">
                        Base price: Le {((service.priceCents || 0) / 100).toFixed(2)} &middot; Max capacity: {service.maxCapacity || '—'}
                      </p>
                    </div>
                    <span className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${service.isAvailable ? 'bg-success/10 text-success' : 'bg-text-muted/10 text-text-muted'}`}>
                      {service.isAvailable ? 'Available' : 'Unavailable'}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </main>
    </div>
  );
}
