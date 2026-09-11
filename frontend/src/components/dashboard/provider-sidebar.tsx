'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  Building2,
  LayoutDashboard,
  Calendar,
  Box,
  CheckSquare,
  FileCheck,
  CreditCard,
  Star,
  BarChart3,
  Bell,
  Settings,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';
import { MobileSidebarToggle } from '@/components/ui/mobile-sidebar';

const navigationGroups = [
  {
    label: 'Overview',
    items: [
      { name: 'Dashboard', href: '/provider', icon: LayoutDashboard },
    ]
  },
  {
    label: 'Operations',
    items: [
      { name: 'Bookings', href: '/provider/bookings', icon: Calendar, badge: 3 },
      { name: 'Services', href: '/provider/services', icon: Box },
      { name: 'Availability', href: '/provider/availability', icon: CheckSquare },
    ]
  },
  {
    label: 'Business',
    items: [
      { name: 'Business Profile', href: '/provider/profile', icon: Building2 },
      { name: 'Verification', href: '/provider/verification', icon: FileCheck, badge: 1 },
      { name: 'Documents', href: '/provider/documents', icon: FileCheck },
    ]
  },
  {
    label: 'Performance',
    items: [
      { name: 'Earnings', href: '/provider/earnings', icon: CreditCard },
      { name: 'Reviews', href: '/provider/reviews', icon: Star },
      { name: 'Analytics', href: '/provider/analytics', icon: BarChart3 },
    ]
  },
  {
    label: 'Account',
    items: [
      { name: 'Notifications', href: '/provider/notifications', icon: Bell, badge: 4 },
      { name: 'Settings', href: '/provider/settings', icon: Settings },
    ]
  }
];

function SidebarContent({ collapsed, setCollapsed }: { collapsed: boolean; setCollapsed: (v: boolean) => void }) {
  const pathname = usePathname();

  return (
    <aside className={cn('bg-primary-dark text-white flex flex-col shrink-0 h-screen sticky top-0 border-r border-white/10 transition-all duration-300', collapsed ? 'w-[72px]' : 'w-64')}>
      {/* Header */}
      <div className="p-4 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-surface flex items-center justify-center text-primary-dark shadow-sm shrink-0">
            <Building2 className="w-5 h-5 text-primary" />
          </div>
          {!collapsed && (
            <div className="flex flex-col min-w-0">
              <span className="font-bold text-base tracking-tight text-white">
                Salone<span className="text-warning">Provider</span>
              </span>
              <span className="text-[10px] font-semibold text-white/60 uppercase tracking-widest -mt-0.5">
                Partner Workspace
              </span>
            </div>
          )}
        </div>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-lg text-white/50 hover:bg-white/10 hover:text-white transition-colors shrink-0 hidden md:block"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <PanelLeftOpen className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-2 space-y-6 overflow-y-auto">
        {navigationGroups.map((group) => (
          <div key={group.label} className="space-y-1.5">
            {group.label !== 'Overview' && !collapsed && (
              <h3 className="px-3.5 text-[10px] font-bold text-white/40 uppercase tracking-wider mb-2">
                {group.label}
              </h3>
            )}
            {group.items.map((item) => {
              const isActive = item.href === '/provider'
                ? pathname === '/provider'
                : pathname === item.href || pathname.startsWith(item.href + '/');

              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  title={collapsed ? item.name : undefined}
                  className={cn(
                    'flex items-center rounded-xl text-xs font-semibold tracking-wide transition-smooth',
                    collapsed ? 'justify-center px-2 py-2.5' : 'justify-between px-3.5 py-2.5',
                    isActive
                      ? 'bg-white/15 text-warning font-bold shadow-xs'
                      : 'text-white/70 hover:bg-white/10 hover:text-white',
                  )}
                >
                  <div className={cn('flex items-center', collapsed ? '' : 'gap-3')}>
                    <Icon className={cn('w-4 h-4 shrink-0', isActive ? 'text-warning' : 'text-white/60')} />
                    {!collapsed && <span>{item.name}</span>}
                  </div>
                  {!collapsed && item.badge && (
                    <span className={cn(
                      'text-[10px] font-bold px-1.5 py-0.5 rounded-md min-w-[20px] text-center',
                      isActive ? 'bg-warning text-primary-dark' : 'bg-white/20 text-white'
                    )}>
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>
    </aside>
  );
}

export function ProviderSidebar() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <>
      <MobileSidebarToggle>
        <SidebarContent collapsed={false} setCollapsed={() => {}} />
      </MobileSidebarToggle>
      <div className="hidden md:block">
        <SidebarContent collapsed={collapsed} setCollapsed={setCollapsed} />
      </div>
    </>
  );
}
