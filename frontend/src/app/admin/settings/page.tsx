'use client';

import React, { useState } from 'react';
import { AdminSidebar } from '@/components/dashboard/admin-sidebar';
import { AdminTopbar } from '@/components/dashboard/admin-topbar';
import { Shield, Key, Users, Check, X, Plus, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import {
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
} from '@/components/ui/table';
import { useAdminUsers, useAdminUpdateUserRole } from '@/hooks/use-admin';

const permissions = [
  'View Dashboard Analytics',
  'Manage Providers',
  'Manage Travelers',
  'Moderate Reviews',
  'Manage Destinations',
  'Process Refunds',
  'View Financial Ledgers',
  'Manage Platform Settings',
];

const roles = [
  {
    name: 'Super Admin',
    description: 'Full unhindered access to all platform operations and settings.',
    perms: permissions,
  },
  {
    name: 'Financial Auditor',
    description: 'Access to financial ledgers, refunds, and payment processing.',
    perms: ['View Dashboard Analytics', 'Process Refunds', 'View Financial Ledgers'],
  },
  {
    name: 'Concierge Manager',
    description: 'Manages traveler bookings, providers, and destinations.',
    perms: ['View Dashboard Analytics', 'Manage Providers', 'Manage Travelers', 'Moderate Reviews', 'Manage Destinations'],
  },
  {
    name: 'Support Agent',
    description: 'Basic access to assist travelers and providers.',
    perms: ['Manage Travelers', 'Moderate Reviews'],
  },
];

const ROLE_LABEL: Record<string, { label: string; color: string }> = {
  admin: { label: 'Super Admin', color: 'bg-primary-light text-primary-dark' },
  concierge: { label: 'Concierge Manager', color: 'bg-success-light text-success' },
  provider: { label: 'Provider', color: 'bg-warning-light text-warning' },
  traveler: { label: 'Traveler', color: 'bg-slate-light text-text-muted' },
};

const STAFF_ROLES = ['admin', 'concierge'] as const;

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState<'roles' | 'assignments'>('roles');
  const [assignModal, setAssignModal] = useState(false);
  const [editTarget, setEditTarget] = useState<{ id: string; name: string; role: string } | null>(null);
  const [selectedRole, setSelectedRole] = useState('concierge');
  const [searchEmail, setSearchEmail] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const { data: staffUsers, isLoading } = useAdminUsers({ role: 'admin' });
  const { data: conciergeUsers } = useAdminUsers({ role: 'concierge' });
  const updateRole = useAdminUpdateUserRole();

  const allStaff = [
    ...(staffUsers || []).map(u => ({ ...u, displayRole: 'admin' })),
    ...(conciergeUsers || []).map(u => ({ ...u, displayRole: 'concierge' })),
  ];

  const { data: allUsers } = useAdminUsers({ search: searchEmail || undefined, limit: 10 });
  const searchResults = searchEmail.length >= 2
    ? (allUsers || []).filter(u => u.role === 'traveler' || u.role === 'provider')
    : [];

  const handleRoleUpdate = () => {
    if (!editTarget) return;
    setFormError(null);
    updateRole.mutate({ id: editTarget.id, role: selectedRole }, {
      onSuccess: () => { setEditTarget(null); setSelectedRole('concierge'); },
      onError: (err: any) => setFormError(err.message || 'Failed to update role.'),
    });
  };

  const handleAssign = (userId: string) => {
    setFormError(null);
    updateRole.mutate({ id: userId, role: selectedRole }, {
      onSuccess: () => { setAssignModal(false); setSearchEmail(''); setSelectedRole('concierge'); },
      onError: (err: any) => setFormError(err.message || 'Failed to assign role.'),
    });
  };

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />
      <main className="flex-1 p-8 overflow-y-auto">
        <AdminTopbar title="Settings & Access Control" subtitle="Manage platform configurations, privileges, and role assignments." />

        <div className="flex border-b border-border mb-8">
          {(['roles', 'assignments'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-3 text-sm font-bold border-b-2 transition-colors ${
                activeTab === tab ? 'border-primary text-primary' : 'border-transparent text-text-muted hover:text-text'
              }`}
            >
              {tab === 'roles' ? 'Privilege Control (Roles)' : 'Role Assignments'}
            </button>
          ))}
        </div>

        {activeTab === 'roles' && (
          <div className="space-y-6">
            <div className="flex items-start justify-between mb-4 gap-4">
              <div>
                <h2 className="text-lg font-bold text-text flex items-center gap-2">
                  <Shield className="w-5 h-5 text-primary" />
                  Role-Based Access Control
                </h2>
                <p className="text-xs text-text-muted mt-1">
                  Platform roles are system-defined. Assign them to staff members in the Role Assignments tab.
                </p>
              </div>
              <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary-light/40 border border-primary/20 text-xs text-primary-dark font-semibold">
                <AlertCircle className="w-4 h-4 shrink-0" />
                Roles are system-enforced and cannot be customised in this version.
              </div>
            </div>

            <div className="bg-surface rounded-2xl border border-border shadow-card overflow-hidden">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-64 min-w-[250px]">Role / Privilege</TableHead>
                      {roles.map((r, idx) => (
                        <TableHead key={idx} className="text-center min-w-[140px]">
                          <div className="font-bold text-text">{r.name}</div>
                          <div className="text-[10px] font-normal text-text-muted leading-tight mt-1 px-2">{r.description}</div>
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {permissions.map((perm, pIdx) => (
                      <TableRow key={pIdx}>
                        <TableCell className="font-semibold text-text text-xs border-r border-border/50">{perm}</TableCell>
                        {roles.map((r, rIdx) => (
                          <TableCell key={rIdx} className="text-center">
                            {r.perms.includes(perm) ? (
                              <div className="mx-auto flex h-6 w-6 items-center justify-center rounded-full bg-success-light">
                                <Check className="w-4 h-4 text-success" />
                              </div>
                            ) : (
                              <div className="mx-auto flex h-6 w-6 items-center justify-center rounded-full bg-slate-light">
                                <X className="w-3.5 h-3.5 text-text-muted" />
                              </div>
                            )}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'assignments' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold text-text flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" />
                  Staff Role Assignments
                </h2>
                <p className="text-xs text-text-muted mt-1">
                  Promote existing platform users to Admin or Concierge roles.
                </p>
              </div>
              <Button variant="primary" size="sm" className="font-bold gap-2" onClick={() => { setAssignModal(true); setFormError(null); }}>
                <Key className="w-4 h-4" />
                <span>Assign New Staff</span>
              </Button>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-16 text-primary">
                <Loader2 className="w-7 h-7 animate-spin" />
              </div>
            ) : (
              <div className="bg-surface rounded-2xl border border-border shadow-card overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Staff Member</TableHead>
                      <TableHead>Email Address</TableHead>
                      <TableHead>Assigned Role</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {allStaff.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center text-text-muted py-10">
                          No admin or concierge staff assigned yet.
                        </TableCell>
                      </TableRow>
                    )}
                    {allStaff.map((u) => {
                      const badge = ROLE_LABEL[u.displayRole] || ROLE_LABEL.admin;
                      return (
                        <TableRow key={u.id}>
                          <TableCell className="font-bold text-text">{u.fullName}</TableCell>
                          <TableCell className="text-text-muted">{u.email}</TableCell>
                          <TableCell>
                            <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${badge.color}`}>
                              {badge.label}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 text-xs font-semibold"
                              onClick={() => {
                                setEditTarget({ id: u.id, name: u.fullName, role: u.displayRole });
                                setSelectedRole(u.displayRole);
                                setFormError(null);
                              }}
                            >
                              Change Role
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        )}

        {/* Assign New Staff Modal */}
        <Modal isOpen={assignModal} onClose={() => setAssignModal(false)} title="Assign Staff Role" maxWidth="sm">
          <div className="space-y-4 mt-2">
            {formError && (
              <div className="p-3 bg-danger-light border border-danger/20 rounded-xl text-xs font-semibold text-danger flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />{formError}
              </div>
            )}
            <div>
              <label className="block text-xs font-semibold text-text mb-1.5">Search User by Email</label>
              <input
                type="text"
                value={searchEmail}
                onChange={e => setSearchEmail(e.target.value)}
                placeholder="Type at least 2 characters..."
                className="w-full h-10 px-3 bg-surface border border-border rounded-lg text-sm focus:outline-none focus:border-primary"
              />
              {searchResults.length > 0 && (
                <div className="mt-2 border border-border rounded-xl overflow-hidden divide-y divide-border">
                  {searchResults.map(u => (
                    <div key={u.id} className="flex items-center justify-between px-3 py-2.5 hover:bg-slate-light/50">
                      <div>
                        <div className="text-xs font-bold text-text">{u.fullName}</div>
                        <div className="text-[11px] text-text-muted">{u.email}</div>
                      </div>
                      <Button
                        variant="primary"
                        size="sm"
                        className="text-xs font-bold"
                        onClick={() => handleAssign(u.id)}
                        isLoading={updateRole.isPending}
                      >
                        Assign
                      </Button>
                    </div>
                  ))}
                </div>
              )}
              {searchEmail.length >= 2 && searchResults.length === 0 && (
                <p className="text-xs text-text-muted mt-2">No traveler/provider users found for "{searchEmail}".</p>
              )}
            </div>
            <div>
              <label className="block text-xs font-semibold text-text mb-1.5">Role to Assign</label>
              <select
                value={selectedRole}
                onChange={e => setSelectedRole(e.target.value)}
                className="w-full h-10 px-3 bg-surface border border-border rounded-lg text-sm focus:outline-none focus:border-primary"
              >
                {STAFF_ROLES.map(r => (
                  <option key={r} value={r}>{ROLE_LABEL[r]?.label || r}</option>
                ))}
              </select>
            </div>
          </div>
        </Modal>

        {/* Change Role Modal */}
        <Modal isOpen={!!editTarget} onClose={() => setEditTarget(null)} title="Change Staff Role" maxWidth="sm">
          <div className="space-y-4 mt-2">
            {formError && (
              <div className="p-3 bg-danger-light border border-danger/20 rounded-xl text-xs font-semibold text-danger flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />{formError}
              </div>
            )}
            <p className="text-sm text-text-muted">
              Change the platform role for <strong className="text-text">{editTarget?.name}</strong>.
            </p>
            <div>
              <label className="block text-xs font-semibold text-text mb-1.5">New Role</label>
              <select
                value={selectedRole}
                onChange={e => setSelectedRole(e.target.value)}
                className="w-full h-10 px-3 bg-surface border border-border rounded-lg text-sm focus:outline-none focus:border-primary"
              >
                {STAFF_ROLES.map(r => (
                  <option key={r} value={r}>{ROLE_LABEL[r]?.label || r}</option>
                ))}
                <option value="traveler">Traveler (demote)</option>
              </select>
            </div>
            <div className="flex gap-3 pt-1">
              <Button variant="outline" className="flex-1" onClick={() => setEditTarget(null)}>Cancel</Button>
              <Button variant="primary" className="flex-1 font-bold" onClick={handleRoleUpdate} isLoading={updateRole.isPending}>
                Save Change
              </Button>
            </div>
          </div>
        </Modal>

      </main>
    </div>
  );
}
