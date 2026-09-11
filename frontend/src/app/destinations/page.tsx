'use client';

import React, { useState, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { TravelerHeader } from '@/components/traveler/header';
import { TravelerFooter } from '@/components/traveler/footer';
import { DestinationCard } from '@/components/traveler/destination-card';
import { ConciergeCTA } from '@/components/traveler/concierge-cta';
import { MapPin, Search, Filter, Loader2, Navigation, Compass, X } from 'lucide-react';
import { useDestinations } from '@/hooks/use-destinations';
import { useGeolocation } from '@/hooks/use-geolocation';
import { ErrorState } from '@/components/ui/error-state';

function DestinationsContent() {
  const searchParams = useSearchParams();
  const initialSearch = searchParams.get('where') || '';
  const initialCategory = searchParams.get('experience') || 'All';

  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);

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

  const categories = ['All', 'Beach', 'Wildlife', 'Heritage', 'Island'];

  const apiCategory = selectedCategory === 'All' ? undefined : selectedCategory.toLowerCase();
  const { data: destinations, isLoading, error, refetch } = useDestinations({
    category: apiCategory,
    search: searchQuery || undefined,
    near: nearParam,
  });

  const filteredDestinations = destinations || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Editorial Header */}
      <div className="max-w-3xl mx-auto text-center mb-10 pt-8">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-text tracking-tight mb-4 leading-tight">
          Explore Sierra Leone
        </h1>
        <p className="text-lg text-text-muted font-normal leading-relaxed">
          Discover pristine Atlantic beaches, lush rainforest wildlife sanctuaries, and rich historical islands with accredited local guides.
        </p>
      </div>

      {/* Geospatial & Radius Search Controls */}
      <div className="max-w-4xl mx-auto mb-8 bg-surface border border-border rounded-2xl p-4 sm:p-5 shadow-sm space-y-4">
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

      {/* Filters Bar */}
      <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 mb-12">
        <div className="relative w-full md:w-96">
          <Search className="w-5 h-5 text-text-muted absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search destination or region..."
            className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-border focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all text-text outline-none bg-white shadow-sm"
          />
        </div>

        <div className="flex flex-wrap justify-center gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-5 py-2 rounded-full text-sm font-bold transition-all border-2 ${
                selectedCategory.toLowerCase() === cat.toLowerCase()
                  ? 'bg-primary border-primary text-white shadow-md'
                  : 'bg-white border-border text-text hover:border-primary/50 hover:text-primary hover:bg-primary-light/10'
              }`}
            >
              {cat === 'Beach' ? 'Beaches' : cat === 'Island' ? 'Islands' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Destinations Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-20">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-surface rounded-2xl h-[340px] animate-pulse border border-border" />
          ))}
        </div>
      ) : error ? (
        <ErrorState onRetry={() => refetch()} />
      ) : filteredDestinations.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-20">
          {filteredDestinations.map((destination) => (
            <DestinationCard key={destination.id} destination={destination} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-surface rounded-2xl border border-border">
          <p className="text-sm font-semibold text-text">No destinations found matching your filter.</p>
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

export default function DestinationsPage() {
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
          <DestinationsContent />
        </Suspense>

        <div className="mt-20">
          <ConciergeCTA />
        </div>
      </main>

      <TravelerFooter />
    </div>
  );
}
