import { loadDataForFile } from '@/services/dataService';

import { WeaponRaw, WeaponSummary } from '../types';

type WeaponsData = {
  nations: string[];
  days: string[];
  weapons: Record<string, WeaponRaw[]>;
};

export async function fetchWeaponsFile(): Promise<Array<WeaponSummary>> {
  const weaponsData = await loadDataForFile<WeaponsData>('weapons.json', null);
  const { nations, days, weapons } = weaponsData;
  const finalWeapons: Array<WeaponSummary> = [];
  for (const [wepType, weaponList] of Object.entries(weapons)) {
    finalWeapons.push(
      ...weaponList.map((w) => {
        return {
          ...w,
          nation: w.nation && w.nation !== -1 ? nations[w.nation] : 'N/A',
          weekday: w.weekdays && w.weekdays !== -1 ? days[w.weekdays] : 'N/A',
          weaponType: wepType,
        };
      })
    );
  }
  return finalWeapons;
}
