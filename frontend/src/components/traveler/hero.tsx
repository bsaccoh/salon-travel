'use client';

import React from 'react';
import Image from 'next/image';
import { SearchBar } from './search-bar';

export function TravelerHero() {
  return (
    <section className="relative w-full h-[550px] md:h-[528px] mb-[260px] md:mb-0">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="https://images.unsplash.com/photo-1611395813517-41f9be5e292d?auto=format&fit=crop&w=2400&q=80"
          alt="Aerial view of the turquoise waters and white sand of Tokeh Beach, Sierra Leone"
          fill
          priority
          className="object-cover"
          style={{ objectPosition: 'center 50%' }}
        />
        {/* Directional overlay */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(90deg, rgba(4,43,68,0.55) 0%, rgba(4,43,68,0.30) 45%, rgba(4,43,68,0.08) 100%)',
          }}
        />
      </div>

      <div className="relative z-20 w-full h-full max-w-[1280px] mx-auto px-4 sm:px-[5%] lg:px-[7%]">
        <div className="pt-[55px] sm:pt-[71px] max-w-full sm:max-w-[570px] text-left">
          {/* Eyebrow */}
          <div className="flex items-center gap-[13px] mb-[27px]">
            <span className="text-[12px] font-bold uppercase tracking-[1.9px] text-white">
              Salone Travel
            </span>
            <div className="h-[2px] w-12 bg-brand-greenLight shrink-0" />
          </div>

          {/* Heading */}
          <h1 className="text-[38px] sm:text-[54px] lg:text-[61px] leading-[1.11] font-extrabold tracking-[-1.2px] sm:tracking-[-2.4px] text-white">
            Discover the True<br />
            Beauty<br />
            of <span className="text-brand-greenLight">Sierra Leone</span>
          </h1>

          {/* Description */}
          <p className="mt-[27px] max-w-full sm:max-w-[560px] text-[15px] sm:text-[17px] text-white leading-[1.85] font-normal">
            Explore stunning islands, pristine beaches, rich culture, and
            unforgettable experiences. Your next adventure starts here.
          </p>
        </div>
      </div>

      {/* Floating Search Bar overlapping the bottom */}
      <div className="absolute left-0 right-0 -bottom-[260px] md:-bottom-[40px] z-30 px-4 sm:px-[5%] lg:px-[7%]">
        <div className="max-w-[1270px] mx-auto">
          <SearchBar />
        </div>
      </div>
    </section>
  );
}
