'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { TravelerHeader } from '@/components/traveler/header';
import { TravelerFooter } from '@/components/traveler/footer';
import { ConciergeCTA } from '@/components/traveler/concierge-cta';
import { ShieldCheck, Star, MapPin, ArrowRight, Search, Loader2, Navigation, Compass, X } from 'lucide-react';
import { useProviders } from '@/hooks/use-providers';
import { useGeolocation } from '@/hooks/use-geolocation';
import { ErrorState } from '@/components/ui/error-state';

const fallbackProviders = [
  {
    id: 'fallback-1',
    businessName: 'Banana Island Eco Tours',
    slug: 'banana-island-eco-tours',
    category: 'TOUR_GUIDE',
    city: 'Banana Islands',
    address: 'Dublin Village',
    logoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
    ratingAverage: 4.9,
    ratingCount: 142,
    description: 'Responsible, authentic island boat charters, snorkeling, and historical ruin exploration.',
  },
  {
    id: 'fallback-2',
    businessName: 'Salone Rainforest Guides',
    slug: 'salone-rainforest-guides',
    category: 'TOUR_GUIDE',
    city: 'Western Area',
    address: 'Regent Village / Tacugama',
    logoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80',
    ratingAverage: 4.8,
    ratingCount: 76,
    description: 'Accredited naturalist guides for Tacugama Chimpanzee Sanctuary and primary rainforest canopy trails.',
  },
  {
    id: 'fallback-3',
    businessName: 'Freetown Coastal Transfers',
    slug: 'freetown-coastal-transfers',
    category: 'TRANSPORT',
    city: 'Freetown',
    address: 'Lumley Beach Road',
    logoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80',
    ratingAverage: 5.0,
    ratingCount: 98,
    description: 'Air-conditioned 4x4 Peninsula coastal transport, airport meet-and-greet, and scenic tours.',
  },
  {
    id: 'fallback-4',
    businessName: 'Bureh Surf & Heritage Trails',
    slug: 'bureh-surf-heritage-trails',
    category: 'TOUR_GUIDE',
    city: 'Western Area',
    address: 'Bureh Beach',
    logoUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=600&q=80',
    ratingAverage: 4.9,
    ratingCount: 84,
    description: 'Community-run surf lessons, coastal lagoon boat cruises, and authentic cultural village experiences.',
  },
];

