import React from 'react';

import { UnifiedWeaponFilters } from '@/features/weapons/components/filters/weapon-filters';
import type { PrimitiveItem } from '@/types';

interface WeaponCalendarFiltersProps {
  selectedWeaponTypes: string[];
  selectedRarities: number[];
  selectedSubstats: string[];

  weaponTypes: PrimitiveItem[];
  uniqueRarities: number[];
  uniqueSubstats: string[];

  onToggleWeaponType: (type: string) => void;
  onToggleRarity: (rarity: number) => void;
  onToggleSubstat: (substat: string) => void;
  onClearAll: () => void;
}

/**
 * Weapon calendar filter component
 * Uses UnifiedWeaponFilters in bar mode with all features enabled
 * (weapon types, rarities, substats, active filter chips)
 */
const WeaponCalendarFilters: React.FC<WeaponCalendarFiltersProps> = ({
  selectedWeaponTypes,
  selectedRarities,
  selectedSubstats,
  weaponTypes,
  uniqueRarities,
  uniqueSubstats,
  onToggleWeaponType,
  onToggleRarity,
  onToggleSubstat,
  onClearAll,
}) => {
  return (
    <UnifiedWeaponFilters
      selectedWeaponTypes={selectedWeaponTypes}
      selectedRarities={selectedRarities}
      selectedSubstats={selectedSubstats}
      weaponTypes={weaponTypes}
      availableRarities={uniqueRarities}
      availableSubstats={uniqueSubstats}
      onToggleWeaponType={onToggleWeaponType}
      onToggleRarity={onToggleRarity}
      onToggleSubstat={onToggleSubstat}
      onClearAll={onClearAll}
      displayMode="bar"
      showActiveFilters={true}
      // showSubstats={true}
    />
  );
};

export default WeaponCalendarFilters;
