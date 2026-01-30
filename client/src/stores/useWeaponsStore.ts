import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

import {
  fetchWeapons as fetchWeaponsService,
  fetchWeaponsOfType as fetchWeaponsOfTypeService,
} from '@/services/dataService';
import type { Weapon } from '@/types';

interface WeaponsState {
  // State
  weapons: Weapon[];
  weaponMap: Record<string, number>;
  weaponTypeMap: Record<string, number[]>;
  loading: boolean;
  error: Error | null;

  // Actions
  setWeapons: (weapons: Weapon[]) => void;
  addWeapons: (weapons: Weapon[]) => void;
  fetchWeapons: () => Promise<void>;
  fetchWeaponsOfType: (type: string) => Promise<void>;
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

// Helper function to create weapon name->index map
const createWeaponMap = (weapons: Weapon[]): Record<string, number> => {
  return weapons.reduce(
    (acc, weapon, index) => {
      acc[weapon.name] = index;
      return acc;
    },
    {} as Record<string, number>
  );
};

// Helper function to create weapon type->indices map
const createWeaponTypeMap = (weapons: Weapon[]): Record<string, number[]> => {
  const weaponTypeMap: Record<string, number[]> = {};
  weapons.forEach((weapon, index) => {
    weaponTypeMap[weapon.type] = weaponTypeMap[weapon.type] || [];
    weaponTypeMap[weapon.type].push(index);
  });
  return weaponTypeMap;
};

export const useWeaponsStore = create<WeaponsState>()(
  devtools(
    (set, get) => ({
      ...initialState,

      setWeapons: (weapons) => {
        console.log(weapons);
        set(
          {
            weapons,
            weaponMap: createWeaponMap(weapons),
            weaponTypeMap: createWeaponTypeMap(weapons),
            loading: false,
            error: null,
          },
          false,
          'weapons/setWeapons'
        );
      },

      addWeapons: (newWeapons) => {
        const { weapons } = get();
        const existingWeaponNames = new Set(weapons.map((w) => w.name));
        const uniqueWeapons = newWeapons.filter(
          (weapon) => !existingWeaponNames.has(weapon.name)
        );

        if (uniqueWeapons.length > 0) {
          const updatedWeapons = [...weapons, ...uniqueWeapons];
          set(
            {
              weapons: updatedWeapons,
              weaponMap: createWeaponMap(updatedWeapons),
              weaponTypeMap: createWeaponTypeMap(updatedWeapons),
            },
            false,
            'weapons/addWeapons'
          );
        }
      },

      fetchWeapons: async () => {
        set(
          { loading: true, error: null },
          false,
          'weapons/fetchWeapons/pending'
        );

        try {
          const data = await fetchWeaponsService();
          console.log(data);
          const weapons =
            data?.map((rec: { weapons: Weapon[] }) => rec.weapons).flat() || [];

          get().setWeapons(weapons);
        } catch (err) {
          const error =
            err instanceof Error ? err : new Error('Failed to fetch weapons');
          set(
            { loading: false, error },
            false,
            'weapons/fetchWeapons/rejected'
          );
        }
      },

      fetchWeaponsOfType: async (type: string) => {
        set({ loading: true }, false, 'weapons/fetchWeaponsOfType/pending');

        try {
          const typeWeapons = await fetchWeaponsOfTypeService(type);
          get().addWeapons(typeWeapons);
          set(
            { loading: false },
            false,
            'weapons/fetchWeaponsOfType/fulfilled'
          );
        } catch (err) {
          const error =
            err instanceof Error
              ? err
              : new Error('Failed to fetch weapons of type');
          set(
            { loading: false, error },
            false,
            'weapons/fetchWeaponsOfType/rejected'
          );
        }
      },

      setLoading: (loading) => set({ loading }, false, 'weapons/setLoading'),
      setError: (error) => set({ error }, false, 'weapons/setError'),
      reset: () => set(initialState, false, 'weapons/reset'),
    }),
    { name: 'WeaponsStore' }
  )
);

// Selector hooks for optimized subscriptions
export const useWeapons = () => useWeaponsStore((state) => state.weapons);
export const useWeaponMap = () => useWeaponsStore((state) => state.weaponMap);
export const useWeaponTypeMap = () =>
  useWeaponsStore((state) => state.weaponTypeMap);
export const useWeaponsLoading = () =>
  useWeaponsStore((state) => state.loading);
export const useWeaponsError = () => useWeaponsStore((state) => state.error);
