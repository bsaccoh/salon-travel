'use client';

import React, { useState } from 'react';
import { AdminSidebar } from '@/components/dashboard/admin-sidebar';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import { Search, UserCheck, Ban, Eye, Loader2 } from 'lucide-react';
import { ActionDropdown } from '@/components/ui/dropdown';
import { useAdminUsers, useAdminSuspendUser, useAdminReactivateUser } from '@/hooks/use-admin';
import { ErrorState } from '@/components/ui/error-state';

const ROLE_FILTERS = [
  { value: '', label: 'All Roles' },
  { value: 'traveler', label: 'Travelers' },
  { value: 'provider', label: 'Providers' },
  { value: 'concierge', label: 'Concierge' },
  { value: 'admin', label: 'Admins' },
];

export default function AdminUsersPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const { data: users, isLoading, error, refetch } = useAdminUsers({
    search: searchQuery || undefined,
    role: roleFilter || undefined,
  });
  const suspendUser = useAdminSuspendUser();
  const reactivateUser = useAdminReactivateUser();

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />

      <main className="flex-1 p-8 overflow-y-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-text">User Management</h1>
            <p className="text-xs text-text-muted mt-1">
              Audit and manage platform travelers, provider hosts, and concierge staff
            </p>
          </div>
        </div>

        <div className="bg-surface rounded-xl p-4 border border-border shadow-subtle mb-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 w-full md:w-80 px-3 py-2 rounded-lg bg-background border border-border">
            <Search className="w-4 h-4 text-text-muted" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent text-xs text-text focus:outline-none w-full"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto">
            {ROLE_FILTERS.map((r) => (
              <button
                key={r.value}
                onClick={() => setRoleFilter(r.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap ${
                  roleFilter === r.value ? 'bg-primary-dark text-white' : 'bg-background text-text-muted hover:text-text'
                }`}
              >
                {r.label}
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
        ) : (
          <div className="rounded-2xl border border-border bg-surface shadow-card overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(users || []).map((u) => (
                  <TableRow key={u.id}>
                    <TableCell className="font-bold text-text">{u.fullName}</TableCell>
                    <TableCell className="text-text-muted font-medium">{u.email}</TableCell>
                    <TableCell>
                      <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-primary-light text-primary">
                        {u.role}
                      </span>
                    </TableCell>
                    <TableCell className="text-text-muted font-medium">
                      {new Date(u.createdAt).toLocaleDateString('en-GB', {
                        day: '2-digit', month: 'short', year: 'numeric',
                      })}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`text-xs font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                          u.status === 'active'
                            ? 'bg-success-light text-success'
                            : 'bg-danger-light text-danger'
                        }`}
                      >
                        {u.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end">
                        <ActionDropdown
                          items={[
                            {
                              label: 'View Profile',
                              icon: Eye,
                              onClick: () => {},
                            },
                            u.status === 'active'
                              ? {
                                  label: 'Suspend User',
                                  icon: Ban,
                                  variant: 'danger' as const,
                                  onClick: () => suspendUser.mutate(u.id),
                                }
                              : {
                                  label: 'Reactivate User',
                                  icon: UserCheck,
                                  variant: 'success' as const,
                                  onClick: () => reactivateUser.mutate(u.id),
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
