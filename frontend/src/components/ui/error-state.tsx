'use client';

import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({ message = 'Something went wrong loading this data.', onRetry }: ErrorStateProps) {
  return (
    <div className="rounded-2xl border border-danger/20 bg-danger/5 p-8 text-center">
      <AlertTriangle className="w-10 h-10 text-danger mx-auto mb-3" />
      <h3 className="text-base font-bold text-text mb-1">Failed to load</h3>
      <p className="text-xs text-text-muted max-w-md mx-auto mb-4">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl bg-primary text-white hover:bg-primary-dark transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Try again
        </button>
      )}
    </div>
  );
}
