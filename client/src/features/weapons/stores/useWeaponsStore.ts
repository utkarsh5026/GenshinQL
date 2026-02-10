import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

import { fetchWeaponsFile } from '../services';
import type { WeaponSummary } from '../types';

interface WeaponsState {
  weapons: WeaponSummary[];
  weaponMap: Record<string, WeaponSummary>;
  weaponTypeMap: Record<string, number[]>;
  loading: boolean;
  error: Error | null;

  setWeapons: (weapons: WeaponSummary[]) => void;
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

function createWeaponTypeMap(
  weapons: WeaponSummary[]
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
        const weaponMap: Record<string, WeaponSummary> = {};
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
