'use client';

import React, { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { TravelerHeader } from '@/components/traveler/header';
import { TravelerFooter } from '@/components/traveler/footer';
import { ConciergeCTA } from '@/components/traveler/concierge-cta';
import { MapPin, Search, Loader2, Navigation, Compass, X, ArrowRight, ChevronRight } from 'lucide-react';
import { useDestinations } from '@/hooks/use-destinations';
import { useGeolocation } from '@/hooks/use-geolocation';
import { ErrorState } from '@/components/ui/error-state';
import { Destination } from '@/lib/types';

// Place your aerial hero photo at: frontend/public/images/destinations-hero.jpg
const HERO_BG = '/images/destinations-hero.jpg';
const HERO_BG_FALLBACK = 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=1600&h=600&fit=crop&q=80';

// Distinct images per destination (category-matched Unsplash)
const DEST_IMAGES: Record<string, string> = {
  'banana-islands':     'https://images.unsplash.com/photo-1559128010-7c1ad6e1b6a5?w=600&h=800&fit=crop&q=80',
  'bunce-island':       'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=600&h=800&fit=crop&q=80',
  'tiwai-island':       'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=600&h=800&fit=crop&q=80',
  'lumley-beach':       'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&h=800&fit=crop&q=80',
  'river-no-2':         'https://images.unsplash.com/photo-1590523741831-ab7e8b8f9c7f?w=600&h=800&fit=crop&q=80',
  'outamba-kilimi':     'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=600&h=800&fit=crop&q=80',
  'freetown-peninsula': 'https://images.unsplash.com/photo-1473116763249-2faaef81ccda?w=600&h=800&fit=crop&q=80',
  'tacugama':           'https://images.unsplash.com/photo-1576502200272-341a4b8d4e2b?w=600&h=800&fit=crop&q=80',
};

const CAT_IMAGES: Record<string, string> = {
  beach:   'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&h=800&fit=crop&q=80',
  island:  'https://images.unsplash.com/photo-1559128010-7c1ad6e1b6a5?w=600&h=800&fit=crop&q=80',
  wildlife:'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=600&h=800&fit=crop&q=80',
  heritage:'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=600&h=800&fit=crop&q=80',
};

const FALLBACK_DESTINATIONS = [
  { id: '1', name: 'Banana Islands',    slug: 'banana-islands',    category: 'Island',   region: 'Western Area',      price: 'Le 950' },
  { id: '2', name: 'Bunce Island',      slug: 'bunce-island',      category: 'Heritage', region: 'Western Area',      price: 'Le 950' },
  { id: '3', name: 'Tiwai Island',      slug: 'tiwai-island',      category: 'Wildlife', region: 'Southern Province', price: 'Le 950' },
  { id: '4', name: 'Lumley Beach',      slug: 'lumley-beach',      category: 'Beach',    region: 'Western Area',      price: 'Le 950' },
  { id: '5', name: 'River No. 2',       slug: 'river-no-2',        category: 'Beach',    region: 'Northern Province', price: 'Le 1,200' },
  { id: '6', name: 'Outamba-Kilimi',    slug: 'outamba-kilimi',    category: 'Wildlife', region: 'Northern Province', price: 'Le 1,500' },
  { id: '7', name: 'Freetown Peninsula',slug: 'freetown-peninsula', category: 'Beach',   region: 'Western Area',      price: 'Le 800' },
  { id: '8', name: 'Tacugama Sanctuary',slug: 'tacugama',           category: 'Wildlife', region: 'Western Area',     price: 'Le 750' },
];

const CATEGORIES = ['All', 'Beach', 'Wildlife', 'Heritage', 'Island'];

function DestinationCard({ dest }: { dest: { id: string; name: string; slug: string; category: string; region?: string; coverImageUrl?: string | null; startingPriceCents?: number; distanceKm?: number; price?: string } }) {
  const imgSrc = dest.coverImageUrl
    || DEST_IMAGES[dest.slug]
    || CAT_IMAGES[dest.category.toLowerCase()]
    || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&h=800&fit=crop&q=80';
  const price = dest.startingPriceCents ? `Le ${(dest.startingPriceCents / 100).toLocaleString()}` : dest.price || 'Le 950';

  return (
    <Link
      href={`/destinations/${dest.slug}`}
      className="group relative block rounded-2xl overflow-hidden aspect-[4/5] shadow-[0_4px_12px_rgba(6,59,99,0.12)] hover:shadow-[0_12px_32px_rgba(6,59,99,0.22)] transition-all duration-300 hover:-translate-y-1"
      style={{ backgroundImage: `url(${imgSrc})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
    >
      {/* overlay */}
      <div className="absolute inset-0 bg-[#063B63]/10 group-hover:bg-[#063B63]/5 transition-colors" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#063B63]/90 via-[#063B63]/20 to-transparent" />

      {/* category badge */}
      <div className="absolute top-3.5 left-3.5">
        <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-white/20 backdrop-blur-sm border border-white/20 text-white">
          {dest.category}
        </span>
      </div>
      {dest.distanceKm !== undefined && (
        <div className="absolute top-3.5 right-3.5">
          <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-[#168B55]/90 text-white flex items-center gap-1">
            <Compass className="w-3 h-3" />{dest.distanceKm} km
          </span>
        </div>
      )}

      {/* content */}
      <div className="absolute bottom-0 left-0 right-0 p-4">
        <div className="flex items-center gap-1.5 text-white mb-1">
          <MapPin className="w-3.5 h-3.5 shrink-0 text-[#4ADE80]" />
          <span className="text-[15px] font-bold leading-tight">{dest.name}</span>
        </div>
        {dest.region && (
          <p className="text-[12px] text-white/70 leading-snug pl-5 mb-2">{dest.region}</p>
        )}
        <div className="flex items-center justify-between pt-2.5 border-t border-white/20">
          <div>
            <span className="text-[9px] uppercase tracking-wider text-white/50 block">Starting from</span>
            <span className="text-[14px] font-bold text-[#E6C98D]">{price}</span>
          </div>
          <span className="flex items-center gap-1 text-[11px] font-bold text-white/80 opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 transition-all duration-300">
            Explore <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>
    </Link>
  );
}

function DestinationsContent() {
  const searchParams = useSearchParams();
  const initialSearch = searchParams.get('where') || '';
  const initialCategory = searchParams.get('experience') || 'All';

  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);

  const {
    coords, radiusKm, isLocating, locationName, nearParam,
    requestGpsLocation, selectPreset, setRadiusKm, clearLocation, presets,
  } = useGeolocation(50);

  const apiCategory = selectedCategory === 'All' ? undefined : selectedCategory.toLowerCase();
  const { data: destinations, isLoading, error, refetch } = useDestinations({
    category: apiCategory,
    search: searchQuery || undefined,
    near: nearParam,
  });

  const results = destinations && destinations.length > 0 ? destinations : null;

  return (
    <>
      {/* ── HERO ── */}
      <section
        className="relative mt-[68px] min-h-[280px] md:min-h-[340px] flex items-center"
        style={{ backgroundImage: `url(${HERO_BG}), url(${HERO_BG_FALLBACK})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
      >
        <div className="absolute inset-0" style={{ background: 'linear-gradient(90deg,rgba(10,35,64,0.92) 0%,rgba(10,35,64,0.75) 50%,rgba(10,35,64,0.35) 100%)' }} />
        <div className="relative z-10 max-w-[1280px] mx-auto px-4 sm:px-8 py-14 text-center w-full">
          <div className="text-[0.72rem] font-bold tracking-[2.5px] uppercase text-[#4ADE80] mb-3">
            Sierra Leone Destinations
          </div>
          <h1 className="text-[2.2rem] sm:text-[2.8rem] md:text-[3.2rem] font-extrabold text-white leading-[1.1] tracking-tight mb-4">
            Explore Sierra Leone
          </h1>
          <p className="text-[0.95rem] md:text-[1.05rem] text-white/75 leading-relaxed max-w-[560px] mx-auto">
            Discover pristine beaches, lush rainforests, rich heritage sites, and breathtaking islands with accredited local guides.
          </p>
        </div>
      </section>

      {/* ── FILTERS ── */}
      <div className="bg-[#F4FAFC] border-b border-[#DCE7EC] sticky top-[68px] z-10">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-8 py-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* Search */}
            <div className="relative flex-1 max-w-[360px]">
              <Search className="w-4 h-4 text-[#94A3B0] absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search destination or region..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#DCE7EC] bg-white text-[0.88rem] text-[#14232B] placeholder:text-[#94A3B0] focus:outline-none focus:ring-2 focus:ring-[#168B55]/20 focus:border-[#168B55] transition-all shadow-sm"
              />
            </div>

            {/* GPS */}
            <button
              onClick={requestGpsLocation}
              disabled={isLocating}
              className={`inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-[0.82rem] font-semibold border transition-all ${
                coords && locationName === 'My Current Location'
                  ? 'bg-[#168B55] text-white border-[#168B55]'
                  : 'bg-white text-[#14232B] border-[#DCE7EC] hover:border-[#168B55] hover:text-[#168B55]'
              }`}
            >
              {isLocating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Navigation className="w-4 h-4" />}
              {isLocating ? 'Locating…' : 'Near Me'}
            </button>

            {/* Regional hub */}
            <select
              value={presets.find((p) => p.name === locationName)?.id || ''}
              onChange={(e) => { if (e.target.value) selectPreset(e.target.value); else clearLocation(); }}
              className="px-3 py-2.5 text-[0.82rem] rounded-xl border border-[#DCE7EC] bg-white text-[#14232B] font-semibold focus:outline-none focus:ring-2 focus:ring-[#168B55]/20 focus:border-[#168B55]"
            >
              <option value="">Choose Regional Hub…</option>
              {presets.map((p) => (
                <option key={p.id} value={p.id}>{p.name} ({p.region})</option>
              ))}
            </select>

            {/* Active location chip */}
            {coords && (
              <div className="flex items-center gap-1.5 bg-[#DDF5E9] text-[#168B55] border border-[#168B55]/20 px-3 py-2.5 rounded-xl text-[0.82rem] font-semibold">
                <Compass className="w-4 h-4 shrink-0" />
                Within {radiusKm} km of {locationName}
                <button onClick={clearLocation} className="ml-1 hover:text-[#0A6B3F]"><X className="w-3.5 h-3.5" /></button>
              </div>
            )}

            {/* Radius pills — only shown when location active */}
            {coords && (
              <div className="flex gap-1.5">
                {[10, 25, 50, 100].map((r) => (
                  <button
                    key={r}
                    onClick={() => setRadiusKm(r)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${
                      radiusKm === r ? 'bg-[#168B55] text-white' : 'bg-white border border-[#DCE7EC] text-[#637A8C] hover:border-[#168B55] hover:text-[#168B55]'
                    }`}
                  >
                    {r}km
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Category pills */}
          <div className="flex flex-wrap gap-2 mt-3">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-1.5 rounded-full text-[0.82rem] font-semibold border transition-all ${
                  selectedCategory.toLowerCase() === cat.toLowerCase()
                    ? 'bg-[#168B55] border-[#168B55] text-white shadow-sm'
                    : 'bg-white border-[#DCE7EC] text-[#637A8C] hover:border-[#168B55] hover:text-[#168B55]'
                }`}
              >
                {cat === 'Beach' ? 'Beaches' : cat === 'Island' ? 'Islands' : cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── GRID ── */}
      <section className="py-12">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-8">
          {/* Result count */}
          {!isLoading && !error && (
            <div className="flex items-center justify-between mb-6">
              <p className="text-[0.88rem] text-[#637A8C]">
                <span className="font-bold text-[#14232B]">
                  {results ? results.length : FALLBACK_DESTINATIONS.length}
                </span>{' '}
                destination{(results ? results.length : FALLBACK_DESTINATIONS.length) !== 1 ? 's' : ''} found
              </p>
              {(searchQuery || selectedCategory !== 'All') && (
                <button
                  onClick={() => { setSearchQuery(''); setSelectedCategory('All'); clearLocation(); }}
                  className="text-[0.82rem] font-semibold text-[#168B55] hover:underline flex items-center gap-1"
                >
                  <X className="w-3.5 h-3.5" /> Clear filters
                </button>
              )}
            </div>
          )}

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="aspect-[4/5] rounded-2xl bg-[#E8F0F5] animate-pulse" />
              ))}
            </div>
          ) : error ? (
            <ErrorState onRetry={() => refetch()} />
          ) : results ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {results.map((d) => (
                <DestinationCard key={d.id} dest={d} />
              ))}
            </div>
          ) : (
            /* Fallback static cards when API not available */
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {FALLBACK_DESTINATIONS
                .filter(d => selectedCategory === 'All' || d.category.toLowerCase() === selectedCategory.toLowerCase())
                .filter(d => !searchQuery || d.name.toLowerCase().includes(searchQuery.toLowerCase()) || d.region.toLowerCase().includes(searchQuery.toLowerCase()))
                .map((d) => (
                  <DestinationCard key={d.id} dest={{ ...d, coverImageUrl: null }} />
                ))}
            </div>
          )}

          {/* Empty state */}
          {!isLoading && !error && results && results.length === 0 && (
            <div className="text-center py-20 bg-[#F4FAFC] rounded-2xl border border-[#DCE7EC]">
              <div className="text-[2rem] mb-3">🗺️</div>
              <p className="text-[0.95rem] font-bold text-[#14232B] mb-1">No destinations found</p>
              <p className="text-[0.85rem] text-[#637A8C] mb-4">Try adjusting your search or filters.</p>
              <button
                onClick={() => { setSearchQuery(''); setSelectedCategory('All'); clearLocation(); }}
                className="text-[0.85rem] font-semibold text-[#168B55] hover:underline"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ── CONCIERGE CTA ── */}
      <div className="pb-12">
        <ConciergeCTA />
      </div>
    </>
  );
}

export default function DestinationsPage() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <TravelerHeader />

      <main className="flex-1">
        <Suspense
          fallback={
            <div className="flex items-center justify-center py-32 text-[#168B55]">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
          }
        >
          <DestinationsContent />
        </Suspense>
      </main>

      <TravelerFooter />
    </div>
  );
}
