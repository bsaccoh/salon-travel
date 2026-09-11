'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Flag, Send, FileEdit, UserPlus, CreditCard } from 'lucide-react';

export function ConciergeActionsCard() {
  return (
    <div className="flex flex-col gap-2">
      <Button variant="primary" className="w-full justify-start gap-2 font-bold h-[40px] text-[13px]">
        <FileEdit className="w-[18px] h-[18px]" />
        Create Booking
      </Button>
      
      <Button variant="outline" className="w-full justify-start gap-2 font-bold h-[40px] text-[13px]">
        <UserPlus className="w-[18px] h-[18px]" />
        Assign Provider
      </Button>

      <Button variant="outline" className="w-full justify-start gap-2 font-bold h-[40px] text-[13px]">
        <CreditCard className="w-[18px] h-[18px]" />
        Send Payment Link
      </Button>

      <Button 
        variant="outline" 
        onClick={() => window.confirm('Are you sure you want to flag this conversation as an emergency? This will immediately alert all available operations staff.')}
        className="w-full justify-start gap-2 font-bold text-[#DC2626] border-[#FECACA] hover:bg-[#FEF2F2] mt-2 h-[40px] text-[13px]"
      >
        <Flag className="w-[18px] h-[18px]" />
        Flag Emergency
      </Button>
    </div>
  );
}