function ProvidersContent() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const {
    coords,
    radiusKm,
    isLocating,
    locationName,
    nearParam,
    requestGpsLocation,
    selectPreset,
    setRadiusKm,
    clearLocation,
    presets,
  } = useGeolocation(50);

  const categories = ['All', 'Tour Operators', 'Transport', 'Eco Guides'];

  const apiCategory = selectedCategory === 'All' ? undefined : selectedCategory.toLowerCase().replace(/\s+/g, '_');
  const { data: providers, isLoading, error, refetch } = useProviders({
    category: apiCategory,
    search: searchQuery || undefined,
    near: nearParam,
  });

  const effectiveProviders = React.useMemo(() => {
    if (providers && providers.length > 0) return providers;
    if (!searchQuery && selectedCategory === 'All') return fallbackProviders as any[];
    return [];
  }, [providers, searchQuery, selectedCategory]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-10">
        <span className="text-xs font-bold uppercase tracking-widest text-primary">
          Verified Marketplace
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-text tracking-tight mt-1">
          Verified Local Providers
        </h1>
        <p className="mt-2 text-base text-text-muted max-w-2xl font-normal">
          Book directly with vetted local operators, licensed guides, and trusted transport specialists across Sierra Leone.
        </p>
      </div>

      {/* Geospatial & Radius Search Controls */}
      <div className="bg-surface border border-border rounded-2xl p-4 sm:p-5 shadow-sm mb-6 space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={requestGpsLocation}
              disabled={isLocating}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all border ${
                coords && locationName === 'My Current Location'
                  ? 'bg-primary text-white border-primary shadow-sm'
                  : 'bg-background hover:bg-primary/5 text-text border-border'
              }`}
            >
              {isLocating ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
              ) : (
                <Navigation className="w-3.5 h-3.5 text-primary" />
              )}
              <span>{isLocating ? 'Locating...' : 'Near Me (GPS)'}</span>
            </button>

            <div className="relative">
              <select
                value={presets.find((p) => p.name === locationName)?.id || ''}
                onChange={(e) => {
                  if (e.target.value) selectPreset(e.target.value);
                  else clearLocation();
                }}
                className="px-3 py-2 text-xs rounded-xl border border-border bg-background text-text font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="">Choose Regional Hub...</option>
                {presets.map((preset) => (
                  <option key={preset.id} value={preset.id}>
                    {preset.name} ({preset.region})
                  </option>
                ))}
              </select>
            </div>

            {coords && (
              <div className="flex items-center gap-1.5 bg-primary/10 text-primary border border-primary/20 px-3 py-1.5 rounded-xl text-xs font-bold">
                <Compass className="w-3.5 h-3.5 shrink-0" />
                <span>Within {radiusKm} km of {locationName}</span>
                <button
                  onClick={clearLocation}
                  className="p-0.5 hover:text-danger rounded transition-colors ml-1"
                  title="Clear radius filter"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>

          {coords && (
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-text-muted uppercase">Radius:</span>
              <div className="flex gap-1">
                {[10, 25, 50, 100].map((r) => (
                  <button
                    key={r}
                    onClick={() => setRadiusKm(r)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${
                      radiusKm === r
                        ? 'bg-primary text-white'
                        : 'bg-background border border-border text-text-muted hover:text-text'
                    }`}
                  >
                    {r}km
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Search bar */}
      <div className="bg-surface rounded-xl p-4 border border-border shadow-subtle mb-10 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 w-full md:w-80 px-3 py-2 rounded-lg bg-background border border-border">
          <Search className="w-4 h-4 text-text-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search provider by name or service..."
            className="bg-transparent text-sm text-text focus:outline-none w-full"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-smooth ${
                selectedCategory === cat
                  ? 'bg-primary-dark text-white shadow-sm'
                  : 'bg-surface border border-border hover:bg-slate-light text-text'
              }`}
            >
              {cat === 'All' ? 'All Providers' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Providers Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-border bg-surface h-96 animate-pulse" />
          ))}
        </div>
      ) : error ? (
        <ErrorState onRetry={() => refetch()} />
      ) : effectiveProviders.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {effectiveProviders.map((provider) => (
            <Link
              key={provider.id}
              href={`/providers/${provider.slug}`}
              className="group flex flex-col rounded-2xl overflow-hidden border border-border bg-surface shadow-card hover:shadow-elevated transition-smooth hover:-translate-y-1"
            >
              <div className="relative aspect-[16/9] w-full bg-slate">
                {provider.logoUrl ? (
                  <Image
                    src={provider.logoUrl}
                    alt={provider.businessName}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover group-hover:scale-105 transition-smooth duration-500"
                  />
                ) : (
                  <div className="w-full h-full bg-primary-dark/10 flex items-center justify-center text-primary text-4xl font-bold">
                    {provider.businessName.charAt(0)}
                  </div>
                )}
                
                {provider.distanceKm !== undefined && (
                  <div className="absolute top-3 left-3 flex items-center gap-1 bg-primary/95 backdrop-blur-xs px-2.5 py-1 rounded-full text-xs font-bold text-white shadow-md">
                    <Compass className="w-3.5 h-3.5 text-secondary" />
                    <span>{provider.distanceKm} km away</span>
                  </div>
                )}

                <div className="absolute top-3 right-3 flex items-center gap-1 bg-surface/90 backdrop-blur-xs px-2.5 py-1 rounded-full text-xs font-bold text-primary-dark">
                  <ShieldCheck className="w-3.5 h-3.5 text-success" />
                  <span>Verified</span>
                </div>
              </div>

              <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  {provider.ratingAverage > 0 && (
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-warning mb-1">
                      <Star className="w-3.5 h-3.5 fill-warning" />
                      <span>{provider.ratingAverage.toFixed(1)}</span>
                      <span className="text-text-muted font-normal">
                        ({provider.ratingCount} reviews)
                      </span>
                    </div>
                  )}

                  <h3 className="text-lg font-bold text-text group-hover:text-primary transition-smooth">
                    {provider.businessName}
                  </h3>

                  {provider.city && (
                    <div className="flex items-center gap-1 text-xs text-text-muted mt-1">
                      <MapPin className="w-3.5 h-3.5 text-slate shrink-0" />
                      <span>{provider.city}{provider.address ? `, ${provider.address}` : ''}</span>
                    </div>
                  )}

                  {provider.description && (
                    <p className="mt-3 text-xs text-text-muted line-clamp-2 leading-relaxed">
                      {provider.description}
                    </p>
                  )}
                </div>

                <div className="pt-4 border-t border-border/70 flex items-center justify-between text-xs font-bold text-primary group-hover:translate-x-1 transition-transform">
                  <span>View Services &amp; Bio</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-surface rounded-2xl border border-border">
          <p className="text-sm font-semibold text-text">No providers found matching your search.</p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('All');
            }}
            className="mt-3 text-xs font-bold text-primary hover:underline"
          >
            Clear filters
          </button>
        </div>
      )}
    </div>
  );
}

export default function ProvidersDirectoryPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <TravelerHeader />

      <main className="flex-1 bg-background py-12">
        <Suspense
          fallback={
            <div className="flex items-center justify-center py-20 text-primary">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
          }
        >
          <ProvidersContent />
        </Suspense>

        <div className="mt-20">
          <ConciergeCTA />
        </div>
      </main>

      <TravelerFooter />
    </div>
  );
}
