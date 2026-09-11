'use client';

import React from 'react';
import { MapPin, Users, Calendar, Clock } from 'lucide-react';

export function BookingContextCard() {
  return (
    <div className="bg-[#FFFFFF] rounded-[14px] border border-[#E5ECEE] p-[18px] shadow-sm flex flex-col gap-4">
      <div className="flex items-start justify-between">
        <div className="flex flex-col">
          <h3 className="font-bold text-[15px] text-text leading-tight">Airport Transfer</h3>
          <p className="text-[12px] font-mono font-medium text-text-muted mt-1">ST-10458</p>
        </div>
        <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-[#FEF3C7] text-[#B45309]">
          Pending
        </span>
      </div>

      <div className="space-y-[12px] pt-[12px] border-t border-[#E5ECEE]">
        <div className="flex items-center justify-between text-[13px]">
          <span className="text-[#7A8A91] font-medium">Date</span>
          <span className="font-semibold text-text tabular-nums">Fri 12 Sep 2026</span>
        </div>
        
        <div className="flex items-center justify-between text-[13px]">
          <span className="text-[#7A8A91] font-medium">Time</span>
          <span className="font-semibold text-text tabular-nums">18:00</span>
        </div>

        <div className="flex items-center justify-between text-[13px]">
          <span className="text-[#7A8A91] font-medium">Guests</span>
          <span className="font-semibold text-text tabular-nums">2</span>
        </div>

        <div className="flex items-center justify-between text-[13px] pt-[12px] border-t border-[#E5ECEE]">
          <span className="text-[#7A8A91] font-medium">Provider</span>
          <span className="font-bold text-primary">Cotton Tree Transfers</span>
        </div>
      </div>
    </div>
  );
}
