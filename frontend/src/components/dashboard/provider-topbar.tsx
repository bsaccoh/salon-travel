'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Bell, Search, LogOut, ChevronDown, User as UserIcon, ExternalLink } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

interface ProviderTopbarProps {
  title?: string;
  subtitle?: string;
}

export function ProviderTopbar({ title, subtitle }: ProviderTopbarProps) {
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  const displayTitle = title || `Good morning, ${user?.fullName || 'Provider'}`;
  const displaySubtitle = subtitle || 'Manage bookings, services, earnings and business performance.';

  return (
    <header className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
      <div>
        <h1 className="text-2xl font-bold text-text">{displayTitle}</h1>
        <p className="text-xs text-text-muted mt-1">{displaySubtitle}</p>
      </div>

      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="hidden md:flex items-center gap-2 px-3 py-2 bg-surface rounded-lg border border-border shadow-sm">
          <Search className="w-4 h-4 text-text-muted" />
          <input
            type="text"
            placeholder="Search booking ref..."
            className="bg-transparent text-xs text-text focus:outline-none w-48"
          />
        </div>

        {/* Notifications */}
        <button className="relative w-9 h-9 flex items-center justify-center rounded-lg bg-surface border border-border shadow-sm text-text-muted hover:text-text transition-smooth">
          <Bell className="w-4 h-4" />
          <span className="absolute top-2 right-2.5 w-1.5 h-1.5 bg-danger rounded-full ring-2 ring-surface"></span>
        </button>

        {/* Logged-in User Profile */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2.5 p-1.5 pr-3 rounded-xl bg-surface border border-border hover:border-primary/40 shadow-xs transition-smooth"
            aria-label="User menu"
          >
            <div className="w-8 h-8 rounded-lg bg-warning text-text flex items-center justify-center font-bold text-xs shadow-sm">
              {user?.fullName?.charAt(0) || 'P'}
            </div>
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-xs font-bold text-text leading-tight truncate max-w-[130px]">
                {user?.fullName || 'Provider'}
              </span>
              <span className="text-[10px] font-semibold text-primary uppercase tracking-wider">
                {user?.role || 'Provider'}
              </span>
            </div>
            <ChevronDown className={`w-3.5 h-3.5 text-text-muted transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* User Dropdown Menu */}
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-surface rounded-xl shadow-elevated border border-border p-2 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="px-3 py-2 border-b border-border/70 mb-1">
                <p className="text-xs font-bold text-text truncate">{user?.fullName || 'Provider Business'}</p>
                <p className="text-[10px] text-text-muted truncate mt-0.5">{user?.email || 'provider@salonetravel.dev'}</p>
                <span className="inline-block mt-1.5 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase bg-warning/20 text-warning">
                  {user?.role || 'provider'}
                </span>
              </div>

              <div className="space-y-0.5">
                <Link
                  href="/"
                  className="flex items-center justify-between px-3 py-2 text-xs font-semibold text-text hover:bg-slate-light rounded-lg transition-smooth"
                  onClick={() => setDropdownOpen(false)}
                >
                  <span className="flex items-center gap-2">
                    <ExternalLink className="w-3.5 h-3.5 text-text-muted" />
                    Traveler View
                  </span>
                </Link>
                <Link
                  href="/provider/settings"
                  className="flex items-center justify-between px-3 py-2 text-xs font-semibold text-text hover:bg-slate-light rounded-lg transition-smooth"
                  onClick={() => setDropdownOpen(false)}
                >
                  <span className="flex items-center gap-2">
                    <UserIcon className="w-3.5 h-3.5 text-text-muted" />
                    Business Profile
                  </span>
                </Link>
              </div>

              <div className="pt-1 mt-1 border-t border-border/70">
                <button
                  type="button"
                  onClick={async (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setDropdownOpen(false);
                    await logout('/auth/login');
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-danger hover:bg-danger-light rounded-lg transition-smooth text-left cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
