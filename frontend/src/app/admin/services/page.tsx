'use client';

import React, { useState } from 'react';
import { AdminSidebar } from '@/components/dashboard/admin-sidebar';
import { AdminTopbar } from '@/components/dashboard/admin-topbar';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import { Search, Loader2, Package, Clock, Users } from 'lucide-react';
import { useServices } from '@/hooks/use-services';
import { ErrorState } from '@/components/ui/error-state';

const SERVICE_TYPES = ['', 'tour', 'accommodation', 'transport', 'experience', 'dining'];

function formatPrice(cents: number, currency = 'SLL') {
  return `${currency} ${(cents / 100).toLocaleString()}`;
}

export default function AdminServicesPage() {
  const [typeFilter, setTypeFilter] = useState('');
  const [search, setSearch] = useState('');
  const { data: services, isLoading, error, refetch } = useServices({
    type: typeFilter || undefined,
  });

  const filtered = (services || []).filter(s =>
    !search || s.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />

      <main className="flex-1 p-8 overflow-y-auto">
        <AdminTopbar title="Services" subtitle="Marketplace service catalog from all providers" />

        <div className="bg-surface rounded-xl p-4 border border-border shadow-subtle mb-6 flex flex-col md:flex-row items-center gap-4">
          <div className="flex items-center gap-2 w-full md:w-80 px-3 py-2 rounded-lg bg-background border border-border">
            <Search className="w-4 h-4 text-text-muted shrink-0" />
            <input
              type="text"
              placeholder="Search service name..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="bg-transparent text-xs text-text focus:outline-none w-full"
            />
          </div>
          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto">
            {SERVICE_TYPES.map(t => (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap capitalize ${
                  typeFilter === t ? 'bg-primary-dark text-white' : 'bg-background text-text-muted hover:text-text'
                }`}
              >
                {t || 'All Types'}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20 text-primary">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
        ) : error ? (
          <ErrorState onRetry={() => refetch()} />
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-text-muted">
            <Package className="w-14 h-14 mb-4 text-border" />
            <h2 className="text-lg font-bold text-text mb-1">No services yet</h2>
            <p className="text-sm text-center max-w-sm">
              Services are created by approved providers. Once a provider publishes offerings they will appear here.
            </p>
          </div>
        ) : (
          <div className="rounded-2xl border border-border bg-surface shadow-card overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Service</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Capacity</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(s => (
                  <TableRow key={s.id}>
                    <TableCell>
                      <div>
                        <p className="font-bold text-text text-sm">{s.name}</p>
                        {s.shortDescription && (
                          <p className="text-xs text-text-muted mt-0.5 line-clamp-1">{s.shortDescription}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-primary-light text-primary capitalize">
                        {s.type}
                      </span>
                    </TableCell>
                    <TableCell className="font-semibold text-text text-sm">
                      {formatPrice(s.priceCents, s.currency)}
                    </TableCell>
                    <TableCell>
                      {s.durationMinutes ? (
                        <span className="flex items-center gap-1 text-xs text-text-muted">
                          <Clock className="w-3 h-3" />
                          {s.durationMinutes >= 60
                            ? `${Math.floor(s.durationMinutes / 60)}h${s.durationMinutes % 60 ? ` ${s.durationMinutes % 60}m` : ''}`
                            : `${s.durationMinutes}m`}
                        </span>
                      ) : (
                        <span className="text-xs text-text-muted">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {s.maxCapacity ? (
                        <span className="flex items-center gap-1 text-xs text-text-muted">
                          <Users className="w-3 h-3" />
                          {s.maxCapacity}
                        </span>
                      ) : (
                        <span className="text-xs text-text-muted">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                        s.isActive !== false
                          ? 'bg-success-light text-success'
                          : 'bg-danger-light text-danger'
                      }`}>
                        {s.isActive !== false ? 'Active' : 'Inactive'}
                      </span>
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
