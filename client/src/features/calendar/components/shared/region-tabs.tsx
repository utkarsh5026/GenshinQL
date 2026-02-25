import React, { useMemo } from 'react';

import { ScrollTabItem, ScrollTabs } from '@/components/ui/scroll-tabs';
import { CachedImage } from '@/features/cache';
import { useRegions } from '@/stores/usePrimitivesStore';

interface RegionTabsProps {
  regions: string[];
  activeRegion: string;
  onChange: (region: string) => void;
  className?: string;
}

/**
 * Shared tab bar for region/nation switching in calendar views.
 * Looks up icon URLs from the primitives store and renders a ScrollTabs.
 */
export function RegionTabs({
  regions,
  activeRegion,
  onChange,
  className,
}: RegionTabsProps) {
  const primitiveRegions = useRegions();

  const tabItems = useMemo<ScrollTabItem[]>(
    () =>
      regions.map((name) => {
        const region = primitiveRegions.find(
          (r) => r.name.toLowerCase() === name.toLowerCase()
        );
        return {
          id: name,
          label: name,
          icon: region?.url ? (
            <CachedImage
              src={region.url}
              alt={name}
              width={20}
              height={20}
              className="h-full w-full rounded-full object-cover"
            />
          ) : undefined,
        };
      }),
    [regions, primitiveRegions]
  );

  return (
    <ScrollTabs
      items={tabItems}
      activeId={activeRegion}
      onChange={onChange}
      className={className}
    />
  );
}
