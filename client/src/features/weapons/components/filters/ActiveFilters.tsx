import { X } from 'lucide-react';
import React, { useMemo } from 'react';

import { Button } from '@/components/ui/button';
import FilterChip from '@/components/utils/filter/FilterChip';

import type { WeaponFilterOption } from '../../types';

interface ActiveFiltersProps {
  selectedWeaponTypes: string[];
  selectedRarities: number[];
  selectedSubstats: string[];
  weaponTypes: WeaponFilterOption[];
  onToggleWeaponType: (type: string) => void;
  onToggleRarity: (rarity: number) => void;
  onToggleSubstat: (substat: string) => void;
  onClearAll: () => void;
}

/**
 * Displays active filter chips with remove buttons and a clear all option
 * Reuses the existing FilterChip component for consistent styling
 */
export const ActiveFilters: React.FC<ActiveFiltersProps> = ({
  selectedWeaponTypes,
  selectedRarities,
  selectedSubstats,
  weaponTypes,
  onToggleWeaponType,
  onToggleRarity,
  onToggleSubstat,
  onClearAll,
}) => {
  const weaponTypeIconMap = useMemo(() => {
    return weaponTypes.reduce(
      (acc, { name, url }) => {
        acc[name] = url;
        return acc;
      },
      {} as Record<string, string>
    );
  }, [weaponTypes]);

  const hasActiveFilters =
    selectedWeaponTypes.length > 0 ||
    selectedRarities.length > 0 ||
    selectedSubstats.length > 0;

  if (!hasActiveFilters) {
    return null;
  }

  return (
    <div className="px-3 sm:px-4 pb-3 flex flex-wrap gap-1.5 sm:gap-2 items-center">
      <span className="text-xs font-medium text-muted-foreground">Active:</span>

      {/* Weapon type chips */}
      {selectedWeaponTypes.map((type) => (
        <FilterChip
          key={type}
          label={type}
          icon={weaponTypeIconMap[type]}
          type="weaponType"
          onRemove={() => onToggleWeaponType(type)}
        />
      ))}

      {/* Rarity chips */}
      {selectedRarities.map((rarity) => (
        <FilterChip
          key={rarity}
          label={String(rarity)}
          type="rarity"
          onRemove={() => onToggleRarity(rarity)}
        />
      ))}

      {/* Substat chips */}
      {selectedSubstats.map((substat) => (
        <FilterChip
          key={substat}
          label={substat}
          type="substat"
          onRemove={() => onToggleSubstat(substat)}
        />
      ))}

      {/* Clear all button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={onClearAll}
        className="h-7 px-2 text-xs hover:bg-destructive/10 hover:text-destructive"
      >
        <X className="h-3 w-3 mr-1" />
        Clear All
      </Button>
    </div>
  );
};
