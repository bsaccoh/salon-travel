'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Search, Bell, LogOut, Shield, ChevronDown, User as UserIcon, ExternalLink } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

interface AdminTopbarProps {
  title: string;
  subtitle: string;
}

export function AdminTopbar({ title, subtitle }: AdminTopbarProps) {
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

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
      {/* Left: Page Title */}
      <div>
        <h1 className="text-2xl font-bold text-text">{title}</h1>
        <p className="text-xs text-text-muted mt-0.5">{subtitle}</p>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-3">
        {/* Global Search */}
        <div className="relative hidden md:block">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            placeholder="Search booking, traveler, provider..."
            className="pl-9 pr-4 py-2 text-xs border border-border rounded-lg bg-surface text-text w-64 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary shadow-xs transition-smooth"
          />
        </div>

        {/* Notifications */}
        <button
          className="relative p-2 rounded-lg bg-surface border border-border text-text-muted hover:text-text hover:bg-background transition-smooth shadow-xs"
          aria-label="Notifications"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-danger rounded-full border border-surface"></span>
        </button>

        {/* Logged-in User Profile */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2.5 p-1.5 pr-3 rounded-xl bg-surface border border-border hover:border-primary/40 shadow-xs transition-smooth"
            aria-label="User menu"
          >
            <div className="w-8 h-8 rounded-lg bg-primary-dark text-white flex items-center justify-center font-bold text-xs shadow-sm">
              {user?.fullName?.charAt(0) || 'A'}
            </div>
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-xs font-bold text-text leading-tight truncate max-w-[130px]">
                {user?.fullName || 'System Administrator'}
              </span>
              <span className="text-[10px] font-semibold text-primary uppercase tracking-wider">
                {user?.role || 'Admin'}
              </span>
            </div>
            <ChevronDown className={`w-3.5 h-3.5 text-text-muted transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* User Dropdown Menu */}
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-surface rounded-xl shadow-elevated border border-border p-2 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="px-3 py-2 border-b border-border/70 mb-1">
                <p className="text-xs font-bold text-text truncate">{user?.fullName || 'System Administrator'}</p>
                <p className="text-[10px] text-text-muted truncate mt-0.5">{user?.email || 'admin@salonetravel.dev'}</p>
                <span className="inline-block mt-1.5 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase bg-primary-light text-primary">
                  {user?.role || 'admin'}
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
                  href="/concierge"
                  className="flex items-center justify-between px-3 py-2 text-xs font-semibold text-text hover:bg-slate-light rounded-lg transition-smooth"
                  onClick={() => setDropdownOpen(false)}
                >
                  <span className="flex items-center gap-2">
                    <Shield className="w-3.5 h-3.5 text-text-muted" />
                    Concierge Portal
                  </span>
                </Link>
                <Link
                  href="/admin/settings"
                  className="flex items-center justify-between px-3 py-2 text-xs font-semibold text-text hover:bg-slate-light rounded-lg transition-smooth"
                  onClick={() => setDropdownOpen(false)}
                >
                  <span className="flex items-center gap-2">
                    <UserIcon className="w-3.5 h-3.5 text-text-muted" />
                    Settings &amp; Roles
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
    </div>
  );
}
