import { useEffect, useState } from 'react';

import { cn } from '@/lib/utils';

import { Skeleton } from '../ui/skeleton';

export const RouteLoadingFallback = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 150);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className={cn(
        'min-h-screen flex items-center justify-center bg-background relative overflow-hidden',
        'transition-opacity duration-300',
        isVisible ? 'opacity-100' : 'opacity-0'
      )}
    >
      {/* Animated background stars - matching ErrorBoundary aesthetic */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-1/4 left-1/4 w-1 h-1 bg-celestial-400 rounded-full animate-pulse" />
        <div
          className="absolute top-1/3 right-1/3 w-1 h-1 bg-starlight-400 rounded-full animate-pulse"
          style={{ animationDelay: '0.5s' }}
        />
        <div
          className="absolute bottom-1/4 left-1/3 w-1 h-1 bg-celestial-500 rounded-full animate-pulse"
          style={{ animationDelay: '1s' }}
        />
        <div
          className="absolute top-2/3 right-1/4 w-1 h-1 bg-starlight-300 rounded-full animate-pulse"
          style={{ animationDelay: '1.5s' }}
        />
      </div>

      {/* Loading content */}
      <div className="relative z-10 flex flex-col items-center gap-6">
        {/* Spinner using GPU-accelerated transform */}
        <div className="relative w-16 h-16">
          <div
            className="absolute inset-0 rounded-full border-4 border-celestial-200/30"
            style={{ transform: 'translateZ(0)' }}
          />
          <div
            className="absolute inset-0 rounded-full border-4 border-transparent border-t-celestial-500 animate-spin"
            style={{ transform: 'translateZ(0)' }}
          />
        </div>

        {/* Loading text */}
        <div className="flex flex-col items-center gap-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-24" />
        </div>
      </div>
    </div>
  );
};
