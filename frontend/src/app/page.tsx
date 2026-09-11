'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { TravelerHeader } from '@/components/traveler/header';
import { TravelerHero } from '@/components/traveler/hero';
import { DestinationCard } from '@/components/traveler/destination-card';
import { TravelerFooter } from '@/components/traveler/footer';
import { ArrowRight, ShieldCheck, Star, MapPin } from 'lucide-react';
import { useDestinations } from '@/hooks/use-destinations';
import { useProviders } from '@/hooks/use-providers';

const defaultGuides = [
  {
    id: 'guide-1',
    businessName: 'Banana Island Eco Tours',
    slug: 'banana-island-eco-tours',
    category: 'Marine & Historical Guide',
    location: 'Banana Islands',
    imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
    ratingAverage: 4.9,
    reviewCount: 142,
    toursCount: '150+ Tours',
  },
  {
    id: 'guide-2',
    businessName: 'Salone Rainforest Guides',
    slug: 'salone-rainforest-guides',
    category: 'Wildlife & Primate Expert',
    location: 'Tacugama Sanctuary',
    imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80',
    ratingAverage: 4.8,
    reviewCount: 76,
    toursCount: '90+ Treks',
  },
  {
    id: 'guide-3',
    businessName: 'Freetown Coastal Transfers',
    slug: 'freetown-coastal-transfers',
    category: 'Private Chauffeur & Tours',
    location: 'Lumley & Peninsula Coast',
    imageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80',
    ratingAverage: 5.0,
    reviewCount: 98,
    toursCount: '200+ Trips',
  },
  {
    id: 'guide-4',
    businessName: 'Bureh Surf & Heritage Trails',
    slug: 'bureh-surf-heritage-trails',
    category: 'Coastal Culture & Surfing',
    location: 'Bureh Beach',
    imageUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=600&q=80',
    ratingAverage: 4.9,
    reviewCount: 84,
    toursCount: '120+ Sessions',
  },
];

