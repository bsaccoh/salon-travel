'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { PageLoader } from './page-loader';
import { cn } from '@/lib/utils';

function RouteLoaderInner({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isRouting, setIsRouting] = useState(false);

  useEffect(() => {
    setIsRouting(true);
    const timeout = setTimeout(() => {
      setIsRouting(false);
    }, 400); // Simulated delay for visual feedback

    return () => clearTimeout(timeout);
  }, [pathname, searchParams]);

  return (
    <>
      {isRouting && (
        <div className="fixed inset-0 z-[100] bg-background/80 backdrop-blur-sm flex items-center justify-center transition-all duration-200">
          <PageLoader text="Loading..." />
        </div>
      )}
      <div className={cn(isRouting ? 'opacity-50 pointer-events-none' : 'opacity-100', 'transition-opacity duration-200 w-full h-full flex flex-col flex-1')}>
        {children}
      </div>
    </>
  );
}

export function RouteLoader({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<div className="w-full h-full flex flex-col flex-1">{children}</div>}>
      <RouteLoaderInner>{children}</RouteLoaderInner>
    </Suspense>
  );
}
