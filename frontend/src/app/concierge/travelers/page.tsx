'use client';

import React from 'react';
import { ConciergeSidebar } from '@/components/concierge/sidebar';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Search, ChevronDown, User, Mail, Phone, Calendar, Loader2 } from 'lucide-react';
import { useAdminUsers } from '@/hooks/use-admin';
import { ErrorState } from '@/components/ui/error-state';

export default function ConciergeTravelersPage() {
  const { data: users, isLoading, error, refetch } = useAdminUsers({ role: 'traveler' });

  return (
    <div className="grid grid-rows-1 h-screen overflow-hidden bg-background text-text grid-cols-[80px_1fr] lg:grid-cols-[260px_1fr]">
      <ConciergeSidebar />
      <main className="min-h-0 flex-1 flex flex-col min-w-0 h-full overflow-y-auto bg-[#FAFCFC]">
        {/* Page Header */}
        <div className="px-8 py-6 border-b border-border bg-surface sticky top-0 z-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-text">Travelers</h1>
              <p className="text-sm text-text-muted mt-1">Find travelers and review booking and support history.</p>
            </div>
          </div>
        </div>

        <div className="p-8 max-w-[1400px] w-full mx-auto space-y-6">

          {/* Filter Bar */}
          <div className="bg-surface border border-border rounded-xl p-2 shadow-sm flex flex-wrap items-center gap-2">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input
                type="text"
                placeholder="Search by name, email, phone, or booking ref..."
                className="w-full pl-9 pr-4 py-2 bg-transparent text-sm focus:outline-none placeholder:text-text-muted"
              />
            </div>
            <div className="h-6 w-px bg-border mx-1 hidden sm:block" />
            <Button variant="ghost" size="sm" className="gap-1.5 text-text-muted hover:text-text font-semibold">
              Active Booking <ChevronDown className="w-3.5 h-3.5" />
            </Button>
            <Button variant="ghost" size="sm" className="gap-1.5 text-text-muted hover:text-text font-semibold">
              Open Conversation <ChevronDown className="w-3.5 h-3.5" />
            </Button>
            <Button variant="ghost" size="sm" className="gap-1.5 text-text-muted hover:text-text font-semibold">
              Has Emergency <ChevronDown className="w-3.5 h-3.5" />
            </Button>
            <Button variant="ghost" size="sm" className="gap-1.5 text-text-muted hover:text-text font-semibold">
              Returning Traveler <ChevronDown className="w-3.5 h-3.5" />
            </Button>
          </div>

          {/* Directory Table */}
          {error ? (
            <ErrorState onRetry={() => refetch()} />
          ) : (
          <div className="bg-surface border border-border rounded-xl shadow-sm overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Traveler</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="text-center">Trips</TableHead>
                  <TableHead className="text-center">Active Bookings</TableHead>
                  <TableHead>Total Spend</TableHead>
                  <TableHead>Last Activity</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-12">
                      <Loader2 className="w-6 h-6 animate-spin text-primary mx-auto" />
                    </TableCell>
                  </TableRow>
                ) : (users ?? []).length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-12 text-text-muted">
                      No travelers found.
                    </TableCell>
                  </TableRow>
                ) : (
                  (users ?? []).map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-light text-text flex items-center justify-center shrink-0 font-bold text-xs uppercase">
                            {user.fullName.charAt(0)}
                          </div>
                          <span className="font-bold text-sm text-text">{user.fullName}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5 text-sm text-text-muted">
                          <Mail className="w-3.5 h-3.5 shrink-0" />
                          <span className="truncate max-w-[120px] sm:max-w-none">{user.email}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5 text-sm text-text-muted">
                          <Phone className="w-3.5 h-3.5 shrink-0" />
                          <span>{user.phone || '—'}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5 text-sm font-medium">
                          <Calendar className="w-3.5 h-3.5 text-text-muted shrink-0" />
                          <span>{new Date(user.createdAt).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="text-sm font-bold text-text">—</span>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="text-sm text-text-muted">—</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm font-bold text-text">—</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-xs text-text-muted font-medium">{user.status === 'active' ? 'Active' : '—'}</span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" className="font-bold text-primary hover:text-primary-dark">
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          )}
        </div>
      </main>
    </div>
  );
}