export default function HomePage() {
  const { data: destinations, isLoading: destLoading } = useDestinations({ limit: 4 });
  const { data: providers, isLoading: provLoading } = useProviders({ limit: 4 });

  const displayGuides = React.useMemo(() => {
    if (!providers || providers.length === 0) return defaultGuides;
    const mappedApi = providers.map((p, idx) => ({
      id: p.id,
      businessName: p.businessName,
      slug: p.slug,
      category: p.category ? p.category.replace('_', ' ').toUpperCase() : defaultGuides[idx % defaultGuides.length].category,
      location: p.city || defaultGuides[idx % defaultGuides.length].location,
      imageUrl: p.logoUrl || defaultGuides[idx % defaultGuides.length].imageUrl,
      ratingAverage: p.ratingAverage > 0 ? p.ratingAverage : 4.9,
      reviewCount: p.reviewCount || 45,
      toursCount: '100+ Tours',
    }));
    if (mappedApi.length >= 4) return mappedApi.slice(0, 4);
    return [...mappedApi, ...defaultGuides.slice(mappedApi.length, 4)];
  }, [providers]);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <TravelerHeader />

      <main className="flex-1">
        <TravelerHero />

        {/* 1. About Us / Values Overlapping Section */}
        <section className="relative -mt-16 z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-24">
          <div className="bg-surface rounded-2xl shadow-elevated border border-border p-8 md:p-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div>
                <span className="text-primary font-bold tracking-widest uppercase text-xs">About Salone Travel</span>
                <h2 className="text-3xl md:text-4xl font-extrabold text-text mt-2 mb-4 leading-tight">
                  Experience Sierra Leone with Complete Confidence
                </h2>
                <p className="text-text-muted leading-relaxed mb-6">
                  We bridge international standards with authentic local knowledge, empowering local businesses while guaranteeing traveler safety. Every operator undergoes strict government document checks, safety audits, and verified insurance standards.
                </p>
                <Link href="/about" className="inline-flex items-center justify-center px-6 py-3 border border-border text-sm font-bold rounded-full hover:bg-slate-light transition-smooth text-text">
                  Read More
                </Link>
              </div>
              <div className="relative aspect-video rounded-xl overflow-hidden shadow-card">
                <Image
                  src="https://images.unsplash.com/photo-1542259009477-d625272157b7?auto=format&fit=crop&w=1000&q=80"
                  alt="Sierra Leone Culture"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 group cursor-pointer hover:bg-black/10 transition-colors">
                   <div className="w-16 h-16 rounded-full bg-white/30 backdrop-blur-md flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform">
                     <svg className="w-6 h-6 ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                   </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 2. Popular Tour / Best Things to do (Carousel) */}
        <section className="py-16 w-full max-w-7xl mx-auto overflow-hidden">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <h2 className="text-3xl md:text-4xl font-extrabold text-text mb-4">Best Things to Do</h2>
              <p className="text-text-muted">Discover the most breathtaking destinations and pristine beaches across the Western Area and beyond.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pb-12 pt-4 px-4 sm:px-6 lg:px-8">
            {destLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="w-full">
                  <div className="bg-surface rounded-2xl h-[340px] animate-pulse border border-border" />
                </div>
              ))
            ) : (
              (destinations || []).map((destination) => (
                <div key={destination.id} className="w-full">
                  <DestinationCard destination={destination} />
                </div>
              ))
            )}
          </div>
        </section>

        {/* 3. Best Money (Promotional Split Section) */}
        <section className="py-20 bg-slate-light border-y border-border my-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div className="order-2 md:order-1">
                <h2 className="text-3xl md:text-4xl font-extrabold text-text mb-4 leading-tight">
                  Exclusive Offer - <br className="hidden md:block"/>
                  <span className="text-primary">Freetown Peninsula Tour</span>
                </h2>
                <p className="text-text-muted mb-8 leading-relaxed">
                  Book a comprehensive 3-day guided tour across the most stunning beaches in West Africa. Including premium transport, verified guides, and all access fees.
                </p>
                <div className="flex items-end gap-4 mb-8">
                  <span className="text-xl text-text-muted line-through font-medium">Le 2,500</span>
                  <span className="text-4xl font-extrabold text-warning drop-shadow-sm">Le 1,800</span>
                  <span className="text-sm font-bold text-text-muted pb-1">/ PER PERSON</span>
                </div>
                <button className="bg-primary hover:bg-primary-dark text-white px-8 py-3.5 rounded-full font-bold shadow-md transition-colors w-full sm:w-auto">
                  BOOK NOW
                </button>
              </div>
              <div className="order-1 md:order-2 relative aspect-square md:aspect-[4/3] rounded-2xl overflow-hidden shadow-elevated">
                <Image
                  src="https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&w=1000&q=80"
                  alt="Special Offer Beach Tour"
                  fill
                  className="object-cover"
                />
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-sm bg-surface/95 backdrop-blur-md rounded-xl p-4 shadow-lg flex justify-between text-center border border-border">
                   <div><span className="block text-xl font-extrabold text-text">03</span><span className="text-[10px] uppercase font-bold text-text-muted">Days</span></div>
                   <div className="w-px bg-border"></div>
                   <div><span className="block text-xl font-extrabold text-text">14</span><span className="text-[10px] uppercase font-bold text-text-muted">Hours</span></div>
                   <div className="w-px bg-border"></div>
                   <div><span className="block text-xl font-extrabold text-text">42</span><span className="text-[10px] uppercase font-bold text-text-muted">Mins</span></div>
                   <div className="w-px bg-border"></div>
                   <div><span className="block text-xl font-extrabold text-warning">18</span><span className="text-[10px] uppercase font-bold text-warning">Secs</span></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 4. Meet The Guides (Verified Local Providers) */}
        <section className="py-16 w-full max-w-7xl mx-auto mb-16">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-4">
              <div>
                <span className="text-primary font-bold tracking-widest uppercase text-xs">Vetted Professionals</span>
                <h2 className="text-3xl md:text-4xl font-extrabold text-text mt-1">Meet The Guides</h2>
                <p className="text-text-muted mt-2 max-w-2xl">Connect with our strictly vetted, highly rated local experts who bring Sierra Leone to life.</p>
              </div>
              <Link
                href="/providers"
                className="inline-flex items-center gap-2 text-sm font-bold text-primary hover:text-primary-dark transition-colors self-start sm:self-auto"
              >
                <span>View All Providers</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 px-4 sm:px-6 lg:px-8">
            {provLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="bg-surface rounded-2xl h-[340px] animate-pulse border border-border" />
              ))
            ) : (
              displayGuides.map((guide) => (
                <div
                  key={guide.id}
                  className="group bg-surface rounded-2xl overflow-hidden border border-border hover:border-primary/40 shadow-card hover:shadow-elevated transition-all duration-300 flex flex-col hover:-translate-y-1"
                >
                  {/* Image Container with Badges */}
                  <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-light">
                    <Image
                      src={guide.imageUrl}
                      alt={guide.businessName}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 group-hover:opacity-70 transition-opacity" />

                    {/* Top Badges */}
                    <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
                      {guide.location && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/50 backdrop-blur-md text-white text-[10px] font-semibold">
                          <MapPin className="w-3 h-3 text-white/80" />
                          <span>{guide.location}</span>
                        </span>
                      )}
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-success/90 backdrop-blur-md text-white text-[10px] font-bold shadow-sm ml-auto">
                        <ShieldCheck className="w-3 h-3" />
                        <span>Verified</span>
                      </span>
                    </div>
                  </div>

                  {/* Guide Info */}
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-primary block mb-1">
                        {guide.category}
                      </span>
                      <h3 className="font-extrabold text-base text-text group-hover:text-primary transition-colors line-clamp-1">
                        {guide.businessName}
                      </h3>

                      {/* Rating & Stats */}
                      <div className="flex items-center justify-between mt-2.5 pt-2.5 border-t border-border/60 text-xs">
                        <div className="flex items-center gap-1 font-bold text-warning">
                          <Star className="w-3.5 h-3.5 fill-warning text-warning" />
                          <span>{guide.ratingAverage.toFixed(1)}</span>
                          <span className="text-text-muted font-normal text-[11px]">
                            ({guide.reviewCount})
                          </span>
                        </div>
                        <span className="text-[11px] font-semibold text-text-muted">
                          {guide.toursCount}
                        </span>
                      </div>
                    </div>

                    {/* View Profile Action */}
                    <Link
                      href={`/providers/${guide.slug}`}
                      className="mt-4 w-full py-2 px-3 rounded-xl bg-slate-light group-hover:bg-primary group-hover:text-white text-text font-bold text-xs text-center transition-all flex items-center justify-center gap-1.5"
                    >
                      <span>View Profile</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

      </main>

      <TravelerFooter />
    </div>
  );
}
