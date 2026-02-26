import { useMemo } from 'react';

import { ScrollTabItem, ScrollTabs } from '@/components/ui/scroll-tabs';
import { CachedImage } from '@/features/cache';
import { useRegions } from '@/stores/usePrimitivesStore';

interface RegionTabsProps {
  activeRegion: string;
  onChange: (region: string) => void;
  className?: string;
}

/**
 * Shared tab bar for region/nation switching in calendar views.
 * Reads the full region list from the primitives store directly.
 */
export function RegionTabs({
  activeRegion,
  onChange,
  className,
}: RegionTabsProps) {
  const regions = useRegions();

  const tabItems = useMemo<ScrollTabItem[]>(
    () =>
      regions.map((region) => ({
        id: region.name,
        label: region.name,
        icon: region.url ? (
          <CachedImage
            src={region.url}
            alt={region.name}
            width={20}
            height={20}
            className="h-full w-full rounded-full object-cover"
          />
        ) : undefined,
      })),
    [regions]
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
