import React from 'react';
import { Filter, RotateCcw } from 'lucide-react';

export function GlobalFilters() {
  return (
    <div className="flex flex-wrap items-center gap-3 mb-8 p-4 rounded-xl border border-border bg-surface shadow-sm">
      <div className="flex items-center gap-2 mr-2 text-text-muted">
        <Filter className="w-4 h-4" />
        <span className="text-[10px] font-bold uppercase tracking-wider">Filters</span>
      </div>

      <div className="flex flex-wrap items-center gap-3 flex-1">
        <select className="text-xs bg-background border border-border rounded-lg px-3 py-2 text-text focus:outline-none focus:border-primary shadow-xs">
          <option>All Destinations</option>
          <option>Freetown</option>
          <option>Western Area</option>
          <option>Southern Province</option>
        </select>

        <select className="text-xs bg-background border border-border rounded-lg px-3 py-2 text-text focus:outline-none focus:border-primary shadow-xs">
          <option>All Providers</option>
          <option>Verified</option>
          <option>Pending</option>
        </select>

        <select className="text-xs bg-background border border-border rounded-lg px-3 py-2 text-text focus:outline-none focus:border-primary shadow-xs">
          <option>All Services</option>
          <option>Hotels & Lodges</option>
          <option>Tours & Guides</option>
          <option>Transport</option>
        </select>

        <select className="text-xs bg-background border border-border rounded-lg px-3 py-2 text-text focus:outline-none focus:border-primary shadow-xs">
          <option>All Statuses</option>
          <option>Confirmed</option>
          <option>Pending</option>
          <option>Completed</option>
          <option>Cancelled</option>
        </select>
      </div>

      <button className="flex items-center gap-1.5 text-xs font-semibold text-text-muted hover:text-text transition-smooth px-3 py-2 rounded-lg hover:bg-background">
        <RotateCcw className="w-3.5 h-3.5" />
        <span>Reset</span>
      </button>
    </div>
  );
}
