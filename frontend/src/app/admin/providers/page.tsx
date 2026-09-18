'use client';

import React, { useState } from 'react';
import { AdminSidebar } from '@/components/dashboard/admin-sidebar';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import { useRouter } from 'next/navigation';
import { Search, ShieldCheck, Eye, Loader2 } from 'lucide-react';
import { ActionDropdown } from '@/components/ui/dropdown';
import { useAdminProviders } from '@/hooks/use-admin';
import { ErrorState } from '@/components/ui/error-state';

export default function AdminProvidersDirectoryPage() {
  const router = useRouter();
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const statusFilter = filter === 'approved' ? 'approved' : filter === 'pending' ? 'submitted' : undefined;
  const { data: providers, isLoading, error, refetch } = useAdminProviders({
    status: statusFilter,
    search: searchQuery || undefined,
  });

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />

      <main className="flex-1 p-8 overflow-y-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-text">Providers Directory</h1>
            <p className="text-xs text-text-muted mt-1">
              Audit partner compliance, verify government credentials, and manage provider status
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-surface rounded-xl p-4 border border-border shadow-subtle mb-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 w-full md:w-80 px-3 py-2 rounded-lg bg-background border border-border">
            <Search className="w-4 h-4 text-text-muted" />
            <input
              type="text"
              placeholder="Search provider by name or city..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent text-xs text-text focus:outline-none w-full"
            />
          </div>

          <div className="flex items-center gap-2">
            {(['all', 'approved', 'pending'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold ${
                  filter === f ? 'bg-primary-dark text-white' : 'bg-background text-text-muted hover:text-text'
                }`}
              >
                {f === 'all' ? 'All' : f === 'approved' ? 'Approved' : 'Pending Verification'}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
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
                  <TableHead>Provider Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(providers || []).map((p) => (
                  <TableRow
                    key={p.id}
                    className="cursor-pointer hover:bg-slate-light/30"
                    onClick={() => router.push(`/admin/providers/${p.id}`)}
                  >
                    <TableCell className="font-bold text-text">{p.businessName}</TableCell>
                    <TableCell className="text-text-muted font-medium">{p.category}</TableCell>
                    <TableCell className="text-text-muted font-medium">{p.city}</TableCell>
                    <TableCell className="font-bold text-warning">
                      {p.ratingAverage > 0 ? `${p.ratingAverage.toFixed(1)} ★` : 'New'}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`text-xs font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                          p.status === 'approved'
                            ? 'bg-success-light text-success'
                            : p.status === 'suspended'
                            ? 'bg-danger-light text-danger'
                            : 'bg-warning-light text-text'
                        }`}
                      >
                        {p.status.replace('_', ' ')}
                      </span>
                    </TableCell>
                    <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex justify-end">
                        <ActionDropdown
                          items={[
                            {
                              label: 'Audit & Verify',
                              icon: ShieldCheck,
                              onClick: () => router.push(`/admin/providers/${p.id}`),
                            },
                            {
                              label: 'View Public Profile',
                              icon: Eye,
                              onClick: () => window.open(`/providers/${p.slug}`, '_blank'),
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
