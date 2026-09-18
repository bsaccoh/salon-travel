'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { TravelerHeader } from '@/components/traveler/header';
import { TravelerFooter } from '@/components/traveler/footer';
import { ConciergeCTA } from '@/components/traveler/concierge-cta';
import { useServices } from '@/hooks/use-services';
import {
  Search,
  Clock,
  Users,
  Package,
  Loader2,
  Star,
  ArrowRight,
  MapPin,
  Compass,
} from 'lucide-react';

const TYPE_LABELS: Record<string, string> = {
  tour: 'Tour',
  accommodation: 'Accommodation',
  transport: 'Transport',
  experience: 'Experience',
  dining: 'Dining',
};

const TYPE_FILTERS = ['All', 'tour', 'accommodation', 'transport', 'experience', 'dining'];

const TYPE_IMAGES: Record<string, string> = {
  tour:          'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=600&h=400&fit=crop&q=80',
  accommodation: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&h=400&fit=crop&q=80',
  transport:     'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=600&h=400&fit=crop&q=80',
  experience:    'https://images.unsplash.com/photo-1559128010-7c1ad6e1b6a5?w=600&h=400&fit=crop&q=80',
  dining:        'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&h=400&fit=crop&q=80',
};

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1473116763249-2faaef81ccda?w=600&h=400&fit=crop&q=80';

function formatPrice(cents: number, currency = 'SLL') {
  if (cents === 0) return 'Free';
  return `${currency} ${(cents / 100).toLocaleString()}`;
}

function formatDuration(minutes: number | null) {
  if (!minutes) return null;
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m ? `${h}h ${m}m` : `${h}h`;
}

export default function PackagesPage() {
  const [typeFilter, setTypeFilter] = useState('All');
  const [search, setSearch] = useState('');

  const { data: services, isLoading, error } = useServices({
    type: typeFilter !== 'All' ? typeFilter : undefined,
  });

  const filtered = (services || []).filter(s =>
    !search ||
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    (s.description || '').toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-[#F7F9FC] flex flex-col">
      <TravelerHeader />

      {/* Hero */}
      <section className="relative bg-gradient-to-br from-[#0B3D2E] via-[#145A38] to-[#1A7248] py-20 px-4 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=1600&h=400&fit=crop&q=60')] bg-cover bg-center" />
        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 text-xs font-semibold mb-4">
            <Compass className="w-3.5 h-3.5 text-[#F5A623]" />
            <span>Curated Sierra Leone Experiences</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
            Travel Packages & Experiences
          </h1>
          <p className="text-white/80 text-lg max-w-2xl mx-auto mb-8">
            Discover authentic tours, stays, and activities from verified local providers across Sierra Leone.
          </p>

          {/* Search */}
          <div className="max-w-lg mx-auto flex items-center gap-3 bg-white rounded-2xl px-4 py-3 shadow-lg">
            <Search className="w-5 h-5 text-gray-400 shrink-0" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search packages, tours, stays…"
              className="flex-1 bg-transparent text-gray-800 text-sm focus:outline-none placeholder:text-gray-400"
            />
          </div>
        </div>
      </section>

      {/* Filter chips */}
      <div className="sticky top-0 z-20 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-2 overflow-x-auto">
          {TYPE_FILTERS.map(t => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${
                typeFilter === t
                  ? 'bg-[#0B3D2E] text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {t === 'All' ? 'All Packages' : TYPE_LABELS[t] || t}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <main className="flex-1 max-w-6xl mx-auto px-4 py-10 w-full">
        {isLoading ? (
          <div className="flex items-center justify-center py-32">
            <Loader2 className="w-10 h-10 animate-spin text-[#0B3D2E]" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-32 text-gray-500">
            <Package className="w-14 h-14 mb-4 text-gray-300" />
            <p className="text-lg font-semibold text-gray-700 mb-1">Could not load packages</p>
            <p className="text-sm">Please try again later.</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-gray-500">
            <Package className="w-14 h-14 mb-4 text-gray-300" />
            <p className="text-lg font-semibold text-gray-700 mb-1">No packages found</p>
            <p className="text-sm">
              {search ? 'Try a different search term.' : 'Check back soon — providers are adding new experiences.'}
            </p>
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-500 mb-6 font-medium">
              {filtered.length} {filtered.length === 1 ? 'package' : 'packages'} available
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map(s => {
                const img = TYPE_IMAGES[s.type] || FALLBACK_IMAGE;
                const duration = formatDuration(s.durationMinutes ?? null);
                return (
                  <div
                    key={s.id}
                    className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-shadow group"
                  >
                    {/* Image */}
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={s.images?.[0] || img}
                        alt={s.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={e => { (e.target as HTMLImageElement).src = img; }}
                      />
                      <div className="absolute top-3 left-3">
                        <span className="px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-sm text-[10px] font-bold uppercase tracking-wider text-[#0B3D2E]">
                          {TYPE_LABELS[s.type] || s.type}
                        </span>
                      </div>
                      {s.isActive === false && (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                          <span className="text-white text-xs font-bold bg-black/60 px-3 py-1 rounded-full">Unavailable</span>
                        </div>
                      )}
                    </div>

                    {/* Body */}
                    <div className="p-5">
                      <h3 className="font-bold text-gray-900 text-base mb-1 line-clamp-2">{s.name}</h3>
                      {s.shortDescription && (
                        <p className="text-xs text-gray-500 line-clamp-2 mb-3">{s.shortDescription}</p>
                      )}

                      <div className="flex items-center gap-3 text-xs text-gray-500 mb-4">
                        {duration && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" /> {duration}
                          </span>
                        )}
                        {s.maxCapacity && (
                          <span className="flex items-center gap-1">
                            <Users className="w-3.5 h-3.5" /> Up to {s.maxCapacity}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5" /> Sierra Leone
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-[10px] text-gray-400 font-medium">From</p>
                          <p className="text-lg font-extrabold text-[#0B3D2E]">
                            {formatPrice(s.priceCents, s.currency)}
                          </p>
                        </div>
                        <Link
                          href={`/providers`}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0B3D2E] text-white text-xs font-bold hover:bg-[#145A38] transition-colors"
                        >
                          Book <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </main>

      <ConciergeCTA />
      <TravelerFooter />
    </div>
  );
}
