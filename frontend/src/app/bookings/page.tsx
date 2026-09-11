'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { TravelerHeader } from '@/components/traveler/header';
import { TravelerFooter } from '@/components/traveler/footer';
import { BookingStatusBadge } from '@/components/ui/booking-status-badge';
import { Button } from '@/components/ui/button';
import { BookingStatus } from '@/lib/types';
import { Calendar, Users, MapPin, ArrowRight, Clock, PlusCircle, Loader2 } from 'lucide-react';
import { useMyBookings } from '@/hooks/use-bookings';
import { ErrorState } from '@/components/ui/error-state';

export default function TravelerBookingsPage() {
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'upcoming' | 'completed' | 'cancelled'>('all');

  const { data: bookings, isLoading, error, refetch } = useMyBookings();

  const filtered = (bookings || []).filter((b) => {
    if (activeTab === 'pending') return b.status === 'pending' || b.status === 'awaiting_payment';
    if (activeTab === 'upcoming') return b.status === 'confirmed' || b.status === 'in_progress';
    if (activeTab === 'completed') return b.status === 'completed';
    if (activeTab === 'cancelled') return b.status.includes('cancelled');
    return true;
  });

  return (
    <div className="flex flex-col min-h-screen">
      <TravelerHeader />

      <main className="flex-1 bg-background py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-primary">
                My Itinerary
              </span>
              <h1 className="text-3xl font-extrabold text-text tracking-tight mt-1">
                Your Bookings
              </h1>
            </div>

            <Link href="/destinations">
              <Button variant="traveler-cta" size="md" className="gap-2 font-bold">
                <PlusCircle className="w-4 h-4" />
                <span>Explore Experiences</span>
              </Button>
            </Link>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-2 border-b border-border/80 pb-3 mb-8 overflow-x-auto">
            {(['all', 'pending', 'upcoming', 'completed', 'cancelled'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-smooth ${
                  activeTab === tab
                    ? 'bg-primary-dark text-white shadow-sm'
                    : 'bg-surface border border-border text-text-muted hover:text-text hover:bg-slate-light'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Bookings List */}
          {isLoading ? (
            <div className="flex items-center justify-center py-20 text-primary">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
          ) : error ? (
            <ErrorState onRetry={() => refetch()} />
          ) : filtered.length > 0 ? (
            <div className="space-y-4">
              {filtered.map((booking) => (
                <div
                  key={booking.id}
                  className="p-6 rounded-2xl border border-border bg-surface shadow-card hover:shadow-elevated transition-smooth flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
                >
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-3">
                      <BookingStatusBadge status={booking.status} />
                      <span className="text-xs text-text-muted font-mono font-semibold">
                        {booking.reference}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-text">
                      {booking.service?.name || 'Service'}
                    </h3>

                    <p className="text-xs font-semibold text-primary">
                      {booking.provider?.businessName || 'Provider'}
                    </p>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-text-muted pt-1">
                      <span className="flex items-center gap-1.5 font-medium">
                        <Calendar className="w-3.5 h-3.5 text-primary" />
                        {new Date(booking.scheduledDate).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1.5 font-medium">
                        <Users className="w-3.5 h-3.5 text-primary" />
                        {booking.guestCount} Guests
                      </span>
                      {booking.service?.meetingPoint && (
                        <span className="flex items-center gap-1.5 font-medium">
                          <MapPin className="w-3.5 h-3.5 text-primary" />
                          {booking.service.meetingPoint}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex md:flex-col items-center md:items-end justify-between w-full md:w-auto gap-4 pt-4 md:pt-0 border-t md:border-0 border-border/50 shrink-0">
                    <div className="text-left md:text-right">
                      <span className="text-xs text-text-muted">Total</span>
                      <span className="text-xl font-extrabold text-primary-dark">
                        Le {(booking.totalCents / 100).toLocaleString()}
                      </span>
                    </div>

                    <Link href={`/bookings/${booking.id}`}>
                      <Button variant="outline" size="md" className="font-bold">
                        <span>View Details</span>
                        <ArrowRight className="w-4 h-4 ml-1.5" />
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 rounded-2xl border border-border bg-surface text-center space-y-4 shadow-subtle">
              <Clock className="w-12 h-12 text-primary mx-auto" />
              <h3 className="text-lg font-bold text-text">No bookings found</h3>
              <p className="text-xs text-text-muted max-w-sm mx-auto">
                Discover an experience and start exploring Sierra Leone with verified local hosts.
              </p>
              <Link href="/destinations" className="inline-block mt-2">
                <Button variant="traveler-cta" size="md">
                  Discover Destinations
                </Button>
              </Link>
            </div>
          )}
        </div>
      </main>

      <TravelerFooter />
    </div>
  );
}
