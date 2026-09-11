'use client';

import React, { useState } from 'react';
import { AdminSidebar } from '@/components/dashboard/admin-sidebar';
import { AdminTopbar } from '@/components/dashboard/admin-topbar';
import { Shield, Key, Users, Check, X, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState<'roles' | 'assignments'>('roles');

  const permissions = [
    'View Dashboard Analytics',
    'Manage Providers',
    'Manage Travelers',
    'Moderate Reviews',
    'Manage Destinations',
    'Process Refunds',
    'View Financial Ledgers',
    'Manage Platform Settings'
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
    }
  ];

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />
      <main className="flex-1 p-8 overflow-y-auto">
        <AdminTopbar title="Settings & Access Control" subtitle="Manage platform configurations, privileges, and role assignments." />
        
        <div className="flex border-b border-border mb-8">
          <button
            onClick={() => setActiveTab('roles')}
            className={`px-4 py-3 text-sm font-bold border-b-2 transition-colors ${
              activeTab === 'roles' ? 'border-primary text-primary' : 'border-transparent text-text-muted hover:text-text'
            }`}
          >
            Privilege Control (Roles)
          </button>
          <button
            onClick={() => setActiveTab('assignments')}
            className={`px-4 py-3 text-sm font-bold border-b-2 transition-colors ${
              activeTab === 'assignments' ? 'border-primary text-primary' : 'border-transparent text-text-muted hover:text-text'
            }`}
          >
            Role Assignments
          </button>
        </div>

        {activeTab === 'roles' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold text-text flex items-center gap-2">
                  <Shield className="w-5 h-5 text-primary" />
                  Role-Based Access Control
                </h2>
                <p className="text-xs text-text-muted mt-1">Define platform roles and their exact privileges.</p>
              </div>
              <Button variant="primary" size="sm" className="font-bold gap-2">
                <Plus className="w-4 h-4" />
                <span>Create Custom Role</span>
              </Button>
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
                        <TableCell className="font-semibold text-text text-xs border-r border-border/50">
                          {perm}
                        </TableCell>
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
                <p className="text-xs text-text-muted mt-1">Assign internal staff to defined platform roles.</p>
              </div>
              <Button variant="primary" size="sm" className="font-bold gap-2">
                <Key className="w-4 h-4" />
                <span>Assign New Staff</span>
              </Button>
            </div>

            <div className="bg-surface rounded-2xl border border-border shadow-card overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Staff Member</TableHead>
                    <TableHead>Email Address</TableHead>
                    <TableHead>Assigned Role</TableHead>
                    <TableHead>Assigned By</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-bold text-text">Aminata Turay</TableCell>
                    <TableCell className="text-text-muted">aminata.t@salone.travel</TableCell>
                    <TableCell>
                      <span className="px-2.5 py-1 rounded-full bg-primary-light text-primary-dark text-xs font-bold">
                        Super Admin
                      </span>
                    </TableCell>
                    <TableCell className="text-xs text-text-muted">System Initialized</TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm" className="h-8 text-xs font-semibold">Edit Access</Button>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-bold text-text">David Sesay</TableCell>
                    <TableCell className="text-text-muted">david.s@salone.travel</TableCell>
                    <TableCell>
                      <span className="px-2.5 py-1 rounded-full bg-warning-light text-warning text-xs font-bold">
                        Financial Auditor
                      </span>
                    </TableCell>
                    <TableCell className="text-xs text-text-muted">Aminata Turay</TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm" className="h-8 text-xs font-semibold">Edit Access</Button>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-bold text-text">Fatmata Conteh</TableCell>
                    <TableCell className="text-text-muted">fatmata.c@salone.travel</TableCell>
                    <TableCell>
                      <span className="px-2.5 py-1 rounded-full bg-success-light text-success text-xs font-bold">
                        Concierge Manager
                      </span>
                    </TableCell>
                    <TableCell className="text-xs text-text-muted">Aminata Turay</TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm" className="h-8 text-xs font-semibold">Edit Access</Button>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
