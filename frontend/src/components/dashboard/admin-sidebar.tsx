'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  Compass,
  LayoutDashboard,
  Users,
  Building2,
  MapPin,
  Calendar,
  Star,
  CreditCard,
  RotateCcw,
  BarChart3,
  Headset,
  Box,
  FileText,
  History,
  Settings,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';
import { MobileSidebarToggle } from '@/components/ui/mobile-sidebar';

const navigationGroups = [
  {
    label: 'Overview',
    items: [
      { name: 'Overview', href: '/admin', icon: LayoutDashboard },
    ]
  },
  {
    label: 'Operations',
    items: [
      { name: 'Bookings', href: '/admin/bookings', icon: Calendar },
      { name: 'Providers', href: '/admin/providers', icon: Building2, badge: 4 },
      { name: 'Users', href: '/admin/users', icon: Users },
      { name: 'Concierge', href: '/admin/concierge', icon: Headset, badge: 2 },
    ]
  },
  {
    label: 'Marketplace',
    items: [
      { name: 'Destinations', href: '/admin/destinations', icon: MapPin },
      { name: 'Services', href: '/admin/services', icon: Box },
      { name: 'Reviews', href: '/admin/reviews', icon: Star },
    ]
  },
  {
    label: 'Finance',
    items: [
      { name: 'Payments', href: '/admin/payments', icon: CreditCard },
      { name: 'Refunds', href: '/admin/refunds', icon: RotateCcw, badge: 3 },
    ]
  },
  {
    label: 'Insights',
    items: [
      { name: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
      { name: 'Reports', href: '/admin/reports', icon: FileText },
    ]
  },
  {
    label: 'System',
    items: [
      { name: 'Audit Logs', href: '/admin/audit', icon: History },
      { name: 'Settings', href: '/admin/settings', icon: Settings },
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
            <Compass className="w-5 h-5 text-primary" />
          </div>
          {!collapsed && (
            <div className="flex flex-col min-w-0">
              <span className="font-extrabold text-base tracking-tight text-white">
                Salone<span className="text-accent">Travel</span>
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
              const isActive = pathname === item.href;
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

export function AdminSidebar() {
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
