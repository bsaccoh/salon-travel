'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MapPin, Calendar, User, Search, ChevronDown } from 'lucide-react';

export function SearchBar() {
  const router = useRouter();
  const [location, setLocation] = useState('');
  const [date, setDate] = useState('');
  const [guests, setGuests] = useState('2 Travelers');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (location.trim()) params.set('search', location.trim());
    if (date) params.set('date', date);
    if (guests) params.set('guests', guests.split(' ')[0]);

    router.push(`/destinations?${params.toString()}`);
  };

  return (
    <div className="w-full">
      <form
        onSubmit={handleSearch}
        className="bg-white rounded-[18px] md:rounded-[25px] p-3 md:p-[13px] shadow-[0_12px_35px_rgba(13,64,90,0.13),0_2px_8px_rgba(13,64,90,0.05)] flex flex-col md:flex-row items-stretch md:h-[94px] w-full"
      >
        {/* Field 1: WHERE TO? */}
        <div className="flex-[1.35] min-w-0 flex items-center min-h-[70px] md:min-h-0 px-4 md:pl-[31px] md:pr-[35px] py-2 md:py-0 border-b md:border-b-0 md:border-r border-[#DFE7EB]">
          <MapPin className="w-5 h-5 text-brand-green shrink-0 md:mr-[15px] mr-3" />
          <div className="flex-1 flex flex-col min-w-0">
            <span className="text-[11px] font-extrabold text-brand-textPrimary uppercase tracking-[0.3px] mb-1">
              Where to?
            </span>
            <input
              type="text"
              placeholder="e.g. River No. 2, Banana Islands"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="bg-transparent text-[15px] text-brand-textPrimary placeholder:text-[#56758D] focus:outline-none w-full font-medium"
            />
          </div>
          <ChevronDown className="w-4 h-4 text-[#587286] shrink-0 hidden md:block ml-2" />
        </div>

        {/* Field 2: WHEN? */}
        <div className="flex-1 min-w-0 flex items-center min-h-[70px] md:min-h-0 px-4 md:px-[35px] py-2 md:py-0 border-b md:border-b-0 md:border-r border-[#DFE7EB]">
          <Calendar className="w-5 h-5 text-brand-green shrink-0 md:mr-[15px] mr-3" />
          <div className="flex-1 flex flex-col min-w-0">
            <span className="text-[11px] font-extrabold text-brand-textPrimary uppercase tracking-[0.3px] mb-1">
              When?
            </span>
            <input
              type="text"
              placeholder="Select dates"
              onFocus={(e) => (e.target.type = 'date')}
              onBlur={(e) => {
                if (!e.target.value) e.target.type = 'text';
              }}
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="bg-transparent text-[15px] text-brand-textPrimary placeholder:text-[#56758D] focus:outline-none w-full font-medium appearance-none"
            />
          </div>
          <ChevronDown className="w-4 h-4 text-[#587286] shrink-0 hidden md:block ml-2" />
        </div>

        {/* Field 3: GUESTS */}
        <div className="flex-1 min-w-0 flex items-center min-h-[70px] md:min-h-0 px-4 md:pl-[31px] md:pr-[35px] py-2 md:py-0">
          <User className="w-5 h-5 text-brand-green shrink-0 md:mr-[15px] mr-3" />
          <div className="flex-1 flex flex-col min-w-0">
            <span className="text-[11px] font-extrabold text-brand-textPrimary uppercase tracking-[0.3px] mb-1">
              Guests
            </span>
            <select
              value={guests}
              onChange={(e) => setGuests(e.target.value)}
              className="bg-transparent text-[15px] text-brand-textPrimary focus:outline-none w-full font-medium cursor-pointer appearance-none"
            >
              <option value="1 Traveler">1 Traveler</option>
              <option value="2 Travelers">2 Travelers</option>
              <option value="3 Travelers">3 Travelers</option>
              <option value="4 Travelers">4 Travelers</option>
              <option value="5+ Travelers">5+ Travelers</option>
            </select>
          </div>
          <ChevronDown className="w-4 h-4 text-[#587286] shrink-0 ml-2" />
        </div>

        {/* Submit Action */}
        <button
          type="submit"
          className="mt-3 md:mt-0 md:ml-[13px] h-[60px] md:h-auto md:w-[158px] w-full px-8 bg-[#15965B] hover:bg-[#117F4C] text-white font-bold text-[16px] rounded-[18px] flex items-center justify-center gap-[11px] transition-colors shrink-0"
        >
          <Search className="w-5 h-5" />
          <span>Search</span>
        </button>
      </form>
    </div>
  );
}
