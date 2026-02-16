import React from 'react';

import { cn } from '@/lib/utils';
import type { PrimitiveItem } from '@/types';

import { ActiveFilters } from './ActiveFilters';
import { RarityFilter } from './rarity-filter';
import { SubstatFilter } from './substat-filter';
import { WeaponTypeFilter } from './weapon-type-filter';

interface UnifiedWeaponFiltersProps {
  // State
  selectedWeaponTypes: string[];
  selectedRarities: number[];
  selectedSubstats?: string[];

  // Options
  weaponTypes: PrimitiveItem[];
  availableRarities: number[];
  availableSubstats?: string[];

  // Handlers
  onToggleWeaponType: (type: string) => void;
  onToggleRarity: (rarity: number) => void;
  onToggleSubstat?: (substat: string) => void;
  onClearAll: () => void;

  // Display config
  displayMode?: 'tabs' | 'bar'; // Default: 'bar'
  showActiveFilters?: boolean; // Default: true
  showSubstats?: boolean; // Default: true if availableSubstats provided
  variant?: 'default' | 'midnight'; // Default: 'default'
  className?: string;
}

/**
 * Unified weapon filter component
 * Composes weapon type, rarity, and substat filters with optional active filter display
 * Supports both tabs mode (catalog) and bar mode (calendar)
 * Mobile-first responsive design
 */
export const UnifiedWeaponFilters: React.FC<UnifiedWeaponFiltersProps> = ({
  selectedWeaponTypes,
  selectedRarities,
  selectedSubstats = [],
  weaponTypes,
  availableRarities,
  availableSubstats,
  onToggleWeaponType,
  onToggleRarity,
  onToggleSubstat,
  onClearAll,
  displayMode = 'bar',
  showActiveFilters = true,
  showSubstats = !!availableSubstats,
  variant = 'default',
  className,
}) => {
  // Determine if we should show substats
  const shouldShowSubstats =
    showSubstats && availableSubstats && availableSubstats.length > 0;

  // Check if there are any active filters
  const hasActiveFilters =
    selectedWeaponTypes.length > 0 ||
    selectedRarities.length > 0 ||
    selectedSubstats.length > 0;

  // Container classes based on variant
  const containerClasses = cn(
    'border-b',
    variant === 'midnight'
      ? 'bg-midnight-800'
      : 'bg-background/95 backdrop-blur-sm',
    className
  );

  return (
    <div className={containerClasses}>
      {/* Filter bar section */}
      <div className="p-2 sm:p-3">
        <div className="flex gap-2 items-center overflow-x-auto scrollbar-hide min-w-max">
          {/* Weapon Type Filter */}
          {weaponTypes.length > 0 && (
            <WeaponTypeFilter
              selectedTypes={selectedWeaponTypes}
              weaponTypes={weaponTypes}
              onToggleType={onToggleWeaponType}
              mode={displayMode}
            />
          )}

          {/* Vertical divider between weapon types and rarities */}
          {weaponTypes.length > 0 &&
            availableRarities.length > 0 &&
            displayMode === 'bar' && (
              <div className="h-6 w-px bg-border shrink-0 mx-1" />
            )}

          {/* Rarity Filter */}
          {availableRarities.length > 0 && (
            <RarityFilter
              selectedRarities={selectedRarities}
              availableRarities={availableRarities}
              onToggleRarity={onToggleRarity}
              variant={variant}
            />
          )}

          {/* Vertical divider between rarities and substats */}
          {availableRarities.length > 0 && shouldShowSubstats && (
            <div className="h-6 w-px bg-border shrink-0 mx-1" />
          )}

          {/* Substat Filter (optional) */}
          {shouldShowSubstats && onToggleSubstat && (
            <SubstatFilter
              selectedSubstats={selectedSubstats}
              availableSubstats={availableSubstats!}
              onToggleSubstat={onToggleSubstat}
            />
          )}
        </div>
      </div>

      {/* Active filters chips (optional) */}
      {showActiveFilters && hasActiveFilters && (
        <ActiveFilters
          selectedWeaponTypes={selectedWeaponTypes}
          selectedRarities={selectedRarities}
          selectedSubstats={selectedSubstats}
          weaponTypes={weaponTypes}
          onToggleWeaponType={onToggleWeaponType}
          onToggleRarity={onToggleRarity}
          onToggleSubstat={onToggleSubstat || (() => {})}
          onClearAll={onClearAll}
        />
      )}
    </div>
  );
};
