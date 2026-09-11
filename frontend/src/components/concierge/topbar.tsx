'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Search, Bell, Menu, LogOut, ChevronDown, User as UserIcon, ExternalLink } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

export function ConciergeTopbar({ 
  title, 
  subtitle 
}: { 
  title: string; 
  subtitle?: string 
}) {
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getInitials = (name?: string, email?: string) => {
    if (name) {
      const parts = name.trim().split(' ');
      if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
      return parts[0].slice(0, 2).toUpperCase();
    }
    if (email) return email.slice(0, 2).toUpperCase();
    return 'CO';
  };

  return (
    <header className="h-20 bg-surface border-b border-border flex items-center justify-between px-8 shrink-0 z-10 sticky top-0">
      <div className="flex items-center gap-4">
        <button className="lg:hidden p-2 -ml-2 text-text-muted hover:text-text rounded-lg hover:bg-background">
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-text">{title}</h1>
          {subtitle && <p className="text-xs text-text-muted mt-1">{subtitle}</p>}
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="hidden md:flex items-center gap-2 bg-background border border-border px-3 py-1.5 rounded-xl w-64 focus-within:ring-2 focus-within:ring-primary focus-within:border-transparent transition-all">
          <Search className="w-4 h-4 text-text-muted" />
          <input 
            type="text" 
            placeholder="Search booking, traveler..." 
            className="bg-transparent text-sm text-text focus:outline-none w-full placeholder:text-text-muted"
          />
        </div>

        <div className="flex items-center gap-3">
          <button className="relative p-2 text-text-muted hover:text-text rounded-lg hover:bg-background transition-colors">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-danger border-2 border-surface"></span>
          </button>
          
          {/* User Pill Button with Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2.5 p-1.5 pr-3 rounded-full hover:bg-slate-light border border-transparent hover:border-border transition-smooth focus:outline-none"
              aria-expanded={dropdownOpen}
              aria-haspopup="true"
            >
              <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-xs shadow-xs">
                {getInitials(user?.fullName, user?.email)}
              </div>
              <div className="hidden sm:flex flex-col text-left">
                <span className="text-xs font-bold text-text leading-tight max-w-[120px] truncate">
                  {user?.fullName || user?.email?.split('@')[0] || 'Concierge Staff'}
                </span>
                <span className="text-[10px] font-semibold text-primary uppercase tracking-wider">
                  {user?.role || 'Concierge'}
                </span>
              </div>
              <ChevronDown className={`w-3.5 h-3.5 text-text-muted transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* User Dropdown Menu */}
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-surface rounded-xl shadow-elevated border border-border p-2 z-50 animate-in fade-in slide-in-from-top-2">
                <div className="px-3 py-2 border-b border-border/70 mb-1">
                  <p className="text-xs font-bold text-text truncate">{user?.fullName || 'Concierge Staff'}</p>
                  <p className="text-[10px] text-text-muted truncate mt-0.5">{user?.email || 'concierge@salonetravel.dev'}</p>
                  <span className="inline-block mt-1.5 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase bg-primary-light text-primary">
                    {user?.role || 'concierge'}
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
                    href="/concierge/settings"
                    className="flex items-center justify-between px-3 py-2 text-xs font-semibold text-text hover:bg-slate-light rounded-lg transition-smooth"
                    onClick={() => setDropdownOpen(false)}
                  >
                    <span className="flex items-center gap-2">
                      <UserIcon className="w-3.5 h-3.5 text-text-muted" />
                      Settings
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
    </header>
  );
}
