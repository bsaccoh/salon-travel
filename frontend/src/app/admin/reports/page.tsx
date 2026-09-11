'use client';

import React from 'react';
import { AdminSidebar } from '@/components/dashboard/admin-sidebar';
import { AdminTopbar } from '@/components/dashboard/admin-topbar';
import { FileText } from 'lucide-react';

export default function AdminReportsPage() {
  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />
      <main className="flex-1 p-8 overflow-y-auto">
        <AdminTopbar title="Reports" subtitle="Downloadable business intelligence and tax reports" />
        <div className="flex flex-col items-center justify-center py-32 text-text-muted">
          <FileText className="w-16 h-16 mb-4 text-border" />
          <h2 className="text-xl font-bold text-text mb-2">Coming Soon</h2>
          <p className="text-sm">Comprehensive reporting will be implemented in a future phase.</p>
        </div>
      </main>
    </div>
  );
}
