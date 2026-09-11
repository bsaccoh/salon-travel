'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { TravelerHeader } from '@/components/traveler/header';
import { TravelerFooter } from '@/components/traveler/footer';
import { ConciergeCTA } from '@/components/traveler/concierge-cta';
import { Button } from '@/components/ui/button';
import { useProvider } from '@/hooks/use-providers';
import {
  ShieldCheck,
  Star,
  MapPin,
  Clock,
  Users,
  CheckCircle,
  MessageSquare,
  ArrowRight,
  Loader2,
} from 'lucide-react';

interface ServiceItem {
  id: string;
  name: string;
  priceCents: number;
  duration: string;
  maxGuests: number;
  description: string;
}

interface ReviewItem {
  id: string;
  author: string;
  rating: number;
  date: string;
  comment: string;
}

interface ProviderData {
  slug: string;
  name: string;
  category: string;
  location: string;
  rating: number;
  reviewsCount: number;
  bannerUrl: string;
  logoUrl: string;
  description: string;
  services: ServiceItem[];
  reviews: ReviewItem[];
}

const providersDatabase: Record<string, ProviderData> = {
  'banana-island-eco-tours': {
    slug: 'banana-island-eco-tours',
    name: 'Banana Island Eco Tours',
    category: 'Certified Tour Operator',
    location: 'Dublin Village, Banana Islands, Sierra Leone',
    rating: 4.9,
    reviewsCount: 142,
    bannerUrl:
      'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1600&q=85',
    logoUrl:
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    description:
      'Founded in 2018 by local island residents, Banana Island Eco Tours provides responsible, authentic island experiences. We operate fully serviced fiberglass boats equipped with marine safety vests, licensed skippers, and bilingual historical guides. All our tours directly support community sanitation and school initiatives on Dublin and Ricketts islands.',
    services: [
      {
        id: 'srv-101',
        name: 'Banana Islands Day Boat Charter & Snorkeling',
        priceCents: 150000,
        duration: '7 Hours',
        maxGuests: 6,
        description:
          'Departing from Kent Beach, cruise to Dublin Island. Includes historical walking tour of 18th-century ruins, reef snorkeling, and freshly caught grilled lobster lunch.',
      },
      {
        id: 'srv-102',
        name: 'Sunset Dolphin Cruise & Mangrove Canoe Tour',
        priceCents: 100000,
        duration: '3.5 Hours',
        maxGuests: 4,
        description:
          'Experience the tranquility of the Southern Peninsula waters at golden hour. Watch pods of Atlantic dolphins and navigate hidden mangrove waterways.',
      },
    ],
    reviews: [
      {
        id: 'rev-1',
        author: 'Sarah Jenkins (United Kingdom)',
        rating: 5,
        date: '12 August 2026',
        comment:
          'An extraordinary day! Our guide Mohamed knew every detail of Dublin Island’s fascinating history. The boat was modern and we felt completely safe. The grilled fish on the beach was unforgettable.',
      },
      {
        id: 'rev-2',
        author: 'David & Elena (Germany)',
        rating: 5,
        date: '28 July 2026',
        comment:
          'Snorkeling gear was clean and sanitized, water was crystal clear. Highly recommend booking through Salone Travel.',
      },
    ],
  },

  'salone-rainforest-guides': {
    slug: 'salone-rainforest-guides',
    name: 'Salone Rainforest Guides',
    category: 'Nature & Wildlife Guide Association',
    location: 'Regent Village, Western Area Rainforest, Sierra Leone',
    rating: 4.8,
    reviewsCount: 76,
    bannerUrl:
      'https://images.unsplash.com/photo-1540573133985-87b6da6d54a9?auto=format&fit=crop&w=1600&q=85',
    logoUrl:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    description:
      'Official accredited naturalist guides for the Western Area Peninsula Forest Reserve and Tacugama Chimpanzee Sanctuary. Our team consists of certified ornithologists and conservation rangers dedicated to preserving Sierra Leone’s endangered primates and rare tropical birdlife.',
    services: [
      {
        id: 'srv-201',
        name: 'Tacugama Chimpanzee Sanctuary & Canopy Trek',
        priceCents: 75000,
        duration: '4 Hours',
        maxGuests: 8,
        description:
          'Guided educational walk through the forested rescue sanctuary enclosures, waterfall ravine, and primary rainforest canopy trail.',
      },
      {
        id: 'srv-202',
        name: 'Peninsula Mountain Rainforest Birding Expedition',
        priceCents: 90000,
        duration: '5 Hours',
        maxGuests: 4,
        description:
          'Early morning bird-watching trek to spot the rare White-necked Rockfowl (Picathartes) and endemic emerald cuckoos.',
      },
    ],
    reviews: [
      {
        id: 'rev-3',
        author: 'Dr. Evelyn Reed (Canada)',
        rating: 5,
        date: '04 August 2026',
        comment:
          'Ibrahim and his team are world-class naturalists. Hearing the chimpanzees call across the misty rainforest valley at Tacugama was a spiritual experience.',
      },
      {
        id: 'rev-4',
        author: 'Marcus Vance (United States)',
        rating: 5,
        date: '20 July 2026',
        comment:
          'Well-organized, safe trails, and deep botanical knowledge. A must-do eco tour when visiting Freetown.',
      },
    ],
  },

  'freetown-coastal-transfers': {
    slug: 'freetown-coastal-transfers',
    name: 'Freetown Coastal Transfers',
    category: 'Private Transport & Excursions',
    location: 'Aberdeen / Lumley Beach, Freetown, Sierra Leone',
    rating: 5.0,
    reviewsCount: 98,
    bannerUrl:
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&q=85',
    logoUrl:
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
    description:
      'Premier air-conditioned 4x4 coastal transport and VIP sea-coach transfer coordination across Greater Freetown and the Western Area Peninsula. We ensure reliable, punctual airport pickups from Lungi Airport and safe scenic tours along the coastal highway.',
    services: [
      {
        id: 'srv-301',
        name: 'Private Peninsula Beach Tour (River No. 2, Tokeh & Bureh)',
        priceCents: 120000,
        duration: '8 Hours',
        maxGuests: 4,
        description:
          'Full-day chauffeured tour along the Peninsula coastline with swim stops at River No. 2 Beach, fresh seafood at Tokeh, and surf culture at Bureh.',
      },
      {
        id: 'srv-302',
        name: 'VIP Lungi Airport Arrival & Sea-Coach Fast Track',
        priceCents: 85000,
        duration: '2.5 Hours',
        maxGuests: 3,
        description:
          'Seamless airport meet-and-greet at FNA International, priority luggage transfer, and dedicated private vehicle to your Aberdeen or Lumley hotel.',
      },
    ],
    reviews: [
      {
        id: 'rev-5',
        author: 'Claire Delacroix (France)',
        rating: 5,
        date: '10 August 2026',
        comment:
          'Punctual driver, immaculate air-conditioned Toyota Prado, and friendly service throughout our stay in Freetown.',
      },
    ],
  },

  'bureh-surf-heritage-trails': {
    slug: 'bureh-surf-heritage-trails',
    name: 'Bureh Surf & Heritage Trails',
    category: 'Coastal Culture & Surfing Club',
    location: 'Bureh Beach, Western Area Peninsula, Sierra Leone',
    rating: 4.9,
    reviewsCount: 84,
    bannerUrl:
      'https://images.unsplash.com/photo-1502680390469-be75c86b636f?auto=format&fit=crop&w=1600&q=85',
    logoUrl:
      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80',
    description:
      'Community-run surf and coastal exploration collective based directly at Bureh Beach. Our certified local coaches and fishermen guide you to the Peninsula’s best breaks, tidal lagoons, and historical fishing villages.',
    services: [
      {
        id: 'srv-401',
        name: 'Private Beginner & Intermediate Surf Coaching Session',
        priceCents: 45000,
        duration: '2 Hours',
        maxGuests: 4,
        description:
          'Includes board rental, rash vest, ocean safety briefing, and hands-on wave coaching on Bureh Beach’s famous sandbank.',
      },
      {
        id: 'srv-402',
        name: 'Coastal Lagoon Boat & Bureh River Mangrove Tour',
        priceCents: 60000,
        duration: '3 Hours',
        maxGuests: 6,
        description:
          'Tranquil traditional wooden boat ride up the Bureh River mangrove estuary, birdwatching, and visit to local palm wine tappers.',
      },
    ],
    reviews: [
      {
        id: 'rev-6',
        author: 'Liam O’Connor (Ireland)',
        rating: 5,
        date: '02 September 2026',
        comment:
          'The best surf lesson in West Africa. Alhaji was patient, passionate, and had us standing up on waves within 30 minutes.',
      },
    ],
  },
};

