import React from 'react';
import { Loader2 } from 'lucide-react';

interface PageLoaderProps {
  text?: string;
}

export function PageLoader({ text = 'Loading...' }: PageLoaderProps) {
  return (
    <div className="flex items-center justify-center min-h-[50vh] w-full">
      <div className="flex items-center gap-3 text-text-muted">
        <Loader2 className="w-5 h-5 animate-spin text-primary" />
        <span className="text-sm">{text}</span>
      </div>
    </div>
  );
}
