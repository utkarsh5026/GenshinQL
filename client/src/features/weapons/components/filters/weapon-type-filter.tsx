import React, { useMemo } from 'react';

import { TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CachedImage } from '@/features/cache';
import type { PrimitiveItem } from '@/types';

import { FilterButton } from './filter-button';

interface WeaponTypeFilterProps {
  selectedTypes: string[];
  weaponTypes: PrimitiveItem[];
  onToggleType: (type: string) => void;
  mode: 'tabs' | 'bar';
}

/**
 * Dual-mode weapon type filter component
 * - Tabs Mode (catalog): Uses Shadcn Tabs for navigation-style filtering
 * - Bar Mode (calendar): Uses FilterButton for multi-select filtering
 * Mobile-responsive: Icon-only in tabs mode, icon + text in bar mode
 */
export const WeaponTypeFilter: React.FC<WeaponTypeFilterProps> = ({
  selectedTypes,
  weaponTypes,
  onToggleType,
  mode,
}) => {
  // Memoize weapon type icon map for performance
  const weaponTypeIconMap = useMemo(() => {
    return weaponTypes.reduce(
      (acc, { name, url }) => {
        acc[name] = url;
        return acc;
      },
      {} as Record<string, string>
    );
  }, [weaponTypes]);

  if (weaponTypes.length === 0) {
    return null;
  }

  if (mode === 'tabs') {
    return (
      <div className="flex items-center gap-2 pr-3 border-r border-border/50">
        {/* Optional "Type:" label - hidden on mobile */}
        <span className="text-xs text-muted-foreground font-medium shrink-0 hidden sm:inline">
          Type:
        </span>

        <TabsList className="p-0 bg-transparent h-auto gap-1">
          {weaponTypes.map((type) => (
            <TabsTrigger
              key={type.name}
              value={type.name}
              onClick={() => onToggleType(type.name)}
              className="shrink-0 min-w-10 px-2 sm:px-3 py-1.5 h-auto data-[state=active]:bg-primary/20 data-[state=active]:text-primary"
            >
              <div className="flex items-center gap-1.5">
                {weaponTypeIconMap[type.name] && (
                  <CachedImage
                    src={weaponTypeIconMap[type.name]}
                    alt={type.name}
                    className="h-4 w-4 object-contain shrink-0"
                  />
                )}
                {/* Hide text on mobile, show on desktop */}
                <span className="hidden sm:inline text-xs">{type.name}</span>
              </div>
            </TabsTrigger>
          ))}
        </TabsList>
      </div>
    );
  }

  // Bar mode: Multi-select filter buttons
  return (
    <div className="flex items-center gap-1.5">
      {weaponTypes.map((weaponType) => {
        const isSelected = selectedTypes.includes(weaponType.name);

        return (
          <FilterButton
            key={weaponType.name}
            isSelected={isSelected}
            onClick={() => onToggleType(weaponType.name)}
            ariaLabel={`Filter by ${weaponType.name}`}
          >
            {weaponTypeIconMap[weaponType.name] && (
              <CachedImage
                src={weaponTypeIconMap[weaponType.name]}
                alt={weaponType.name}
                className="h-4 w-4 object-contain"
              />
            )}
            <span>{weaponType.name}</span>
          </FilterButton>
        );
      })}
    </div>
  );
};
