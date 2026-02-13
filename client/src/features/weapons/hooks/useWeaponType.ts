import { useMemo } from 'react';

import { useWeapons, useWeaponTypeMap } from '@/stores';
import { WeaponType } from '@/types';

export function useWeaponType(weaponType: WeaponType) {
  const weaponTypeMap = useWeaponTypeMap();
  const allWeapons = useWeapons();

  const weapons = useMemo(() => {
    const weaponIndices = weaponTypeMap[weaponType] || [];
    return weaponIndices.map((index) => allWeapons[index]);
  }, [weaponType, weaponTypeMap, allWeapons]);

  return {
    weapons,
  };
}
