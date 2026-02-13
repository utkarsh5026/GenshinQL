import { useCallback, useMemo, useState } from 'react';

import { parseSubstat } from '@/features/weapons/utils/substat-utils';

import type { WeaponMaterialSchedule } from '../types';

interface WeaponFilters {
  weaponTypes: string[];
  rarities: number[];
  substats: string[];
}

export function useWeaponFilter(weaponSchedule: WeaponMaterialSchedule[]) {
  const [filters, setFilters] = useState<WeaponFilters>({
    weaponTypes: [],
    rarities: [],
    substats: [],
  });

  const { uniqueRarities, uniqueSubstats } = useMemo(() => {
    if (!weaponSchedule) return { uniqueRarities: [], uniqueSubstats: [] };

    const raritySet = new Set<number>();
    const substatSet = new Set<string>();

    weaponSchedule.forEach(({ materials }) => {
      materials.forEach(({ weapons }) => {
        weapons.forEach((weapon) => {
          raritySet.add(weapon.rarity);
          const parsed = parseSubstat(weapon.subStat);
          if (parsed.type === 'None' || parsed.type === 'Physical DMG Bonus') {
            return;
          }
          substatSet.add(parsed.type);
        });
      });
    });

    return {
      uniqueRarities: Array.from(raritySet).sort((a, b) => b - a), // 5→1
      uniqueSubstats: Array.from(substatSet).sort(),
    };
  }, [weaponSchedule]);

  const toggleWeaponType = useCallback((type: string) => {
    setFilters((prev) => ({
      ...prev,
      weaponTypes: prev.weaponTypes.includes(type)
        ? prev.weaponTypes.filter((t) => t !== type)
        : [...prev.weaponTypes, type],
    }));
  }, []);

  const toggleRarity = useCallback((rarity: number) => {
    setFilters((prev) => ({
      ...prev,
      rarities: prev.rarities.includes(rarity)
        ? prev.rarities.filter((r) => r !== rarity)
        : [...prev.rarities, rarity],
    }));
  }, []);

  const toggleSubstat = useCallback((substat: string) => {
    setFilters((prev) => ({
      ...prev,
      substats: prev.substats.includes(substat)
        ? prev.substats.filter((s) => s !== substat)
        : [...prev.substats, substat],
    }));
  }, []);

  const clearAllFilters = useCallback(() => {
    setFilters({ weaponTypes: [], rarities: [], substats: [] });
  }, []);

  const filteredSchedule = useMemo(() => {
    if (!weaponSchedule) return null;

    const hasActiveFilters =
      filters.weaponTypes.length > 0 ||
      filters.rarities.length > 0 ||
      filters.substats.length > 0;

    if (!hasActiveFilters) return weaponSchedule;

    return weaponSchedule.map((schedule) => ({
      ...schedule,
      materials: schedule.materials.map((material) => ({
        ...material,
        weapons: material.weapons.filter((weapon) => {
          const matchesType =
            filters.weaponTypes.length === 0 ||
            filters.weaponTypes.includes(weapon.weaponType);

          const matchesRarity =
            filters.rarities.length === 0 ||
            filters.rarities.includes(weapon.rarity);

          let matchesSubstat = true;
          if (filters.substats.length > 0) {
            const parsed = parseSubstat(weapon.subStat);
            matchesSubstat = filters.substats.includes(parsed.type);
          }

          return matchesType && matchesRarity && matchesSubstat;
        }),
      })),
    }));
  }, [weaponSchedule, filters]);

  return {
    filters,
    filteredSchedule,
    uniqueRarities,
    uniqueSubstats,
    toggleWeaponType,
    toggleRarity,
    toggleSubstat,
    clearAllFilters,
  };
}
