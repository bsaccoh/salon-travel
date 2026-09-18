'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import {
  Menu,
  X,
  User as UserIcon,
  MessageSquare,
  Calendar,
  LogOut,
  LayoutDashboard,
  Shield,
  Globe,
  ChevronDown,
  MapPin,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export function TravelerHeader() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const navLinks = [
    { label: 'Home', href: '/' },
    { label: 'Destinations', href: '/destinations' },
    { label: 'Packages', href: '/packages' },
    { label: 'Providers', href: '/providers' },
    { label: 'Experiences', href: '/#experiences' },
    { label: 'How It Works', href: '/#how-it-works' },
  ];

  return (
    <header className="relative z-50 w-full bg-white border-b border-[#EDF2F4]">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-[5%] lg:px-[7%] h-[72px] sm:h-[88px] flex items-center justify-between">
        {/* LEFT: Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group shrink-0">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-brand-green flex items-center justify-center text-white shadow-sm group-hover:bg-brand-action transition-colors">
            <MapPin className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-lg sm:text-[21px] tracking-[-0.6px] leading-tight text-brand-navy">
              Salone<span className="text-brand-green">Travel</span>
            </span>
            <span className="hidden sm:block text-[7px] font-bold uppercase tracking-[1.7px] mt-[3px] text-brand-navy">
              Explore • Discover • Experience
            </span>
          </div>
        </Link>

        {/* CENTER: Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-4 xl:gap-6 h-full text-[14px] xl:text-[15px] font-medium text-brand-navy">
          {navLinks.map((link) => {
            const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
            return (
              <Link
                key={link.label}
                href={link.href}
                className={cn(
                  "relative h-full flex items-center whitespace-nowrap shrink-0 hover:text-brand-green transition-colors",
                  isActive ? "text-brand-green font-semibold" : ""
                )}
              >
                {link.label}
                {isActive && (
                  <span className="absolute bottom-0 left-0 w-full h-[2px] bg-brand-green" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* RIGHT: Actions */}
        <div className="hidden lg:flex items-center gap-3 xl:gap-[18px] ml-auto">
          <button className="flex items-center gap-2 text-sm font-medium text-brand-navy hover:text-brand-green transition-colors">
            <Globe className="w-[18px] h-[18px]" />
            <span>EN</span>
            <ChevronDown className="w-3.5 h-3.5 opacity-70" />
          </button>

          {user ? (
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-[9px] h-[46px] pl-2 pr-3.5 rounded-full border border-brand-border bg-white hover:bg-brand-softBg text-brand-navy transition-all"
              >
                <div className="w-[30px] h-[30px] rounded-full bg-brand-green text-white flex items-center justify-center font-bold text-[13px]">
                  {user.fullName?.charAt(0) || 'U'}
                </div>
                <span className="text-[13px] font-medium max-w-[100px] truncate">
                  {user.fullName?.split(' ')[0]}
                </span>
              </button>

              {dropdownOpen && (
                <div
                  className="absolute right-0 mt-2 w-56 rounded-xl border border-brand-border bg-white p-2 shadow-elevated z-50 animate-in fade-in"
                  onClick={() => setDropdownOpen(false)}
                >
                  <div className="px-3 py-2 border-b border-brand-border/50">
                    <p className="text-xs font-bold text-brand-textPrimary truncate">{user.fullName}</p>
                    <p className="text-[11px] text-brand-textSecondary truncate">{user.email}</p>
                    <span className="inline-block mt-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-brand-greenMuted text-brand-green">
                      {user.role}
                    </span>
                  </div>

                  {user.role === 'provider' && (
                    <Link href="/provider" className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-brand-textPrimary hover:bg-brand-softBg rounded-lg transition-colors mt-1">
                      <LayoutDashboard className="w-4 h-4 text-brand-green" />
                      <span>Provider Dashboard</span>
                    </Link>
                  )}
                  {(user.role === 'concierge' || user.role === 'admin') && (
                    <Link href="/concierge" className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-brand-textPrimary hover:bg-brand-softBg rounded-lg transition-colors mt-1">
                      <MessageSquare className="w-4 h-4 text-brand-green" />
                      <span>Concierge Inbox</span>
                    </Link>
                  )}
                  {user.role === 'admin' && (
                    <Link href="/admin" className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-brand-textPrimary hover:bg-brand-softBg rounded-lg transition-colors">
                      <Shield className="w-4 h-4 text-brand-navy" />
                      <span>Admin Console</span>
                    </Link>
                  )}

                  <Link href="/bookings" className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-brand-textPrimary hover:bg-brand-softBg rounded-lg transition-colors">
                    <Calendar className="w-4 h-4 text-brand-textSecondary" />
                    <span>My Bookings</span>
                  </Link>

                  <Link href="/profile" className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-brand-textPrimary hover:bg-brand-softBg rounded-lg transition-colors">
                    <UserIcon className="w-4 h-4 text-brand-textSecondary" />
                    <span>My Profile</span>
                  </Link>

                  <button
                    type="button"
                    onClick={() => logout('/')}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-lg transition-colors text-left mt-1 border-t border-brand-border/50 cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link href="/auth/login">
                <button className="h-[46px] px-4 bg-white text-brand-navy font-semibold text-sm rounded-[10px] border border-brand-border shadow-sm hover:bg-gray-50 transition-colors">
                  Sign In
                </button>
              </Link>
              <Link href="/auth/register">
                <button className="h-[46px] px-4 bg-brand-green text-white font-semibold text-sm rounded-[10px] hover:bg-brand-action transition-colors">
                  Get Started
                </button>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="flex lg:hidden items-center gap-2 ml-auto">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-brand-textPrimary hover:bg-brand-softBg transition-colors"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-brand-border bg-white px-4 pt-2 pb-6 space-y-2 shadow-card absolute w-full left-0 top-full">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2.5 px-2 text-[15px] font-semibold text-brand-textPrimary hover:text-brand-green hover:bg-brand-softBg rounded-lg"
            >
              {link.label}
            </Link>
          ))}

          {user ? (
            <div className="pt-4 border-t border-brand-border space-y-1">
              <Link href="/bookings" onClick={() => setMobileMenuOpen(false)} className="block py-2.5 px-2 text-sm font-semibold text-brand-textSecondary hover:bg-brand-softBg rounded-lg">
                My Bookings
              </Link>
              <Link href="/profile" onClick={() => setMobileMenuOpen(false)} className="block py-2.5 px-2 text-sm font-semibold text-brand-textSecondary hover:bg-brand-softBg rounded-lg">
                My Profile
              </Link>
              {user.role === 'admin' && (
                <Link href="/admin" onClick={() => setMobileMenuOpen(false)} className="block py-2.5 px-2 text-sm font-semibold text-brand-navy hover:bg-brand-softBg rounded-lg">
                  Admin Console
                </Link>
              )}
              <button
                type="button"
                onClick={() => { setMobileMenuOpen(false); logout('/'); }}
                className="block w-full text-left py-2.5 px-2 text-sm font-semibold text-red-600 hover:bg-red-50 rounded-lg cursor-pointer mt-2 border-t border-brand-border"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div className="pt-5 border-t border-brand-border flex flex-col gap-3">
              <Link href="/auth/login" onClick={() => setMobileMenuOpen(false)}>
                <button className="w-full h-[46px] bg-white text-brand-navy font-semibold text-[15px] rounded-[10px] border border-brand-border shadow-sm">
                  Sign In
                </button>
              </Link>
              <Link href="/auth/register" onClick={() => setMobileMenuOpen(false)}>
                <button className="w-full h-[46px] bg-brand-green text-white font-semibold text-[15px] rounded-[10px]">
                  Get Started
                </button>
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