export default function ProviderProfilePage({
  params,
}: {
  params: { slug: string };
}) {
  const { data: remoteProvider, isLoading } = useProvider(params.slug);

  const fallback =
    providersDatabase[params.slug] ||
    (params.slug.includes('rainforest') || params.slug.includes('tacugama')
      ? providersDatabase['salone-rainforest-guides']
      : params.slug.includes('transfer') || params.slug.includes('coastal')
      ? providersDatabase['freetown-coastal-transfers']
      : providersDatabase['banana-island-eco-tours']);

  const provider = {
    slug: remoteProvider?.slug || fallback.slug,
    name: remoteProvider?.businessName || fallback.name,
    category: remoteProvider?.category ? remoteProvider.category.replace('_', ' ').toUpperCase() : fallback.category,
    location: remoteProvider?.city ? `${remoteProvider.city}, Sierra Leone` : fallback.location,
    rating: remoteProvider?.avgRating || fallback.rating,
    reviewsCount: remoteProvider?.reviewCount || fallback.reviewsCount,
    bannerUrl: remoteProvider?.coverUrl || fallback.bannerUrl,
    logoUrl: remoteProvider?.logoUrl || fallback.logoUrl,
    description: remoteProvider?.description || fallback.description,
    services:
      remoteProvider?.services && remoteProvider.services.length > 0
        ? remoteProvider.services.map((s) => ({
            id: s.id,
            name: s.name,
            priceCents: s.priceCents,
            duration: s.durationMinutes ? `${Math.round(s.durationMinutes / 60)} Hours` : '4 Hours',
            maxGuests: s.maxCapacity || 6,
            description: s.description || s.shortDescription || '',
          }))
        : fallback.services,
    reviews:
      remoteProvider?.reviews && remoteProvider.reviews.length > 0
        ? remoteProvider.reviews.map((r: any) => ({
            id: r.id,
            author: r.author?.fullName || 'Verified Traveler',
            rating: r.rating || 5,
            date: new Date(r.createdAt || Date.now()).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
            comment: r.content || r.title || 'Exceptional experience with this provider.',
          }))
        : fallback.reviews,
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <TravelerHeader />

      <main className="flex-1 pb-16">
        {isLoading ? (
          <div className="flex items-center justify-center py-32">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
          </div>
        ) : (
          <>
            {/* Banner Hero */}
            <div className="relative w-full h-[32vh] min-h-[260px] bg-primary-dark">
              <Image
                src={provider.bannerUrl}
                alt={provider.name}
                fill
                priority
                sizes="100vw"
                className="object-cover opacity-80"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
            </div>

        {/* Profile Card Header */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-10">
          <div className="p-6 sm:p-8 rounded-2xl border border-border bg-surface shadow-elevated flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden border-4 border-surface shadow-md bg-slate shrink-0">
                <Image
                  src={provider.logoUrl}
                  alt={provider.name}
                  fill
                  sizes="100px"
                  className="object-cover"
                />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-text">
                    {provider.name}
                  </h1>
                  <span className="inline-flex items-center gap-1 bg-success-light text-success px-2.5 py-0.5 rounded-full text-xs font-bold">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Verified</span>
                  </span>
                </div>

                <div className="mt-1 flex flex-wrap items-center gap-4 text-xs text-text-muted font-medium">
                  <span>{provider.category}</span>
                  <span>•</span>
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate" />
                    <span>{provider.location}</span>
                  </div>
                  <span>•</span>
                  <div className="flex items-center gap-1 text-warning font-bold">
                    <Star className="w-3.5 h-3.5 fill-warning" />
                    <span>{provider.rating}</span>
                    <span className="text-text-muted font-normal">
                      ({provider.reviewsCount} reviews)
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
              <Link href="/messages" className="w-full md:w-auto">
                <Button variant="outline" size="md" className="w-full font-bold gap-2">
                  <MessageSquare className="w-4 h-4 text-primary" />
                  <span>Message Host</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Content Tabs & Sections */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Left Col: Bio & Services */}
            <div className="lg:col-span-8 space-y-10">
              {/* About */}
              <div className="p-6 sm:p-8 rounded-2xl border border-border bg-surface shadow-card space-y-4">
                <h2 className="text-lg font-bold text-text">About {provider.name}</h2>
                <p className="text-sm text-text-muted leading-relaxed font-normal">
                  {provider.description}
                </p>
              </div>

              {/* Excursions / Services List */}
              <div className="space-y-4">
                <h2 className="text-xl font-bold text-text">
                  Available Excursions &amp; Services ({provider.services.length})
                </h2>

                <div className="space-y-4">
                  {provider.services.map((service) => (
                    <div
                      key={service.id}
                      className="p-6 rounded-2xl border border-border bg-surface shadow-card hover:border-primary/40 transition-smooth space-y-4"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <h3 className="text-base font-bold text-text">{service.name}</h3>
                        <div className="text-left sm:text-right">
                          <span className="text-xs text-text-muted">Price </span>
                          <span className="text-2xl font-extrabold text-primary-dark">
                            Le {(service.priceCents / 100).toLocaleString()}
                          </span>
                        </div>
                      </div>

                      <p className="text-xs text-text-muted leading-relaxed font-normal">
                        {service.description}
                      </p>

                      <div className="pt-3 border-t border-border/60 flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center gap-4 text-xs text-text-muted font-medium">
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-primary" />
                            <span>{service.duration}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Users className="w-3.5 h-3.5 text-primary" />
                            <span>Up to {service.maxGuests} guests</span>
                          </div>
                        </div>

                        <Link href={`/bookings/new?serviceId=${service.id}`}>
                          <Button variant="traveler-cta" size="sm" className="font-bold">
                            <span>Book This Tour</span>
                            <ArrowRight className="w-3.5 h-3.5 ml-1" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Reviews Section */}
              <div className="space-y-4">
                <h2 className="text-xl font-bold text-text">
                  Verified Traveler Reviews ({provider.reviews.length})
                </h2>

                <div className="space-y-4">
                  {provider.reviews.map((rev) => (
                    <div
                      key={rev.id}
                      className="p-6 rounded-2xl border border-border bg-surface shadow-card space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-bold text-text">{rev.author}</h4>
                          <span className="text-[11px] text-text-muted">{rev.date}</span>
                        </div>

                        <div className="flex items-center gap-1">
                          {[...Array(rev.rating)].map((_, i) => (
                            <Star key={i} className="w-3.5 h-3.5 fill-warning text-warning" />
                          ))}
                        </div>
                      </div>

                      <p className="text-xs text-text/85 leading-relaxed font-normal">
                        &ldquo;{rev.comment}&rdquo;
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Col: Trust Pillars & Host Guarantee */}
            <div className="lg:col-span-4 space-y-6">
              <div className="p-6 rounded-2xl border border-border bg-surface shadow-card space-y-4">
                <h3 className="text-sm font-bold text-text uppercase tracking-wider">
                  Salone Host Guarantee
                </h3>
                <ul className="space-y-3 text-xs text-text-muted">
                  <li className="flex items-start gap-2.5">
                    <CheckCircle className="w-4 h-4 text-success shrink-0 mt-0.5" />
                    <span>Government business registration and tax compliance verified</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle className="w-4 h-4 text-success shrink-0 mt-0.5" />
                    <span>Marine safety equipment &amp; first-aid certified skippers</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle className="w-4 h-4 text-success shrink-0 mt-0.5" />
                    <span>Fair pricing policy — no on-ground tourist surcharges</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle className="w-4 h-4 text-success shrink-0 mt-0.5" />
                    <span>24/7 dedicated Freetown concierge emergency dispatch</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-16">
          <ConciergeCTA />
        </div>
      </>
    )}
  </main>

      <TravelerFooter />
    </div>
  );
}
