'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Star, MapPin, ArrowUpRight, ChevronLeft, ChevronRight } from 'lucide-react';

export interface FeaturedDestination {
  id: string;
  name: string;
  slug: string;
  category: string;
  region: string;
  rating: number;
  reviewsCount: number;
  startingPrice: string;
  imageUrl: string;
}

const featuredDestinations: FeaturedDestination[] = [
  {
    id: '1',
    name: 'River No. 2 Beach',
    slug: 'river-no-2-beach',
    category: 'Beach',
    region: 'Western Area Peninsula',
    rating: 4.9,
    reviewsCount: 180,
    startingPrice: 'Le 950',
    imageUrl:
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: '2',
    name: 'Banana Islands',
    slug: 'banana-islands',
    category: 'Island',
    region: 'Southern Peninsula Coast',
    rating: 4.9,
    reviewsCount: 142,
    startingPrice: 'Le 1,500',
    imageUrl:
      'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: '3',
    name: 'Tacugama Chimpanzee Sanctuary',
    slug: 'tacugama-sanctuary',
    category: 'Wildlife',
    region: 'Western Area Rainforest',
    rating: 4.8,
    reviewsCount: 96,
    startingPrice: 'Le 750',
    imageUrl:
      'https://images.unsplash.com/photo-1540573133985-87b6da6d54a9?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: '4',
    name: 'Bunce Island Heritage Site',
    slug: 'bunce-island',
    category: 'Heritage',
    region: 'Sierra Leone River Estuary',
    rating: 4.9,
    reviewsCount: 120,
    startingPrice: 'Le 1,200',
    imageUrl:
      'https://images.unsplash.com/photo-1596895111956-bf1cf0599ce5?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: '5',
    name: 'Bureh Beach Surf & Lagoon',
    slug: 'bureh-beach',
    category: 'Surf & Beach',
    region: 'Western Area Peninsula',
    rating: 4.8,
    reviewsCount: 85,
    startingPrice: 'Le 1,000',
    imageUrl:
      'https://images.unsplash.com/photo-1502680390469-be75c86b636f?auto=format&fit=crop&w=800&q=80',
  },
];

export function HeroCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % featuredDestinations.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) =>
      prev === 0 ? featuredDestinations.length - 1 : prev - 1,
    );
  };

  useEffect(() => {
    if (!isPaused) {
      timerRef.current = setInterval(nextSlide, 5000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPaused, currentIndex]);

  const current = featuredDestinations[currentIndex];

  return (
    <div
      className="relative w-full max-w-sm"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Outer Card with Glassmorphic Border Glow */}
      <div className="group relative rounded-3xl overflow-hidden shadow-elevated border border-white/20 bg-primary-dark/80 backdrop-blur-md transition-smooth hover:border-white/40 hover:shadow-2xl">
        <Link href={`/destinations/${current.slug}`} className="block">
          <div className="relative aspect-[4/5] w-full bg-slate overflow-hidden">
            {/* Background Images with smooth cross-fade */}
            {featuredDestinations.map((dest, idx) => (
              <div
                key={dest.id}
                className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                  idx === currentIndex ? 'opacity-100 z-0' : 'opacity-0 pointer-events-none'
                }`}
              >
                <Image
                  src={dest.imageUrl}
                  alt={dest.name}
                  fill
                  priority={idx === 0}
                  sizes="(max-width: 768px) 100vw, 400px"
                  className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                />
              </div>
            ))}

            {/* Gradient Overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-primary-dark/95 via-primary-dark/30 to-black/30 z-10" />

            {/* Top Badges & Progress Info */}
            <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-20">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-warning text-text shadow-md">
                  Featured
                </span>
                <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-white/25 backdrop-blur-md text-white border border-white/20">
                  {current.category}
                </span>
              </div>

              <span className="px-2.5 py-1 rounded-full text-xs font-extrabold bg-primary/80 backdrop-blur-md text-white border border-white/20 shadow-sm">
                from {current.startingPrice}
              </span>
            </div>

            {/* Bottom Content Info */}
            <div className="absolute bottom-0 inset-x-0 p-5 text-white z-20">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-warning mb-1.5">
                <Star className="w-4 h-4 fill-warning" />
                <span>{current.rating}</span>
                <span className="text-white/80 font-normal">
                  ({current.reviewsCount}+ reviews)
                </span>
              </div>

              <h3 className="text-2xl font-bold tracking-tight text-white drop-shadow-sm line-clamp-1">
                {current.name}
              </h3>

              <div className="mt-2.5 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-white/90 font-medium">
                  <MapPin className="w-3.5 h-3.5 text-warning shrink-0" />
                  <span className="truncate">{current.region}</span>
                </div>

                <div className="flex items-center gap-1 text-xs font-bold text-warning group-hover:text-white transition-smooth shrink-0">
                  <span>Explore</span>
                  <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </div>
              </div>
            </div>
          </div>
        </Link>

        {/* Carousel Prev/Next Navigation Controls */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            prevSlide();
          }}
          aria-label="Previous destination"
          className="absolute left-3 top-1/2 -translate-y-1/2 z-30 w-8 h-8 rounded-full bg-black/40 hover:bg-primary backdrop-blur-md text-white flex items-center justify-center border border-white/20 opacity-0 group-hover:opacity-100 transition-smooth hover:scale-110"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            nextSlide();
          }}
          aria-label="Next destination"
          className="absolute right-3 top-1/2 -translate-y-1/2 z-30 w-8 h-8 rounded-full bg-black/40 hover:bg-primary backdrop-blur-md text-white flex items-center justify-center border border-white/20 opacity-0 group-hover:opacity-100 transition-smooth hover:scale-110"
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        {/* Carousel Pagination Dots */}
        <div className="absolute bottom-2 inset-x-0 flex items-center justify-center gap-1.5 z-30 pointer-events-none">
          {featuredDestinations.map((_, idx) => (
            <button
              key={idx}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setCurrentIndex(idx);
              }}
              className={`h-1.5 rounded-full transition-all duration-300 pointer-events-auto ${
                idx === currentIndex
                  ? 'w-6 bg-warning shadow-xs'
                  : 'w-1.5 bg-white/40 hover:bg-white/70'
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
