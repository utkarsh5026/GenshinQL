import React, { useRef } from 'react';

import { Skeleton } from '@/components/ui/skeleton';
import type { WeaponSummary } from '@/features/weapons/types';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';

import WeaponAvatar from './weapon-avatar';

interface LazyWeaponAvatarProps {
  weapon: WeaponSummary;
}

/**
 * LazyWeaponAvatar component that only renders WeaponAvatar when visible in viewport
 * Uses intersection observer for performance optimization with large weapon lists
 */
const LazyWeaponAvatar: React.FC<LazyWeaponAvatarProps> = ({ weapon }) => {
  const ref = useRef<HTMLDivElement>(null);
  const isVisible = useIntersectionObserver(ref, {
    rootMargin: '200px',
    threshold: 0.01,
  });

  return (
    <div ref={ref} className="min-h-20">
      {isVisible ? (
        <WeaponAvatar weapon={weapon} />
      ) : (
        <div className="flex flex-col gap-2">
          <Skeleton className="h-10 w-10 rounded-full" />
          <Skeleton className="h-3 w-16" />
        </div>
      )}
    </div>
  );
};

export default React.memo(
  LazyWeaponAvatar,
  (prev, next) => prev.weapon.name === next.weapon.name
);
