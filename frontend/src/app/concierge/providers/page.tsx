'use client';

import React from 'react';
import { ConciergeSidebar } from '@/components/concierge/sidebar';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Search, Building2, MapPin, Star, ChevronDown, CheckCircle2, Loader2 } from 'lucide-react';
import { useProviders } from '@/hooks/use-providers';
import { ErrorState } from '@/components/ui/error-state';

export default function ConciergeProvidersPage() {
  const { data: providers, isLoading, error, refetch } = useProviders();

  return (
    <div className="grid grid-rows-1 h-screen overflow-hidden bg-background text-text grid-cols-[80px_1fr] lg:grid-cols-[260px_1fr]">
      <ConciergeSidebar />
      <main className="min-h-0 flex-1 flex flex-col min-w-0 h-full overflow-y-auto bg-[#FAFCFC]">
        {/* Page Header */}
        <div className="px-8 py-6 border-b border-border bg-surface sticky top-0 z-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-text">Providers</h1>
              <p className="text-sm text-text-muted mt-1">Find verified providers for traveler requests and bookings.</p>
            </div>
          </div>
        </div>

        <div className="p-8 max-w-[1400px] w-full mx-auto space-y-6">
          {/* Summary KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-surface border border-border rounded-xl p-5 shadow-sm">
              <div className="text-2xl font-extrabold text-text">{(providers || []).length}</div>
              <div className="text-xs font-semibold text-text-muted uppercase tracking-wider mt-1">Listed Providers</div>
            </div>
            <div className="bg-surface border border-border rounded-xl p-5 shadow-sm">
              <div className="text-2xl font-extrabold text-success">
                {(providers || []).filter((p) => p.status === 'approved').length}
              </div>
              <div className="text-xs font-semibold text-text-muted uppercase tracking-wider mt-1">Approved</div>
            </div>
            <div className="bg-surface border border-border rounded-xl p-5 shadow-sm">
              <div className="text-2xl font-extrabold text-text">
                {new Set((providers || []).map((p) => p.category)).size}
              </div>
              <div className="text-xs font-semibold text-text-muted uppercase tracking-wider mt-1">Service Categories</div>
            </div>
            <div className="bg-surface border border-border rounded-xl p-5 shadow-sm">
              <div className="text-2xl font-extrabold text-text flex items-center gap-1.5">
                {(providers || []).length > 0
                  ? (
                      (providers || []).reduce((sum, p) => sum + (p.ratingAverage || 0), 0) /
                      (providers || []).filter((p) => (p.ratingAverage || 0) > 0).length || 0
                    ).toFixed(1)
                  : '—'}
                <Star className="w-5 h-5 text-warning fill-warning" />
              </div>
              <div className="text-xs font-semibold text-text-muted uppercase tracking-wider mt-1">Average Rating</div>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="bg-surface border border-border rounded-xl p-2 shadow-sm flex flex-wrap items-center gap-2">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input
                type="text"
                placeholder="Search Providers..."
                className="w-full pl-9 pr-4 py-2 bg-transparent text-sm focus:outline-none placeholder:text-text-muted"
              />
            </div>
            <div className="h-6 w-px bg-border mx-1 hidden sm:block" />
            <Button variant="ghost" size="sm" className="gap-1.5 text-text-muted hover:text-text font-semibold">
              Category <ChevronDown className="w-3.5 h-3.5" />
            </Button>
            <Button variant="ghost" size="sm" className="gap-1.5 text-text-muted hover:text-text font-semibold">
              Location <ChevronDown className="w-3.5 h-3.5" />
            </Button>
          </div>

          {/* Directory Table */}
          {isLoading ? (
            <div className="flex items-center justify-center py-20 text-primary">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
          ) : error ? (
            <ErrorState onRetry={() => refetch()} />
          ) : (
            <div className="bg-surface border border-border rounded-xl shadow-sm overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Provider</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(providers || []).map((provider) => (
                    <TableRow key={provider.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary-light text-primary flex items-center justify-center shrink-0">
                            <Building2 className="w-4 h-4" />
                          </div>
                          <span className="font-bold text-sm text-text">{provider.businessName}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm font-medium">{provider.category}</span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5 text-sm text-text-muted">
                          <MapPin className="w-3.5 h-3.5" />
                          <span>{provider.city}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          <Star className="w-3.5 h-3.5 text-warning fill-warning" />
                          <span className="text-sm font-bold">
                            {provider.ratingAverage > 0 ? provider.ratingAverage.toFixed(1) : 'New'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {provider.status === 'approved' ? (
                          <div className="flex items-center gap-1.5 text-success">
                            <CheckCircle2 className="w-4 h-4" />
                            <span className="text-xs font-bold uppercase tracking-wider">Verified</span>
                          </div>
                        ) : (
                          <span className="text-xs font-bold uppercase tracking-wider text-text-muted">
                            {provider.status.replace('_', ' ')}
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" className="font-bold text-primary hover:text-primary-dark">
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
