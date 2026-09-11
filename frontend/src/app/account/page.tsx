'use client';

import React from 'react';
import Link from 'next/link';
import { TravelerHeader } from '@/components/traveler/header';
import { TravelerFooter } from '@/components/traveler/footer';
import { useAuth } from '@/lib/auth-context';
import { 
  UpcomingTripCard, 
  PendingBookingCard, 
  TravelerQuickActions, 
  ConciergeSupportCard 
} from '@/components/traveler/dashboard-widgets';
import { Calendar, ChevronRight } from 'lucide-react';

export default function TravelerAccountPage() {
  const { user } = useAuth();
  
  // Hardcoded for MVP styling demonstration as requested
  const firstName = user?.fullName?.split(' ')[0] || 'Amara';

  return (
    <div className="flex flex-col min-h-screen bg-background text-text">
      <TravelerHeader />

      <main className="flex-1 py-24 sm:py-28">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          {/* Welcome Section */}
          <section>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Welcome back, {firstName}
            </h1>
            <p className="text-base sm:text-lg text-text-muted mt-2">
              Ready for your next Sierra Leone experience?
            </p>
          </section>

          {/* Action Required / Pending */}
          <section>
            <PendingBookingCard />
          </section>

          {/* Next Trip Section */}
          <section>
            <UpcomingTripCard />
          </section>

          {/* Quick Actions */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold uppercase tracking-wider text-text-muted">Quick Actions</h2>
            </div>
            <TravelerQuickActions />
          </section>

          {/* Your Bookings Summary */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold uppercase tracking-wider text-text-muted">Your Bookings</h2>
              <Link href="/bookings" className="text-sm font-semibold text-primary hover:underline flex items-center">
                View All <ChevronRight className="w-4 h-4 ml-0.5" />
              </Link>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Link href="/bookings?filter=pending" className="block group">
                <div className="bg-surface border border-border rounded-xl p-5 flex items-center justify-between transition-colors group-hover:border-primary/30">
                  <span className="font-semibold text-text">Pending</span>
                  <div className="w-8 h-8 rounded-full bg-slate-light flex items-center justify-center text-sm font-bold">1</div>
                </div>
              </Link>
              <Link href="/bookings?filter=upcoming" className="block group">
                <div className="bg-surface border border-border rounded-xl p-5 flex items-center justify-between transition-colors group-hover:border-primary/30">
                  <span className="font-semibold text-text">Upcoming</span>
                  <div className="w-8 h-8 rounded-full bg-primary-light text-primary flex items-center justify-center text-sm font-bold">3</div>
                </div>
              </Link>
              <Link href="/bookings?filter=completed" className="block group">
                <div className="bg-surface border border-border rounded-xl p-5 flex items-center justify-between transition-colors group-hover:border-primary/30">
                  <span className="font-semibold text-text">Completed</span>
                  <div className="w-8 h-8 rounded-full bg-slate-light flex items-center justify-center text-sm font-bold">7</div>
                </div>
              </Link>
            </div>
          </section>

          {/* Concierge Support */}
          <section className="pb-10">
            <ConciergeSupportCard />
          </section>

        </div>
      </main>

      <TravelerFooter />
    </div>
  );
}
