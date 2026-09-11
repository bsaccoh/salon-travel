'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import {
  Compass,
  Menu,
  X,
  User as UserIcon,
  MessageSquare,
  Calendar,
  LogOut,
  LayoutDashboard,
  Shield,
  Bell,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export function TravelerHeader() {
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header 
      className={cn(
        "fixed top-0 w-full z-50 transition-all duration-300",
        scrolled 
          ? "bg-surface/95 backdrop-blur-md border-b border-border/80 shadow-sm py-0" 
          : "bg-transparent border-b border-white/10 py-2"
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-primary-dark flex items-center justify-center text-warning shadow-md group-hover:scale-105 transition-smooth">
            <Compass className="w-6 h-6" />
          </div>
          <div className="flex flex-col">
            <span className={cn(
              "font-extrabold text-xl tracking-tight transition-smooth",
              scrolled ? "text-primary-dark group-hover:text-primary" : "text-white"
            )}>
              Salone<span className="text-accent">Travel</span>
            </span>
            <span className={cn(
              "text-[10px] font-semibold uppercase tracking-widest -mt-1",
              scrolled ? "text-text-muted" : "text-white/80"
            )}>
              Concierge
            </span>
          </div>
        </Link>

        {/* Center Desktop Navigation */}
        <nav className={cn(
          "hidden md:flex items-center gap-8 text-sm font-semibold",
          scrolled ? "text-text/80" : "text-white/90"
        )}>
          <Link
            href="/destinations"
            className="hover:text-primary transition-smooth py-1"
          >
            Destinations
          </Link>
          <Link
            href="/providers"
            className="hover:text-primary transition-smooth py-1"
          >
            Providers
          </Link>
          <Link
            href="/#experiences"
            className="hover:text-primary transition-smooth py-1"
          >
            Experiences
          </Link>
          <Link
            href="/#how-it-works"
            className="hover:text-primary transition-smooth py-1"
          >
            How It Works
          </Link>
        </nav>

        {/* Right Authentication CTA */}
        <div className="hidden md:flex items-center gap-3">
          {/* Direct Portal Switcher */}
          <div className="relative group">
            <button
              className={cn(
                "flex items-center gap-1.5 text-xs font-bold py-2 px-2.5 rounded-lg transition-smooth",
                scrolled ? "text-text-muted hover:text-primary hover:bg-slate-light" : "text-white/90 hover:text-white hover:bg-white/10"
              )}
              aria-label="Platform Dashboards"
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Portals</span>
            </button>
            <div className="absolute right-0 top-full hidden group-hover:block w-52 p-2 bg-surface rounded-xl shadow-elevated border border-border z-50 animate-in fade-in">
              <span className="block px-2.5 py-1 text-[10px] font-bold text-text-muted uppercase tracking-wider">
                Platform Apps
              </span>
              <Link
                href="/"
                className="flex items-center gap-2 px-2.5 py-2 text-xs font-semibold text-text hover:bg-slate-light rounded-lg transition-smooth"
              >
                <Compass className="w-4 h-4 text-primary" />
                <span>Traveler PWA</span>
              </Link>
              <Link
                href="/provider"
                className="flex items-center gap-2 px-2.5 py-2 text-xs font-semibold text-text hover:bg-slate-light rounded-lg transition-smooth"
              >
                <LayoutDashboard className="w-4 h-4 text-green" />
                <span>Provider Portal</span>
              </Link>
              <Link
                href="/concierge"
                className="flex items-center gap-2 px-2.5 py-2 text-xs font-semibold text-text hover:bg-slate-light rounded-lg transition-smooth"
              >
                <MessageSquare className="w-4 h-4 text-accent" />
                <span>Concierge Desk</span>
              </Link>
              <Link
                href="/admin"
                className="flex items-center gap-2 px-2.5 py-2 text-xs font-semibold text-text hover:bg-slate-light rounded-lg transition-smooth"
              >
                <Shield className="w-4 h-4 text-primary-dark" />
                <span>Admin Console</span>
              </Link>
            </div>
          </div>

          {user ? (
            <div className="flex items-center gap-3">
              <Link href="/bookings">
                <Button variant="ghost" size="sm" className="gap-2">
                  <Calendar className="w-4 h-4 text-primary" />
                  <span>Bookings</span>
                </Button>
              </Link>

              <Link href="/messages">
                <Button variant="ghost" size="sm" className="gap-2">
                  <MessageSquare className="w-4 h-4 text-primary" />
                  <span>Messages</span>
                </Button>
              </Link>

              {/* Notification Bell */}
              <div className="relative">
                <button
                  onClick={() => setNotificationsOpen(!notificationsOpen)}
                  className={cn(
                    "relative p-2 rounded-full transition-smooth",
                    scrolled ? "text-text hover:bg-slate-light" : "text-white hover:bg-white/10"
                  )}
                >
                  <Bell className="w-5 h-5" />
                  <span className="absolute top-1.5 right-2 w-2 h-2 rounded-full bg-accent border-2 border-surface"></span>
                </button>
                
                {notificationsOpen && (
                  <div
                    className="absolute right-0 mt-2 w-72 rounded-xl border border-border bg-surface shadow-elevated z-50 animate-in fade-in"
                  >
                    <div className="px-4 py-3 border-b border-border flex justify-between items-center">
                      <span className="text-sm font-bold text-text">Notifications</span>
                      <button className="text-xs text-primary font-semibold hover:underline">Mark all read</button>
                    </div>
                    <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
                      <div className="p-3 border-b border-border hover:bg-slate-light transition-smooth cursor-pointer">
                        <div className="flex gap-3">
                          <div className="w-8 h-8 rounded-full bg-success-light text-success flex items-center justify-center shrink-0">
                            <Calendar className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-sm text-text font-semibold">Booking Confirmed</p>
                            <p className="text-xs text-text-muted mt-0.5">Your Banana Island Adventure is confirmed.</p>
                            <p className="text-[10px] text-text-muted mt-1 font-semibold">2m ago</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="p-2 border-t border-border text-center">
                      <Link href="/notifications" className="text-xs font-bold text-primary hover:underline" onClick={() => setNotificationsOpen(false)}>
                        View All
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              {/* User Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className={cn(
                    "flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full border transition-smooth",
                    scrolled ? "border-border bg-surface hover:bg-slate-light" : "border-white/20 bg-black/20 hover:bg-white/10"
                  )}
                >
                  <div className="w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center font-bold text-xs">
                    {user.fullName?.charAt(0) || 'U'}
                  </div>
                  <span className={cn(
                    "text-xs font-semibold max-w-[100px] truncate",
                    scrolled ? "text-text" : "text-white"
                  )}>
                    {user.fullName?.split(' ')[0]}
                  </span>
                </button>

                {dropdownOpen && (
                  <div
                    className="absolute right-0 mt-2 w-56 rounded-xl border border-border bg-surface p-2 shadow-elevated z-50 animate-in fade-in"
                    onClick={() => setDropdownOpen(false)}
                  >
                    <div className="px-3 py-2 border-b border-border/50">
                      <p className="text-xs font-bold text-text truncate">{user.fullName}</p>
                      <p className="text-[11px] text-text-muted truncate">{user.email}</p>
                      <span className="inline-block mt-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-primary-light text-primary">
                        {user.role}
                      </span>
                    </div>

                    {user.role === 'provider' && (
                      <Link
                        href="/provider"
                        className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-text hover:bg-slate-light rounded-lg transition-smooth mt-1"
                      >
                        <LayoutDashboard className="w-4 h-4 text-primary" />
                        <span>Provider Dashboard</span>
                      </Link>
                    )}

                    {(user.role === 'concierge' || user.role === 'admin') && (
                      <Link
                        href="/concierge"
                        className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-text hover:bg-slate-light rounded-lg transition-smooth mt-1"
                      >
                        <Shield className="w-4 h-4 text-primary" />
                        <span>Concierge Inbox</span>
                      </Link>
                    )}

                    {user.role === 'admin' && (
                      <Link
                        href="/admin"
                        className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-text hover:bg-slate-light rounded-lg transition-smooth"
                      >
                        <LayoutDashboard className="w-4 h-4 text-primary-dark" />
                        <span>Admin Console</span>
                      </Link>
                    )}

                    <Link
                      href="/profile"
                      className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-text hover:bg-slate-light rounded-lg transition-smooth"
                    >
                      <UserIcon className="w-4 h-4 text-text-muted" />
                      <span>My Profile</span>
                    </Link>

                    <button
                      type="button"
                      onClick={() => logout('/')}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-danger hover:bg-danger-light rounded-lg transition-smooth text-left mt-1 border-t border-border/50 cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link href="/auth/login">
                <Button
                  size="md"
                  className="bg-white hover:bg-slate-50 text-primary-dark font-bold shadow-sm border border-border/60 hover:border-primary/40 transition-smooth"
                >
                  Sign In
                </Button>
              </Link>
              <Link href="/auth/register">
                <Button variant="traveler-cta" size="md">
                  Get Started
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="flex md:hidden items-center gap-2">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-text hover:bg-slate-light"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-border bg-surface px-4 pt-2 pb-6 space-y-3">
          <Link
            href="/destinations"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-base font-semibold text-text hover:text-primary"
          >
            Destinations
          </Link>
          <Link
            href="/providers"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-base font-semibold text-text hover:text-primary"
          >
            Providers
          </Link>
          <Link
            href="/#experiences"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-base font-semibold text-text hover:text-primary"
          >
            Experiences
          </Link>
          <Link
            href="/#how-it-works"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-base font-semibold text-text hover:text-primary"
          >
            How It Works
          </Link>

          {user ? (
            <div className="pt-4 border-t border-border space-y-2">
              <Link
                href="/bookings"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-sm font-semibold text-text"
              >
                My Bookings
              </Link>
              <Link
                href="/messages"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-sm font-semibold text-text"
              >
                Concierge Messages
              </Link>
              {user.role === 'admin' && (
                <Link
                  href="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-2 text-sm font-semibold text-primary-dark"
                >
                  Admin Console
                </Link>
              )}
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  logout('/');
                }}
                className="block w-full text-left py-2 text-sm font-semibold text-danger cursor-pointer"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div className="pt-4 border-t border-border flex flex-col gap-2.5">
              <Link href="/auth/login" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="outline" className="w-full">
                  Sign In
                </Button>
              </Link>
              <Link href="/auth/register" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="traveler-cta" className="w-full">
                  Get Started
                </Button>
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
