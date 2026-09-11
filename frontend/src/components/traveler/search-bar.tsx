'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  MapPin,
  Palmtree,
  Users,
  Search,
  CheckCircle2,
  ShieldCheck,
  CreditCard,
} from 'lucide-react';

export function SearchBar() {
  const router = useRouter();
  const [location, setLocation] = useState('');
  const [category, setCategory] = useState('');
  const [guests, setGuests] = useState('2');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (location.trim()) params.set('search', location.trim());
    if (category) params.set('category', category);
    if (guests) params.set('guests', guests);

    router.push(`/destinations?${params.toString()}`);
  };

  return (
    <div className="w-full max-w-5xl mx-auto">
      {/* Search Container */}
      <form
        onSubmit={handleSearch}
        className="bg-surface rounded-2xl p-3 md:p-4 shadow-elevated border border-border/80 flex flex-col md:flex-row items-stretch md:items-center gap-3 transition-smooth"
      >
        {/* Field 1: Where to? */}
        <div className="flex-1 flex items-center gap-3 px-3 py-2 rounded-xl bg-background/50 hover:bg-slate-light/40 border border-border/40 transition-smooth">
          <MapPin className="w-5 h-5 text-primary shrink-0" />
          <div className="flex-1 flex flex-col">
            <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">
              Where to?
            </span>
            <input
              type="text"
              placeholder="e.g. River No. 2, Banana Islands"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="bg-transparent text-sm font-semibold text-text placeholder:text-text-muted/60 focus:outline-none w-full"
            />
          </div>
        </div>

        {/* Field 2: Experience Category */}
        <div className="flex-1 flex items-center gap-3 px-3 py-2 rounded-xl bg-background/50 hover:bg-slate-light/40 border border-border/40 transition-smooth">
          <Palmtree className="w-5 h-5 text-primary shrink-0" />
          <div className="flex-1 flex flex-col">
            <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">
              Experience
            </span>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="bg-transparent text-sm font-semibold text-text focus:outline-none w-full cursor-pointer"
            >
              <option value="">All Experiences</option>
              <option value="beach">Pristine Beaches</option>
              <option value="wildlife">Sanctuary & Wildlife</option>
              <option value="heritage">Heritage & History</option>
              <option value="island">Island Boat Excursion</option>
              <option value="culture">Local Arts & Culture</option>
            </select>
          </div>
        </div>

        {/* Field 3: Guests */}
        <div className="w-full md:w-36 flex items-center gap-3 px-3 py-2 rounded-xl bg-background/50 hover:bg-slate-light/40 border border-border/40 transition-smooth">
          <Users className="w-5 h-5 text-primary shrink-0" />
          <div className="flex-1 flex flex-col">
            <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">
              Guests
            </span>
            <select
              value={guests}
              onChange={(e) => setGuests(e.target.value)}
              className="bg-transparent text-sm font-semibold text-text focus:outline-none w-full cursor-pointer"
            >
              <option value="1">1 Traveler</option>
              <option value="2">2 Travelers</option>
              <option value="4">4 Travelers</option>
              <option value="6">6+ Group</option>
            </select>
          </div>
        </div>

        {/* Submit Action */}
        <Button
          type="submit"
          variant="traveler-cta"
          size="lg"
          className="h-14 px-8 shrink-0 font-bold tracking-wide"
        >
          <Search className="w-5 h-5 mr-2" />
          <span>Search</span>
        </Button>
      </form>

      {/* Trust Indicators (Section 15) */}
      <div className="mt-5 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs font-semibold text-white/90 drop-shadow-sm">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-warning" />
          <span>Verified local providers</span>
        </div>
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-warning" />
          <span>24/7 on-ground concierge</span>
        </div>
        <div className="flex items-center gap-2">
          <CreditCard className="w-4 h-4 text-warning" />
          <span>Secure Stripe payments</span>
        </div>
      </div>
    </div>
  );
}
