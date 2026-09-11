'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { SearchBar } from './search-bar';
import { cn } from '@/lib/utils';

const BACKGROUND_IMAGES = [
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=2200&q=85',
  'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=2200&q=85',
  'https://images.unsplash.com/photo-1540573133985-87b6da6d54a9?auto=format&fit=crop&w=2200&q=85',
];

export function TravelerHero() {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((current) => (current + 1) % BACKGROUND_IMAGES.length);
    }, 5000); // Change image every 5 seconds
    
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative w-full h-screen min-h-[700px] flex items-center justify-center text-white overflow-hidden -mt-20">
      {/* Full-bleed Panoramic Background Image Carousel */}
      <div className="absolute inset-0 z-0 overflow-hidden bg-primary-dark">
        {BACKGROUND_IMAGES.map((src, index) => (
          <Image
            key={src}
            src={src}
            alt="Sierra Leone Scenic View"
            fill
            priority={index === 0}
            sizes="100vw"
            className={cn(
              "object-cover object-center scale-100 transition-opacity duration-1000 ease-in-out",
              index === activeIndex ? "opacity-100" : "opacity-0"
            )}
          />
        ))}
        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 bg-black/40 z-10" />
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20 text-center flex flex-col items-center mt-10">

        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tighter leading-[1.2] text-white drop-shadow-lg mb-8 uppercase animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100">
          Discover The True Beauty Of <br className="hidden md:block" />
          <span className="text-warning">Sierra Leone</span>
        </h1>

        <p className="text-lg sm:text-xl text-white/90 max-w-3xl font-medium leading-relaxed drop-shadow-md mb-12 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
          Experience the untouched beauty of West Africa. Book verified local guides, pristine island escapes, and authentic cultural tours with complete confidence.
        </p>

        {/* Floating Overlapping Search Bar */}
        <div className="w-full max-w-4xl animate-in fade-in slide-in-from-bottom-10 duration-700 delay-300">
          <SearchBar />
        </div>
      </div>
    </section>
  );
}

