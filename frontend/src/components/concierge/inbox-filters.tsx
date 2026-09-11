'use client';

import React from 'react';
import { Search } from 'lucide-react';

export function InboxFilters({ 
  active, 
  onChange 
}: { 
  active: string; 
  onChange: (f: string) => void 
}) {
  const tabs = [
    { id: 'all', label: 'All' },
    { id: 'unclaimed', label: 'Unclaimed' },
    { id: 'mine', label: 'Mine' },
    { id: 'emergency', label: 'Emergency' },
    { id: 'resolved', label: 'Resolved' },
  ];

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="w-[18px] h-[18px] text-text-muted absolute left-[14px] top-1/2 -translate-y-1/2" />
        <input 
          type="text" 
          placeholder="Search conversations..." 
          className="w-full pl-[38px] pr-[14px] h-[42px] bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
        />
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-[4px] overflow-x-auto pb-1 custom-scrollbar scrollbar-hide -mx-1 px-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`px-[12px] h-[34px] flex items-center justify-center text-[13px] rounded-full whitespace-nowrap transition-colors flex-shrink-0 ${
              active === tab.id
                ? 'bg-[#EAF5F7] text-primary-dark font-semibold'
                : 'text-text-muted hover:bg-background hover:text-text font-medium'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
}
