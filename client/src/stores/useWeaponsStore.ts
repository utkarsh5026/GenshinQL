import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

import { loadDataForFile } from '@/services/dataService';
import type { Weapon } from '@/types';

export type WeaponDetailed = Omit<Weapon, 'nation' | 'weekdays'> & {
  nation: string;
  weekday: string;
  weaponType: string;
};

type WeaponsData = {
  nations: string[];
  days: string[];
  weapons: Record<string, Weapon[]>;
};

interface WeaponsState {
  weapons: WeaponDetailed[];
  weaponMap: Record<string, WeaponDetailed>;
  weaponTypeMap: Record<string, number[]>;
  loading: boolean;
  error: Error | null;

  setWeapons: (weapons: WeaponDetailed[]) => void;
  fetchWeapons: () => Promise<void>;
  setLoading: (loading: boolean) => void;
  setError: (error: Error | null) => void;
  reset: () => void;
}

const initialState = {
  weapons: [],
  weaponMap: {},
  weaponTypeMap: {},
  loading: false,
  error: null,
};

async function fetchWeaponsFile(): Promise<Array<WeaponDetailed>> {
  const weaponsData = await loadDataForFile<WeaponsData>('weapons.json', null);
  const { nations, days, weapons } = weaponsData;
  const finalWeapons: Array<WeaponDetailed> = [];
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

function createWeaponTypeMap(
  weapons: WeaponDetailed[]
): Record<string, number[]> {
  const weaponTypeMap: Record<string, number[]> = {};
  weapons.forEach((weapon, index) => {
    weaponTypeMap[weapon.weaponType] = weaponTypeMap[weapon.weaponType] || [];
    weaponTypeMap[weapon.weaponType].push(index);
  });
  return weaponTypeMap;
}

export const useWeaponsStore = create<WeaponsState>()(
  devtools(
    (set, get) => ({
      ...initialState,

      setWeapons: (weapons) => {
        const weaponMap: Record<string, WeaponDetailed> = {};
        weapons.forEach((weapon) => {
          weaponMap[weapon.name] = weapon;
        });

        set(
          {
            weapons,
            weaponMap,
            weaponTypeMap: createWeaponTypeMap(weapons),
            loading: false,
            error: null,
          },
          false
        );
      },

      fetchWeapons: async () => {
        set({ loading: true, error: null }, false);

        try {
          get().setWeapons(await fetchWeaponsFile());
        } catch (err) {
          const error =
            err instanceof Error ? err : new Error('Failed to fetch weapons');
          set({ loading: false, error }, false);
        }
      },

      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),
      reset: () => set(initialState),
    }),
    { name: 'WeaponsStore' }
  )
);

export const useWeapons = () => useWeaponsStore((state) => state.weapons);
export const useWeaponMap = () => useWeaponsStore((state) => state.weaponMap);
export const useWeaponTypeMap = () =>
  useWeaponsStore((state) => state.weaponTypeMap);
export const useWeaponsLoading = () =>
  useWeaponsStore((state) => state.loading);
export const useWeaponsError = () => useWeaponsStore((state) => state.error);
