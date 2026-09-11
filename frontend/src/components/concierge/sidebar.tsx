'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import {
  Compass,
  LayoutDashboard,
  Inbox,
  AlertTriangle,
  Briefcase,
  Users,
  Building2,
  BarChart2,
  FileText,
  Bell,
  Settings,
  UserCircle2,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';
import { MobileSidebarToggle } from '@/components/ui/mobile-sidebar';

function SidebarInner({ collapsed, setCollapsed }: { collapsed: boolean; setCollapsed: (v: boolean) => void }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const filter = searchParams.get('filter') || '';

  const isCurrent = (path: string) => pathname.startsWith(path);
  const isInbox = pathname === '/concierge/inbox';

  return (
    <aside className={`w-full bg-primary-dark text-white flex flex-col h-full shrink-0 relative z-20 transition-all duration-300 ${collapsed ? 'max-w-[72px]' : ''}`}>
      {/* Brand Header */}
      <div className="h-[72px] flex items-center justify-between px-4 border-b border-white/10 shrink-0">
        <div className="flex items-center">
          <Compass className="w-8 h-8 text-white mr-3 shrink-0" />
          {!collapsed && (
            <div className="flex flex-col min-w-0">
              <span className="font-bold text-lg leading-tight tracking-tight">SaloneTravel</span>
              <span className="text-[10px] text-white/60 tracking-widest uppercase font-bold">Concierge Console</span>
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

      <div className="flex-1 overflow-y-auto py-2 space-y-8 custom-scrollbar">
        {/* OVERVIEW */}
        <div>
          {!collapsed && <p className="text-[11px] font-bold text-white/40 uppercase tracking-widest mb-3 px-5">Overview</p>}
          <div className="space-y-0.5">
            <NavItem href="/concierge/overview" icon={LayoutDashboard} label="Dashboard" active={isCurrent('/concierge/overview')} collapsed={collapsed} />
          </div>
        </div>

        {/* INBOX */}
        <div>
          {!collapsed && <p className="text-[11px] font-bold text-white/40 uppercase tracking-widest mb-3 px-5">Inbox</p>}
          <div className="space-y-0.5">
            <NavItem href="/concierge/inbox" icon={Inbox} label="All Conversations" active={isInbox && !filter} badge={2} collapsed={collapsed} />
            <NavItem href="/concierge/inbox?filter=unclaimed" icon={UserCircle2} label="Unclaimed" active={isInbox && filter === 'unclaimed'} badge={8} badgeVariant="warning" collapsed={collapsed} />
            <NavItem href="/concierge/inbox?filter=mine" icon={Briefcase} label="Assigned to Me" active={isInbox && filter === 'mine'} collapsed={collapsed} />
            <NavItem href="/concierge/inbox?filter=emergency" icon={AlertTriangle} label="Emergency" active={isInbox && filter === 'emergency'} badge={2} badgeVariant="danger" collapsed={collapsed} />
          </div>
        </div>

        {/* OPERATIONS */}
        <div>
          {!collapsed && <p className="text-[11px] font-bold text-white/40 uppercase tracking-widest mb-3 px-5">Operations</p>}
          <div className="space-y-0.5">
            <NavItem href="/concierge/bookings" icon={Briefcase} label="Bookings" active={isCurrent('/concierge/bookings')} collapsed={collapsed} />
            <NavItem href="/concierge/travelers" icon={Users} label="Travelers" active={isCurrent('/concierge/travelers')} collapsed={collapsed} />
            <NavItem href="/concierge/providers" icon={Building2} label="Providers" active={isCurrent('/concierge/providers')} collapsed={collapsed} />
          </div>
        </div>

        {/* INSIGHTS */}
        <div>
          {!collapsed && <p className="text-[11px] font-bold text-white/40 uppercase tracking-widest mb-3 px-5">Insights</p>}
          <div className="space-y-0.5">
            <NavItem href="/concierge/analytics" icon={BarChart2} label="Analytics" active={isCurrent('/concierge/analytics')} collapsed={collapsed} />
            <NavItem href="/concierge/reports" icon={FileText} label="Reports" active={isCurrent('/concierge/reports')} collapsed={collapsed} />
          </div>
        </div>

        {/* ACCOUNT */}
        <div>
          {!collapsed && <p className="text-[11px] font-bold text-white/40 uppercase tracking-widest mb-3 px-5">Account</p>}
          <div className="space-y-0.5">
            <NavItem href="/concierge/notifications" icon={Bell} label="Notifications" active={isCurrent('/concierge/notifications')} badge={5} collapsed={collapsed} />
            <NavItem href="/concierge/settings" icon={Settings} label="Settings" active={isCurrent('/concierge/settings')} collapsed={collapsed} />
          </div>
        </div>
      </div>

    </aside>
  );
}

function NavItem({
  href,
  icon: Icon,
  label,
  active,
  badge,
  badgeVariant = 'default',
  collapsed = false,
}: {
  href: string;
  icon: any;
  label: string;
  active?: boolean;
  badge?: number;
  badgeVariant?: 'default' | 'warning' | 'danger';
  collapsed?: boolean;
}) {
  const badgeColors = {
    default: 'bg-white/20 text-white',
    warning: 'bg-[#F2B84B] text-[#14232B]',
    danger: 'bg-danger text-white'
  };

  return (
    <div className={collapsed ? 'px-2' : 'px-3'}>
      <Link
        href={href}
        title={collapsed ? label : undefined}
        className={`relative flex items-center rounded-xl transition-all duration-200 group h-11 ${
          collapsed ? 'justify-center px-2' : 'justify-between px-3'
        } py-[10px] ${
          active
            ? 'bg-primary/35 text-white'
            : 'text-white/70 hover:bg-white/10 hover:text-white'
        }`}
      >
        {active && !collapsed && (
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 bg-[#F2B84B] rounded-r-md" />
        )}
        <div className={`flex items-center ${collapsed ? '' : 'gap-3'}`}>
          <Icon className={`w-[18px] h-[18px] shrink-0 ${active ? 'text-white' : 'text-white/50 group-hover:text-white/80'}`} />
          {!collapsed && <span className="text-[14px] font-semibold">{label}</span>}
        </div>
        {!collapsed && badge !== undefined && badge > 0 && (
          <span className={`flex items-center justify-center text-[11px] font-bold h-[22px] min-w-[22px] px-1.5 rounded-full text-center ${badgeColors[badgeVariant]}`}>
            {badge}
          </span>
        )}
      </Link>
    </div>
  );
}

function SidebarContent() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <>
      <MobileSidebarToggle>
        <SidebarInner collapsed={false} setCollapsed={() => {}} />
      </MobileSidebarToggle>
      <div className="hidden md:flex h-full">
        <SidebarInner collapsed={collapsed} setCollapsed={setCollapsed} />
      </div>
    </>
  );
}

export function ConciergeSidebar() {
  return (
    <Suspense fallback={<aside className="w-full bg-primary-dark text-white flex flex-col h-full shrink-0 relative z-20"></aside>}>
      <SidebarContent />
    </Suspense>
  );
}
