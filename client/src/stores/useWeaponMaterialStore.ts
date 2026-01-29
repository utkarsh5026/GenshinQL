import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { fetchWeaponMaterialSchedule as fetchWeaponMaterialScheduleService } from '@/services/dataService';
import type { ImageUrl, WeaponMaterialSchedule } from '@/types';

export type WeaponMaterial = {
  day: string;
  materialImages: ImageUrl[];
};

interface WeaponMaterialState {
  // State
  weaponMaterialSchedule: WeaponMaterialSchedule[] | null;
  weaponMap: Record<string, WeaponMaterial>;
  loading: boolean;
  error: string | null;

  // Actions
  setWeaponMaterialSchedule: (schedule: WeaponMaterialSchedule[]) => void;
  fetchWeaponMaterials: () => Promise<void>;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

const initialState = {
  weaponMaterialSchedule: null,
  weaponMap: {},
  loading: false,
  error: null,
};

// Helper function to create weapon->material mapping
const createWeaponMap = (
  schedules: WeaponMaterialSchedule[]
): Record<string, WeaponMaterial> => {
  const weaponMap: Record<string, WeaponMaterial> = {};

  schedules.forEach((schedule) => {
    schedule.materials.forEach((material) => {
      material.weapons.forEach((weapon) => {
        weaponMap[weapon.name] = {
          day: material.day,
          materialImages: material.materialImages,
        };
      });
    });
  });

  return weaponMap;
};

export const useWeaponMaterialStore = create<WeaponMaterialState>()(
  devtools(
    (set, get) => ({
      ...initialState,

      setWeaponMaterialSchedule: (schedule) => {
        set(
          {
            weaponMaterialSchedule: schedule,
            weaponMap: createWeaponMap(schedule),
            loading: false,
          },
          false,
          'weaponMaterial/setSchedule'
        );
      },

      fetchWeaponMaterials: async () => {
        set({ loading: true, error: null }, false, 'weaponMaterial/fetch/pending');

        try {
          const data = await fetchWeaponMaterialScheduleService();
          get().setWeaponMaterialSchedule(data);
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : 'Failed to fetch weapon materials';
          set({ loading: false, error: errorMessage }, false, 'weaponMaterial/fetch/rejected');
        }
      },

      setLoading: (loading) => set({ loading }, false, 'weaponMaterial/setLoading'),
      setError: (error) => set({ error }, false, 'weaponMaterial/setError'),
      reset: () => set(initialState, false, 'weaponMaterial/reset'),
    }),
    { name: 'WeaponMaterialStore' }
  )
);

// Selector hooks for optimized subscriptions
export const useWeaponMaterialSchedule = () =>
  useWeaponMaterialStore((state) => state.weaponMaterialSchedule);
export const useWeaponMapFromMaterials = () =>
  useWeaponMaterialStore((state) => state.weaponMap);
export const useWeaponMaterialLoading = () =>
  useWeaponMaterialStore((state) => state.loading);
export const useWeaponMaterialError = () => useWeaponMaterialStore((state) => state.error);
