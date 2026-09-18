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
import { Search, UserCheck, Ban, Eye, Loader2, UserPlus, X } from 'lucide-react';
import { ActionDropdown } from '@/components/ui/dropdown';
import { useAdminUsers, useAdminSuspendUser, useAdminReactivateUser } from '@/hooks/use-admin';
import { ErrorState } from '@/components/ui/error-state';
import { apiClient } from '@/lib/api-client';

const ROLES = ['traveler', 'provider', 'concierge', 'admin'] as const;

function AddUserModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [form, setForm] = useState({ fullName: '', email: '', password: '', role: 'traveler' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await apiClient.post('/admin/users', form);
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to create user');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-surface border border-border rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-text">Add New User</h2>
          <button onClick={onClose} className="text-text-muted hover:text-text transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

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
              placeholder="John Doe"
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
              placeholder="user@example.com"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-text-muted mb-1.5">Password</label>
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
          <div>
            <label className="block text-xs font-bold text-text-muted mb-1.5">Role</label>
            <select
              value={form.role}
              onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
              className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-text text-sm focus:outline-none focus:border-primary"
            >
              {ROLES.map(r => (
                <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>
              ))}
            </select>
          </div>
          <div className="flex gap-3 mt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-lg border border-border text-text text-sm font-semibold hover:bg-background transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2.5 rounded-lg bg-primary text-white text-sm font-bold hover:bg-primary-dark transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

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
  const [showAddUser, setShowAddUser] = useState(false);
  const { data: users, isLoading, error, refetch } = useAdminUsers({
    search: searchQuery || undefined,
    role: roleFilter || undefined,
  });
  const suspendUser = useAdminSuspendUser();
  const reactivateUser = useAdminReactivateUser();

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />

      {showAddUser && (
        <AddUserModal onClose={() => setShowAddUser(false)} onSuccess={() => refetch()} />
      )}

      <main className="flex-1 p-8 overflow-y-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-text">User Management</h1>
            <p className="text-xs text-text-muted mt-1">
              Audit and manage platform travelers, provider hosts, and concierge staff
            </p>
          </div>
          <button
            onClick={() => setShowAddUser(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-white text-sm font-bold hover:bg-primary-dark transition-colors shadow-sm"
          >
            <UserPlus className="w-4 h-4" />
            Add User
          </button>
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
