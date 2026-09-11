'use client';

import React from 'react';
import { Mail, Phone, Globe, Star } from 'lucide-react';

export function TravelerProfileCard() {
  return (
    <div className="bg-[#FFFFFF] rounded-[14px] border border-[#E5ECEE] p-[18px] shadow-sm flex flex-col gap-5">
      <div className="flex items-center gap-[14px]">
        <div className="w-[52px] h-[52px] rounded-full bg-primary-light flex items-center justify-center text-primary-dark font-bold text-[22px]">
          F
        </div>
        <div>
          <h3 className="font-bold text-[15px] text-text leading-tight">Fatmata Sesay</h3>
          <p className="text-[12px] text-text-muted mt-0.5 font-medium">Traveler since 2025</p>
        </div>
      </div>
      
      <div className="space-y-[10px] pt-1">
        <div className="flex items-center gap-[10px] h-[20px] text-[13px] text-text">
          <Mail className="w-[18px] h-[18px] text-text-muted shrink-0" />
          <span className="font-medium truncate">fatmata.s@example.com</span>
        </div>
        <div className="flex items-center gap-[10px] h-[20px] text-[13px] text-text">
          <Phone className="w-[18px] h-[18px] text-text-muted shrink-0" />
          <span className="font-medium truncate">+232 76 123 456</span>
        </div>
        <div className="flex items-center gap-[10px] h-[20px] text-[13px] text-text">
          <Globe className="w-[18px] h-[18px] text-text-muted shrink-0" />
          <span className="font-medium truncate">English, Krio</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 pt-4 border-t border-[#E5ECEE]">
        <div className="flex flex-col items-center justify-center p-2 bg-[#F7FAFA] rounded-[10px] border border-[#E5ECEE]/70 h-[64px]">
          <span className="text-[11px] text-text-muted font-semibold mb-1 uppercase tracking-wider">Trips</span>
          <span className="font-bold text-[15px] text-text">7</span>
        </div>
        <div className="flex flex-col items-center justify-center p-2 bg-[#F7FAFA] rounded-[10px] border border-[#E5ECEE]/70 h-[64px]">
          <span className="text-[11px] text-text-muted font-semibold mb-1 uppercase tracking-wider">Saved</span>
          <span className="font-bold text-[15px] text-text">3</span>
        </div>
        <div className="flex flex-col items-center justify-center p-2 bg-[#EAF5F7] rounded-[10px] border border-[#BDE1E8]/50 h-[64px]">
          <span className="text-[11px] text-primary-dark font-semibold mb-1 uppercase tracking-wider">Spent</span>
          <span className="font-bold text-[15px] text-primary-dark whitespace-nowrap">Le 25K</span>
        </div>
      </div>
    </div>
  );
}
