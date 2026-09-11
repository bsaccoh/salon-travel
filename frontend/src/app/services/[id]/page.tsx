'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { TravelerHeader } from '@/components/traveler/header';
import { TravelerFooter } from '@/components/traveler/footer';
import { ConciergeCTA } from '@/components/traveler/concierge-cta';
import { Button } from '@/components/ui/button';
import { useService } from '@/hooks/use-services';
import {
  Users,
  Clock,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  MapPin,
  Star,
  ArrowRight,
  Loader2,
} from 'lucide-react';

export default function ServiceDetailPage({ params }: { params: { id: string } }) {
  const serviceId = params.id;
  const { data: remoteService, isLoading } = useService(serviceId);

  // Fallback defaults for robust presentation
  const service = {
    id: remoteService?.id || serviceId || 'srv-101',
    name: remoteService?.name || 'Banana Islands Day Boat Charter & Snorkeling Excursion',
    providerName: remoteService?.provider?.businessName || 'Banana Island Eco Tours',
    providerSlug: remoteService?.provider?.slug || 'banana-island-eco-tours',
    rating: remoteService?.avgRating || 4.9,
    reviewsCount: remoteService?.reviewCount || 142,
    priceCents: remoteService?.priceCents || 150000,
    currency: remoteService?.currency || 'SLE',
    duration: remoteService?.durationMinutes ? `${Math.round(remoteService.durationMinutes / 60)} Hours` : '7 Hours',
    maxGuests: remoteService?.maxCapacity || 6,
    meetingPoint: remoteService?.meetingPoint || 'Kent Beach Fishing Wharf & Boat Launch',
    heroImage:
      remoteService?.images?.[0] ||
      'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1600&q=85',
    description:
      remoteService?.description ||
      'Departing from scenic Kent Beach, cruise on a modern twin-engine fiberglass boat across the sparkling Atlantic waters to Dublin and Ricketts Islands. Enjoy a walking tour through historical 18th-century stone church ruins, guided reef snorkeling in crystal clear waters, and a freshly prepared beach lunch featuring grilled barracuda, lobster, and traditional cassava bread.',
    included:
      remoteService?.inclusions && remoteService.inclusions.length > 0
        ? remoteService.inclusions
        : [
            'Round-trip boat transfer from Kent Beach to Dublin Island',
            'Marine life jackets and sanitized snorkeling gear',
            'Certified bilingual historical guide (English & Krio)',
            'Beachside grilled seafood lunch and fresh coconut water',
            'Community eco-tourism environmental levy',
          ],
    excluded:
      remoteService?.exclusions && remoteService.exclusions.length > 0
        ? remoteService.exclusions
        : [
            'Personal hotel transfer to Kent Beach (available via Concierge)',
            'Alcoholic beverages and personal souvenirs',
          ],
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <TravelerHeader />

      <main className="flex-1">
        {isLoading ? (
          <div className="flex items-center justify-center py-32">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
          </div>
        ) : (
          <>
            {/* Hero */}
            <div className="relative w-full h-[45vh] min-h-[360px] bg-primary-dark">
              <Image
                src={service.heroImage}
                alt={service.name}
                fill
                priority
                sizes="100vw"
                className="object-cover opacity-85"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary-dark via-primary-dark/40 to-transparent" />

              <div className="absolute bottom-0 inset-x-0 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8 text-white">
                <Link
                  href={`/providers/${service.providerSlug}`}
                  className="text-xs font-bold uppercase tracking-wider text-warning hover:underline"
                >
                  {service.providerName}
                </Link>
                <h1 className="text-3xl sm:text-4xl font-extrabold text-white mt-1">
                  {service.name}
                </h1>
                <div className="mt-2 flex items-center gap-4 text-xs font-semibold">
                  <span className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-warning text-warning" />
                    {service.rating} ({service.reviewsCount} reviews)
                  </span>
                  <span className="flex items-center gap-1 text-success-light">
                    <ShieldCheck className="w-4 h-4 text-warning" />
                    Verified Local Experience
                  </span>
                </div>
              </div>
            </div>

            {/* Content & Sticky Booking Panel */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                {/* Left Info */}
                <div className="lg:col-span-8 space-y-10">
                  <div>
                    <h2 className="text-xl font-bold text-text mb-3">Overview</h2>
                    <p className="text-base text-text-muted leading-relaxed font-normal">
                      {service.description}
                    </p>
                  </div>

                  {/* Inclusions / Exclusions */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="p-6 rounded-2xl border border-border bg-surface shadow-xs space-y-3">
                      <h3 className="text-sm font-bold text-text uppercase tracking-wider">
                        What&apos;s Included
                      </h3>
                      <ul className="space-y-2.5 text-xs text-text-muted">
                        {service.included.map((item, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <CheckCircle2 className="w-4 h-4 text-success shrink-0 mt-0.5" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="p-6 rounded-2xl border border-border bg-surface shadow-xs space-y-3">
                      <h3 className="text-sm font-bold text-text uppercase tracking-wider">
                        What&apos;s Not Included
                      </h3>
                      <ul className="space-y-2.5 text-xs text-text-muted">
                        {service.excluded.map((item, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <XCircle className="w-4 h-4 text-slate shrink-0 mt-0.5" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Right Sticky Booking Panel */}
                <div className="lg:col-span-4">
                  <div className="p-6 sm:p-8 rounded-2xl border border-border bg-surface shadow-elevated sticky top-28 space-y-6">
                    <div className="flex items-baseline justify-between border-b border-border pb-4">
                      <div>
                        <span className="text-xs text-text-muted">Price per person</span>
                        <p className="text-3xl font-extrabold text-primary-dark">
                          Le {(service.priceCents / 100).toLocaleString()}
                        </p>
                      </div>
                      <span className="text-xs font-bold text-success bg-success-light px-2.5 py-1 rounded-full">
                        Instant Request
                      </span>
                    </div>

                    <div className="space-y-3 text-xs text-text-muted">
                      <div className="flex items-center gap-3">
                        <Clock className="w-4 h-4 text-primary" />
                        <span>Duration: <strong className="text-text">{service.duration}</strong></span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Users className="w-4 h-4 text-primary" />
                        <span>Capacity: <strong className="text-text">Up to {service.maxGuests} guests</strong></span>
                      </div>
                      <div className="flex items-center gap-3">
                        <MapPin className="w-4 h-4 text-primary" />
                        <span>Pickup: <strong className="text-text">{service.meetingPoint}</strong></span>
                      </div>
                    </div>

                    <Link href={`/bookings/new?serviceId=${service.id}`} className="block">
                      <Button variant="traveler-cta" size="lg" className="w-full font-bold shadow-md">
                        <span>Reserve Date</span>
                        <ArrowRight className="w-4 h-4 ml-1" />
                      </Button>
                    </Link>

                    <div className="pt-2 text-center text-[11px] text-text-muted flex items-center justify-center gap-1.5 font-medium">
                      <ShieldCheck className="w-4 h-4 text-success" />
                      <span>Free cancellation up to 24 hours before tour</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <ConciergeCTA />
          </>
        )}
      </main>

      <TravelerFooter />
    </div>
  );
}
