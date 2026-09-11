'use client';

import React from 'react';
import { Filter, Calendar as CalendarIcon, Box, Activity } from 'lucide-react';

export function ProviderFilters() {
  return (
    <div className="bg-surface rounded-xl p-3 border border-border shadow-subtle mb-6 flex flex-wrap items-center gap-3">
      <div className="flex items-center gap-2 px-3 border-r border-border h-6">
        <Filter className="w-4 h-4 text-primary" />
        <span className="text-xs font-bold text-text">Filter</span>
      </div>

      {/* Date Range */}
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-background transition-smooth cursor-pointer border border-transparent hover:border-border">
        <CalendarIcon className="w-3.5 h-3.5 text-text-muted" />
        <select className="bg-transparent text-xs text-text font-medium outline-none cursor-pointer">
          <option>Last 30 Days</option>
          <option>This Month</option>
          <option>Last 3 Months</option>
          <option>Year to Date</option>
        </select>
      </div>

      {/* Service */}
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-background transition-smooth cursor-pointer border border-transparent hover:border-border">
        <Box className="w-3.5 h-3.5 text-text-muted" />
        <select className="bg-transparent text-xs text-text font-medium outline-none cursor-pointer">
          <option>All Services</option>
          <option>Active Services</option>
          <option>Draft Services</option>
        </select>
      </div>

      {/* Status */}
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-background transition-smooth cursor-pointer border border-transparent hover:border-border">
        <Activity className="w-3.5 h-3.5 text-text-muted" />
        <select className="bg-transparent text-xs text-text font-medium outline-none cursor-pointer">
          <option>All Booking Statuses</option>
          <option>Pending</option>
          <option>Confirmed</option>
          <option>Completed</option>
          <option>Cancelled</option>
        </select>
      </div>

      <div className="ml-auto">
        <button className="text-xs font-semibold text-text-muted hover:text-text transition-smooth px-3 py-1.5">
          Reset
        </button>
      </div>
    </div>
  );
}
