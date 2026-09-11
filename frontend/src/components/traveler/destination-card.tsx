import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Destination } from '@/lib/types';
import { Star, MapPin, ArrowRight, Compass } from 'lucide-react';

interface DestinationCardProps {
  destination: Partial<Destination> & {
    id: string;
    name: string;
    slug: string;
    category: string;
    region?: string;
    coverImageUrl?: string | null;
    ratingAverage?: number;
    startingPriceCents?: number;
    distanceKm?: number;
  };
}

export function DestinationCard({ destination }: DestinationCardProps) {
  const imageUrl =
    destination.coverImageUrl ||
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80';

  const priceFormatted = destination.startingPriceCents
    ? `Le ${(destination.startingPriceCents / 100).toLocaleString()}`
    : 'Le 950';

  return (
    <div className="relative group rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 block h-[340px]">
      {/* Image Wrapper - Full bleed */}
      <div className="absolute inset-0 w-full h-full bg-slate-light">
        <Image
          src={imageUrl}
          alt={destination.name}
          fill
          className="object-cover group-hover:scale-110 transition-transform duration-700 ease-in-out"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
        />
        {/* Dark gradient overlay - heavier at bottom */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-300" />
      </div>

      {/* Top Badges */}
      <div className="absolute top-3.5 left-3.5 right-3.5 z-10 flex items-center justify-between pointer-events-none">
        <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-white/20 backdrop-blur-md border border-white/20 text-white shadow-sm">
          {destination.category}
        </span>
        {destination.distanceKm !== undefined && (
          <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-primary/95 backdrop-blur-md text-white shadow-md flex items-center gap-1.5">
            <Compass className="w-3.5 h-3.5 text-secondary" />
            <span>{destination.distanceKm} km away</span>
          </span>
        )}
      </div>

      {/* Content Details - Bottom of Card */}
      <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5 z-10 flex flex-col justify-end">
        <h4 className="font-extrabold text-lg sm:text-xl text-white drop-shadow-md mb-1 leading-tight line-clamp-1">
          <Link href={`/destinations/${destination.slug}`} className="before:absolute before:inset-0">
            {destination.name}
          </Link>
        </h4>
        
        {destination.region && (
          <div className="flex items-center gap-1.5 text-xs sm:text-sm text-white/80 font-medium mb-2.5">
            <MapPin className="w-3.5 h-3.5 opacity-80" />
            <span>{destination.region}</span>
          </div>
        )}

        {/* Footer line with Price and CTA */}
        <div className="flex items-center justify-between pt-2.5 border-t border-white/20">
          <div>
            <span className="text-[9px] sm:text-[10px] uppercase tracking-wider text-white/60 block mb-0.5">Starting from</span>
            <span className="text-base sm:text-lg font-bold text-[#E6C98D]">
              {priceFormatted}
            </span>
          </div>
          
          <div className="opacity-0 group-hover:opacity-100 transform -translate-x-3 group-hover:translate-x-0 transition-all duration-300 ease-out">
            <span className="inline-flex items-center gap-1 text-xs sm:text-sm font-bold text-white uppercase tracking-wider">
              Explore <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
