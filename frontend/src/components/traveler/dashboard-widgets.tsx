'use client';

import React from 'react';
import Link from 'next/link';
import { Compass, Calendar, MessageSquare, Heart, ChevronRight, Clock, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function UpcomingTripCard() {
  return (
    <div className="bg-surface border border-border rounded-2xl overflow-hidden shadow-card">
      <div className="p-5 sm:p-6">
        <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted mb-4">Next Trip</h3>
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h4 className="text-lg font-bold text-text">Banana Island Adventure</h4>
            <div className="flex items-center gap-2 mt-1 text-sm text-text-muted">
              <Calendar className="w-4 h-4" />
              <span>28 Aug 2026</span>
            </div>
            
            <div className="grid grid-cols-2 gap-x-8 gap-y-2 mt-4 text-sm">
              <div>
                <span className="block text-xs text-text-muted">Provider</span>
                <span className="font-semibold text-text">Salone Island Tours</span>
              </div>
              <div>
                <span className="block text-xs text-text-muted">Status</span>
                <span className="inline-flex items-center gap-1.5 bg-success-light text-success px-2 py-0.5 rounded text-[11px] font-bold">
                  Confirmed
                </span>
              </div>
              <div className="col-span-2">
                <span className="block text-xs text-text-muted">Amount</span>
                <span className="font-semibold text-text">Le 2,500.00</span>
              </div>
            </div>
          </div>
          
          <div className="sm:text-right mt-2 sm:mt-0">
            <Link href="/bookings/ST-10458">
              <Button variant="outline" className="w-full sm:w-auto">
                View Booking
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export function PendingBookingCard() {
  return (
    <div className="bg-surface border border-border rounded-2xl overflow-hidden shadow-card relative">
      <div className="absolute top-0 left-0 w-1 h-full bg-warning"></div>
      <div className="p-5 sm:p-6 pl-6 sm:pl-7">
        <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted mb-4">Action Required</h3>
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h4 className="text-lg font-bold text-text">Airport Transfer</h4>
            <div className="flex items-center gap-2 mt-1 text-sm text-text-muted">
              <Calendar className="w-4 h-4" />
              <span>12 Sep 2026</span>
            </div>
            
            <div className="grid grid-cols-2 gap-x-8 gap-y-2 mt-4 text-sm">
              <div>
                <span className="block text-xs text-text-muted">Status</span>
                <span className="inline-flex items-center gap-1.5 bg-warning/20 text-warning px-2 py-0.5 rounded text-[11px] font-bold">
                  Awaiting Payment
                </span>
              </div>
              <div>
                <span className="block text-xs text-text-muted">Amount</span>
                <span className="font-semibold text-text">Le 1,500.00</span>
              </div>
            </div>
          </div>
          
          <div className="sm:text-right mt-2 sm:mt-0">
            <Link href="/bookings/ST-10459/payment">
              <Button variant="traveler-cta" className="w-full sm:w-auto shadow-sm">
                Complete Payment
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export function TravelerQuickActions() {
  const actions = [
    { icon: Compass, label: 'Explore Destinations', href: '/destinations', color: 'text-primary' },
    { icon: Calendar, label: 'View Bookings', href: '/bookings', color: 'text-primary-dark' },
    { icon: MessageSquare, label: 'Message Concierge', href: '/messages', color: 'text-accent' },
    { icon: Heart, label: 'Saved Experiences', href: '/saved', color: 'text-danger' },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
      {actions.map((action, i) => {
        const Icon = action.icon;
        return (
          <Link key={i} href={action.href} className="group block">
            <div className="bg-surface border border-border rounded-xl p-4 sm:p-5 flex flex-col items-center justify-center gap-3 text-center transition-all duration-200 hover:shadow-card hover:border-primary/30 h-full">
              <div className={cn("w-10 h-10 rounded-full bg-slate-light flex items-center justify-center group-hover:scale-110 transition-transform", action.color)}>
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-sm font-semibold text-text leading-tight">{action.label}</span>
            </div>
          </Link>
        );
      })}
    </div>
  );
}

export function ConciergeSupportCard() {
  return (
    <div className="bg-primary-dark text-white rounded-2xl overflow-hidden shadow-card relative">
      <div className="absolute right-0 top-0 w-32 h-32 bg-primary/20 rounded-full blur-2xl -mr-10 -mt-10"></div>
      <div className="p-6 relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h3 className="text-lg font-bold">Need help planning your trip?</h3>
          <p className="text-sm text-white/80 mt-1 max-w-sm">
            Our local experts are available 24/7 to help you curate the perfect Sierra Leone experience.
          </p>
        </div>
        <Link href="/messages">
          <Button className="bg-white text-primary-dark hover:bg-slate-light w-full sm:w-auto font-bold shrink-0">
            Chat with Concierge
          </Button>
        </Link>
      </div>
    </div>
  );
}
