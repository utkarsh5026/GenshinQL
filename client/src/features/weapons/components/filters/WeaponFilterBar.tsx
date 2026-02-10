import React from 'react';

import { CachedImage } from '@/features/cache';
import { SubstatIcon } from '@/features/weapons/utils';
import type { SubstatType } from '@/features/weapons/utils/substat-utils';

import { WeaponFiltersCommonProps } from '../../types';
import { getCompactSubstatLabel } from '../../utils/filter-utils';
import { FilterButton } from './filter-button';

/**
 * Horizontal scrolling filter bar component
 * Displays weapon types, rarities, and substats in a single scrollable row
 * Optimized for desktop viewing with responsive spacing
 */
export const WeaponFilterBar: React.FC<WeaponFiltersCommonProps> = ({
  selectedWeaponTypes,
  selectedRarities,
  selectedSubstats,
  weaponTypes,
  uniqueRarities,
  uniqueSubstats,
  onToggleWeaponType,
  onToggleRarity,
  onToggleSubstat,
}) => {
  return (
    <div className="flex gap-1.5 items-center overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">
      {/* Weapon Types */}
      {weaponTypes.map((weaponType) => {
        const isSelected = selectedWeaponTypes.includes(weaponType.name);
        return (
          <FilterButton
            key={weaponType.name}
            isSelected={isSelected}
            onClick={() => onToggleWeaponType(weaponType.name)}
            ariaLabel={`Filter by ${weaponType.name}`}
          >
            <CachedImage
              src={weaponType.url}
              alt={weaponType.name}
              width={16}
              height={16}
              className="w-4 h-4"
            />
            <span>{weaponType.name}</span>
          </FilterButton>
        );
      })}

      {/* Divider between groups */}
      {weaponTypes.length > 0 && uniqueRarities.length > 0 && (
        <div className="h-6 w-px bg-border shrink-0 mx-1" />
      )}

      {/* Rarities - Compact format */}
      {uniqueRarities.map((rarity) => {
        const isSelected = selectedRarities.includes(rarity);
        const starColor = rarity === 5 ? 'text-yellow-500' : 'text-violet-500';

        return (
          <FilterButton
            key={rarity}
            isSelected={isSelected}
            onClick={() => onToggleRarity(rarity)}
            ariaLabel={`Filter by ${rarity} star rarity`}
            gap="sm"
          >
            <span className={`${starColor} font-medium`}>{rarity}★</span>
          </FilterButton>
        );
      })}

      {/* Divider */}
      {uniqueRarities.length > 0 && uniqueSubstats.length > 0 && (
        <div className="h-6 w-px bg-border shrink-0 mx-1" />
      )}

      {/* Substats - Abbreviated labels */}
      {uniqueSubstats.map((substat) => {
        const isSelected = selectedSubstats.includes(substat);
        const compactLabel = getCompactSubstatLabel(substat);

        return (
          <FilterButton
            key={substat}
            isSelected={isSelected}
            onClick={() => onToggleSubstat(substat)}
            ariaLabel={`Filter by ${substat}`}
          >
            <SubstatIcon
              type={substat as SubstatType}
              size={14}
              className="opacity-80"
            />
            <span>{compactLabel}</span>
          </FilterButton>
        );
      })}
    </div>
  );
};
