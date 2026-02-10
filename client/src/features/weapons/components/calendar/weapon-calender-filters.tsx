import React from 'react';

import type { PrimitiveItem } from '@/types';

import { ActiveFilters } from '../filters/ActiveFilters';
import { WeaponFilterBar } from '../filters/WeaponFilterBar';

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
    <div className="border-b bg-background/95 backdrop-blur-sm">
      {/* Horizontal scrolling filter bar */}
      <div className="p-3 sm:p-4">
        <WeaponFilterBar
          selectedWeaponTypes={selectedWeaponTypes}
          selectedRarities={selectedRarities}
          selectedSubstats={selectedSubstats}
          weaponTypes={weaponTypes}
          uniqueRarities={uniqueRarities}
          uniqueSubstats={uniqueSubstats}
          onToggleWeaponType={onToggleWeaponType}
          onToggleRarity={onToggleRarity}
          onToggleSubstat={onToggleSubstat}
          onClearAll={onClearAll}
        />
      </div>

      {/* Active filters display */}
      <ActiveFilters
        selectedWeaponTypes={selectedWeaponTypes}
        selectedRarities={selectedRarities}
        selectedSubstats={selectedSubstats}
        weaponTypes={weaponTypes}
        onToggleWeaponType={onToggleWeaponType}
        onToggleRarity={onToggleRarity}
        onToggleSubstat={onToggleSubstat}
        onClearAll={onClearAll}
      />
    </div>
  );
};

export default WeaponCalendarFilters;
