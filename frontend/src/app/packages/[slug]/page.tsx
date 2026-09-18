'use client';

import React from 'react';
import Link from 'next/link';
import { TravelerHeader } from '@/components/traveler/header';
import { TravelerFooter } from '@/components/traveler/footer';
import { ConciergeCTA } from '@/components/traveler/concierge-cta';
import { Button } from '@/components/ui/button';
import { useService } from '@/hooks/use-services';
import {
  ArrowLeft,
  Clock,
  Users,
  MapPin,
  Star,
  Package,
  Loader2,
  CalendarPlus,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

const TYPE_LABELS: Record<string, string> = {
  tour: 'Tour',
  accommodation: 'Accommodation',
  transport: 'Transport',
  experience: 'Experience',
  dining: 'Dining',
};

const TYPE_IMAGES: Record<string, string> = {
  tour:          'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=1200&h=600&fit=crop&q=80',
  accommodation: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&h=600&fit=crop&q=80',
  transport:     'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=1200&h=600&fit=crop&q=80',
  experience:    'https://images.unsplash.com/photo-1559128010-7c1ad6e1b6a5?w=1200&h=600&fit=crop&q=80',
  dining:        'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1200&h=600&fit=crop&q=80',
};

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1473116763249-2faaef81ccda?w=1200&h=600&fit=crop&q=80';

const HIGHLIGHTS: Record<string, string[]> = {
  tour:          ['Expert local guides', 'Transport included', 'Small group sizes'],
  accommodation: ['Free cancellation', 'Daily housekeeping', 'Breakfast options'],
  transport:     ['Air-conditioned vehicles', 'Professional drivers', 'Door-to-door service'],
  experience:    ['Hands-on activities', 'Cultural immersion', 'All equipment provided'],
  dining:        ['Fresh local ingredients', 'Reservation confirmed', 'Dietary options available'],
};

function formatPrice(cents: number, currency = 'SLL') {
  if (cents === 0) return 'Free';
  return `${currency} ${(cents / 100).toLocaleString()}`;
}

function formatDuration(minutes: number | null | undefined) {
  if (!minutes) return null;
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m ? `${h}h ${m}m` : `${h} hours`;
}

export default function PackageDetailPage({ params }: { params: { slug: string } }) {
  const { data: service, isLoading, error } = useService(params.slug);

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <TravelerHeader />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
        </div>
        <TravelerFooter />
      </div>
    );
  }

  if (error || !service) {
    return (
      <div className="flex flex-col min-h-screen">
        <TravelerHeader />
        <div className="flex-1 flex flex-col items-center justify-center gap-4 py-24">
          <Package className="w-16 h-16 text-text-muted opacity-40" />
          <h2 className="text-xl font-bold text-text">Package not found</h2>
          <p className="text-sm text-text-muted">This package may no longer be available.</p>
          <Link href="/packages">
            <Button variant="primary" className="mt-2">Browse All Packages</Button>
          </Link>
        </div>
        <TravelerFooter />
      </div>
    );
  }

  const heroImg = service.images?.[0] || TYPE_IMAGES[service.type] || FALLBACK_IMAGE;
  const highlights = HIGHLIGHTS[service.type] || ['Verified local provider', 'Instant confirmation', 'Flexible booking'];
  const duration = formatDuration(service.durationMinutes);

  return (
    <div className="flex flex-col min-h-screen bg-[#F7F9FC]">
      <TravelerHeader />

      {/* Hero */}
      <div className="relative h-72 sm:h-96 overflow-hidden">
        <img
          src={heroImg}
          alt={service.name}
          className="w-full h-full object-cover"
          onError={e => { (e.target as HTMLImageElement).src = FALLBACK_IMAGE; }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-10">
          <span className="px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-sm text-[10px] font-bold uppercase tracking-wider text-white mb-2 inline-block">
            {TYPE_LABELS[service.type] || service.type}
          </span>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">{service.name}</h1>
        </div>
      </div>

      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 py-10 w-full">
        <Link href="/packages" className="inline-flex items-center gap-1.5 text-xs font-semibold text-text-muted hover:text-text mb-8">
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to packages
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">

            {/* Stats row */}
            <div className="flex flex-wrap gap-4 text-sm bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
              {duration && (
                <div className="flex items-center gap-2 text-text-muted">
                  <Clock className="w-4 h-4 text-primary" />
                  <span className="font-semibold">{duration}</span>
                </div>
              )}
              {service.maxCapacity && (
                <div className="flex items-center gap-2 text-text-muted">
                  <Users className="w-4 h-4 text-primary" />
                  <span className="font-semibold">Up to {service.maxCapacity} guests</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-text-muted">
                <MapPin className="w-4 h-4 text-primary" />
                <span className="font-semibold">Sierra Leone</span>
              </div>
              {service.isActive && (
                <div className="flex items-center gap-2 text-success text-xs font-bold">
                  <CheckCircle2 className="w-4 h-4" />
                  Available
                </div>
              )}
            </div>

            {/* Description */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
              <h2 className="text-base font-bold text-text mb-3">About this Experience</h2>
              <p className="text-sm text-text-muted leading-relaxed">
                {service.description || service.shortDescription || 'No description available.'}
              </p>
            </div>

            {/* Highlights */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
              <h2 className="text-base font-bold text-text mb-4">What's Included</h2>
              <ul className="space-y-2">
                {highlights.map((h, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-text-muted">
                    <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
                    {h}
                  </li>
                ))}
              </ul>
            </div>

            {/* Availability */}
            {!service.isActive && (
              <div className="p-4 rounded-xl bg-warning/10 border border-warning/20 flex items-start gap-3 text-sm text-warning-dark">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <div>
                  <p className="font-bold">Currently Unavailable</p>
                  <p className="text-xs mt-0.5">This package is temporarily paused. Check back soon or contact our concierge for alternatives.</p>
                </div>
              </div>
            )}
          </div>

          {/* Booking sidebar */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-md sticky top-24">
              <div className="mb-4">
                <p className="text-xs text-text-muted font-medium">Starting from</p>
                <p className="text-3xl font-extrabold text-primary-dark">
                  {formatPrice(service.priceCents, service.currency)}
                </p>
                <p className="text-xs text-text-muted">per person</p>
              </div>

              <div className="space-y-2 mb-5">
                {duration && (
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-text-muted">Duration</span>
                    <span className="font-semibold text-text">{duration}</span>
                  </div>
                )}
                {service.maxCapacity && (
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-text-muted">Max group size</span>
                    <span className="font-semibold text-text">{service.maxCapacity} guests</span>
                  </div>
                )}
                <div className="flex items-center justify-between text-xs">
                  <span className="text-text-muted">Type</span>
                  <span className="font-semibold text-text">{TYPE_LABELS[service.type] || service.type}</span>
                </div>
              </div>

              {service.isActive !== false ? (
                <Link href={`/providers`} className="block">
                  <Button variant="traveler-cta" size="lg" className="w-full font-bold gap-2">
                    <CalendarPlus className="w-4 h-4" />
                    Book This Experience
                  </Button>
                </Link>
              ) : (
                <Button variant="outline" size="lg" className="w-full font-bold" disabled>
                  Currently Unavailable
                </Button>
              )}

              <p className="text-[10px] text-center text-text-muted mt-3">
                Free cancellation · Instant confirmation
              </p>
            </div>

            {/* Provider info */}
            {service.provider && (
              <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted mb-3">Provider</h3>
                <p className="font-semibold text-text text-sm">{(service.provider as any).businessName || 'Local Provider'}</p>
                <p className="text-xs text-text-muted mt-0.5">Verified Sierra Leone operator</p>
              </div>
            )}
          </div>

        </div>
      </main>

      <ConciergeCTA />
      <TravelerFooter />
    </div>
  );
}
