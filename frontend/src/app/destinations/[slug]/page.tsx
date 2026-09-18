'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { TravelerHeader } from '@/components/traveler/header';
import { TravelerFooter } from '@/components/traveler/footer';
import { ConciergeCTA } from '@/components/traveler/concierge-cta';
import { Button } from '@/components/ui/button';
import {
  MapPin, Star, ShieldCheck, CheckCircle, Users, Compass,
  ArrowRight, Clock, Loader2, AlertCircle,
} from 'lucide-react';
import { useDestination } from '@/hooks/use-destinations';
import { useServices } from '@/hooks/use-services';

const FALLBACK_HERO = 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&q=85';

export default function DestinationDetailPage({ params }: { params: { slug: string } }) {
  const { data: destination, isLoading, error } = useDestination(params.slug);
  const { data: allServices } = useServices();

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <TravelerHeader />
        <div className="flex-1 flex items-center justify-center py-32 text-primary">
          <Loader2 className="w-10 h-10 animate-spin" />
        </div>
        <TravelerFooter />
      </div>
    );
  }

  if (error || !destination) {
    return (
      <div className="flex flex-col min-h-screen">
        <TravelerHeader />
        <div className="flex-1 flex flex-col items-center justify-center py-32 gap-4 text-center px-4">
          <AlertCircle className="w-12 h-12 text-danger/50" />
          <h1 className="text-2xl font-bold text-text">Destination Not Found</h1>
          <p className="text-text-muted max-w-sm">
            This destination may have been removed or the link is incorrect.
          </p>
          <Link href="/destinations">
            <Button variant="primary" className="mt-2">Browse All Destinations</Button>
          </Link>
        </div>
        <TravelerFooter />
      </div>
    );
  }

  const heroImage =
    destination.images?.[0] ||
    destination.coverImageUrl ||
    destination.galleryUrls?.[0] ||
    FALLBACK_HERO;

  const highlights = destination.highlights || [];

  // Services that mention this destination by name in their title/description (best-effort)
  const relatedServices = allServices
    ? allServices.filter((s) =>
        s.name.toLowerCase().includes(destination.name.toLowerCase().split(' ')[0]) ||
        (s.description || '').toLowerCase().includes(destination.name.toLowerCase().split(' ')[0])
      ).slice(0, 4)
    : [];

  return (
    <div className="flex flex-col min-h-screen">
      <TravelerHeader />

      <main className="flex-1 bg-background">
        {/* Hero Banner */}
        <div className="relative w-full h-[45vh] min-h-[360px] bg-primary-dark">
          <Image
            src={heroImage}
            alt={destination.name}
            fill
            priority
            sizes="100vw"
            className="object-cover opacity-85"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-primary-dark via-primary-dark/40 to-transparent" />

          <div className="absolute bottom-0 inset-x-0 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8 text-white">
            <div className="flex items-center gap-2 text-warning text-xs font-bold uppercase tracking-wider mb-2">
              <Compass className="w-4 h-4" />
              <span className="capitalize">{destination.category}</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
              {destination.name}
            </h1>

            <div className="mt-3 flex flex-wrap items-center gap-6 text-xs font-semibold text-white/90">
              {destination.region && (
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-warning" />
                  <span>{destination.region}</span>
                </div>
              )}
              {destination.ratingAverage && (
                <div className="flex items-center gap-1.5">
                  <Star className="w-4 h-4 fill-warning text-warning" />
                  <span>{destination.ratingAverage.toFixed(1)}</span>
                  {destination.reviewCount && (
                    <span className="text-white/70 font-normal">({destination.reviewCount} reviews)</span>
                  )}
                </div>
              )}
              <div className="flex items-center gap-1.5 text-success-light">
                <ShieldCheck className="w-4 h-4 text-warning" />
                <span>Verified Tourism Partner Site</span>
              </div>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Left: About, Highlights, Services */}
            <div className="lg:col-span-8 space-y-12">
              <div>
                <h2 className="text-2xl font-bold text-text mb-4">About the Destination</h2>
                <p className="text-base text-text-muted leading-relaxed font-normal">
                  {destination.description || destination.shortDescription || 'No description available.'}
                </p>
              </div>

              {highlights.length > 0 && (
                <div className="p-6 sm:p-8 rounded-2xl border border-border bg-surface shadow-card space-y-4">
                  <h3 className="text-lg font-bold text-text">Destination Highlights</h3>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-text-muted">
                    {highlights.map((highlight, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-success shrink-0 mt-0.5" />
                        <span>{highlight}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Gallery */}
              {(destination.galleryUrls?.length || destination.images?.length) ? (
                <div>
                  <h3 className="text-lg font-bold text-text mb-4">Gallery</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {(destination.images || destination.galleryUrls || []).slice(0, 6).map((url, i) => (
                      <div key={i} className="relative h-36 rounded-xl overflow-hidden">
                        <Image src={url} alt={`${destination.name} ${i + 1}`} fill sizes="300px" className="object-cover" />
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              {/* Related Services */}
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-text">Bookable Excursions &amp; Tours</h2>
                  <p className="text-xs text-text-muted mt-1">
                    Direct booking with verified, accredited local operators
                  </p>
                </div>

                {relatedServices.length > 0 ? (
                  <div className="space-y-4">
                    {relatedServices.map((service) => (
                      <div
                        key={service.id}
                        className="p-6 rounded-2xl border border-border bg-surface shadow-card hover:border-primary/40 transition-smooth space-y-4"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div>
                            <span className="text-[11px] font-bold uppercase tracking-wider text-primary">
                              {service.provider?.businessName || 'Local Operator'}
                            </span>
                            <h3 className="text-base font-bold text-text mt-0.5">{service.name}</h3>
                          </div>

                          <div className="text-left sm:text-right">
                            <span className="text-xs text-text-muted">From </span>
                            <span className="text-2xl font-extrabold text-primary-dark">
                              Le {((service.priceCents || 0) / 100).toLocaleString()}
                            </span>
                          </div>
                        </div>

                        <div className="pt-3 border-t border-border/60 flex flex-wrap items-center justify-between gap-4">
                          <div className="flex items-center gap-4 text-xs text-text-muted font-medium">
                            {service.durationMinutes && (
                              <div className="flex items-center gap-1.5">
                                <Clock className="w-3.5 h-3.5 text-primary" />
                                <span>{service.durationMinutes < 60 ? `${service.durationMinutes}m` : `${Math.round(service.durationMinutes / 60)}h`}</span>
                              </div>
                            )}
                            {service.maxCapacity && (
                              <div className="flex items-center gap-1.5">
                                <Users className="w-3.5 h-3.5 text-primary" />
                                <span>Up to {service.maxCapacity} guests</span>
                              </div>
                            )}
                          </div>

                          <div className="flex items-center gap-3">
                            {service.provider?.slug && (
                              <Link href={`/providers/${service.provider.slug}`}>
                                <Button variant="outline" size="sm" className="font-semibold">View Host</Button>
                              </Link>
                            )}
                            <Link href={`/packages/${service.id}`}>
                              <Button variant="traveler-cta" size="sm" className="font-bold">
                                <span>Book Tour</span>
                                <ArrowRight className="w-3.5 h-3.5 ml-1" />
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 rounded-2xl border border-border bg-surface text-center text-text-muted text-sm">
                    <p>No bookable tours yet for this destination.</p>
                    <Link href="/packages" className="mt-3 inline-block">
                      <Button variant="primary" size="sm" className="mt-2">Browse All Tours</Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Right: Planning & Tips */}
            <div className="lg:col-span-4 space-y-6">
              <div className="p-6 rounded-2xl border border-border bg-surface shadow-card space-y-4">
                <h3 className="text-sm font-bold text-text uppercase tracking-wider">
                  Planning Your Trip
                </h3>
                <p className="text-xs text-text-muted leading-relaxed font-normal">
                  Need a customized itinerary or private boat coordination to {destination.name}? Our on-ground Freetown concierge team is available 24/7.
                </p>
                <Link href="/messages" className="block">
                  <Button variant="traveler-cta" size="md" className="w-full font-bold">
                    Chat with Concierge
                  </Button>
                </Link>
              </div>

              <div className="p-6 rounded-2xl border border-border bg-surface shadow-card space-y-3 text-xs text-text-muted">
                <h4 className="font-bold text-text">Best Time to Visit</h4>
                <p>Dry season (November to April) offers peak sunshine, calm ocean waters, and ideal visibility for snorkeling and hiking.</p>
              </div>

              {destination.latitude && destination.longitude && (
                <div className="p-6 rounded-2xl border border-border bg-surface shadow-card space-y-3 text-xs text-text-muted">
                  <h4 className="font-bold text-text">Location</h4>
                  <p className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-primary" />
                    {destination.latitude.toFixed(4)}, {destination.longitude.toFixed(4)}
                  </p>
                  <a
                    href={`https://maps.google.com/?q=${destination.latitude},${destination.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-primary font-semibold hover:underline"
                  >
                    Open in Google Maps <ArrowRight className="w-3 h-3" />
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>

        <ConciergeCTA />
      </main>

      <TravelerFooter />
    </div>
  );
}
