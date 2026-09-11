'use client';

import React from 'react';
import { AdminSidebar } from '@/components/dashboard/admin-sidebar';
import { AdminTopbar } from '@/components/dashboard/admin-topbar';
import { Box } from 'lucide-react';

export default function AdminServicesPage() {
  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />
      <main className="flex-1 p-8 overflow-y-auto">
        <AdminTopbar title="Services" subtitle="Manage marketplace service categories and offerings" />
        <div className="flex flex-col items-center justify-center py-32 text-text-muted">
          <Box className="w-16 h-16 mb-4 text-border" />
          <h2 className="text-xl font-bold text-text mb-2">Coming Soon</h2>
          <p className="text-sm">Service category management will be implemented in Phase E (Marketplace Intelligence).</p>
        </div>
      </main>
    </div>
  );
}
