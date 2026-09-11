import React from 'react';
import { cn } from '@/lib/utils';

export function ProviderKPISkeleton() {
  return (
    <div className="bg-surface border border-border rounded-2xl p-5 shadow-card flex items-start justify-between animate-pulse">
      <div className="space-y-3">
        <div className="h-3 w-24 bg-border/50 rounded-md"></div>
        <div className="h-8 w-20 bg-border/50 rounded-md"></div>
        <div className="h-3 w-32 bg-border/50 rounded-md"></div>
      </div>
      <div className="w-10 h-10 rounded-xl bg-border/30"></div>
    </div>
  );
}

export function BookingTableSkeleton() {
  return (
    <div className="rounded-2xl border border-border bg-surface shadow-card overflow-hidden animate-pulse">
      <div className="p-4 border-b border-border flex justify-between">
        <div className="h-5 w-40 bg-border/50 rounded-md"></div>
        <div className="h-5 w-24 bg-border/50 rounded-md"></div>
      </div>
      <div className="p-4 space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-border/30"></div>
              <div className="space-y-2">
                <div className="h-3 w-32 bg-border/50 rounded-md"></div>
                <div className="h-3 w-20 bg-border/50 rounded-md"></div>
              </div>
            </div>
            <div className="h-6 w-20 bg-border/50 rounded-full"></div>
            <div className="h-8 w-24 bg-border/50 rounded-md"></div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ChartSkeleton() {
  return (
    <div className="rounded-2xl border border-border bg-surface shadow-card p-6 animate-pulse">
      <div className="h-5 w-48 bg-border/50 rounded-md mb-6"></div>
      <div className="h-64 w-full bg-border/20 rounded-xl flex items-end justify-between px-4 pb-4 gap-2">
        {[40, 70, 45, 90, 65, 80, 55].map((h, i) => (
          <div key={i} className="w-full bg-border/40 rounded-t-sm" style={{ height: `${h}%` }}></div>
        ))}
      </div>
    </div>
  );
}
