import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

import { fetchWithCache } from '@/features/cache';
import { useWeaponsStore } from '@/features/weapons/stores/useWeaponsStore';
import { WeaponMaterial, WeaponSummary } from '@/features/weapons/types';
import type { ImageUrl } from '@/types';

export type WeaponMaterialSchedule = {
  nation: string;
  materials: Array<{
    dayOne: string;
    dayTwo: string;
    materialImages: ImageUrl[];
    weapons: Array<WeaponSummary>;
  }>;
};

interface WeaponMaterialState {
  weaponCalendarData: Record<
    string,
    Array<{
      dayOne: string;
      dayTwo: string;
      images: ImageUrl[];
      weapons: Array<{ name: string; url: string }>;
    }>
  > | null;
  weaponMap: Record<string, WeaponMaterial>; // Basic map: weaponName → material info
  weaponMaterialSchedule: WeaponMaterialSchedule[]; // Transformed schedule by nation
  loading: boolean;
  error: string | null;

  setWeaponCalendarData: (
    data: Record<
      string,
      Array<{
        dayOne: string;
        dayTwo: string;
        images: ImageUrl[];
        weapons: Array<{ name: string; url: string }>;
      }>
    >
  ) => void;
  fetchWeaponMaterials: () => Promise<void>;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

const initialState = {
  weaponCalendarData: null,
  weaponMap: {},
  weaponMaterialSchedule: [],
  loading: false,
  error: null,
};

const createWeaponMap = (
  calendarData: Record<
    string,
    Array<{
      dayOne: string;
      dayTwo: string;
      images: ImageUrl[];
      weapons: Array<{ name: string; url: string }>;
    }>
  >
): Record<string, WeaponMaterial> => {
  const weaponMap: Record<string, WeaponMaterial> = {};

  Object.values(calendarData).forEach((schedules) => {
    schedules.forEach((schedule) => {
      schedule.weapons.forEach((weapon) => {
        weaponMap[weapon.name] = {
          dayOne: schedule.dayOne,
          dayTwo: schedule.dayTwo,
          materialImages: schedule.images,
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

      setWeaponCalendarData: (data) => {
        const weaponMap = createWeaponMap(data);
        const weaponsStoreMap = useWeaponsStore.getState().weaponMap;

        const weaponMaterialSchedule: WeaponMaterialSchedule[] = Object.entries(
          data
        ).map(([nation, schedule]) => ({
          nation,
          materials: schedule.map((item) => ({
            dayOne: item.dayOne,
            dayTwo: item.dayTwo,
            materialImages: item.images,
            weapons: item.weapons
              .map((weapon) => weaponsStoreMap[weapon.name])
              .filter(
                (weapon): weapon is WeaponSummary => weapon !== undefined
              ),
          })),
        }));

        set({
          weaponCalendarData: data,
          weaponMap,
          weaponMaterialSchedule,
          loading: false,
        });
      },

      fetchWeaponMaterials: async () => {
        set({ loading: true, error: null });

        try {
          const weaponsState = useWeaponsStore.getState();
          if (weaponsState.loading) {
            await new Promise<void>((resolve) => {
              const unsubscribe = useWeaponsStore.subscribe((state) => {
                if (!state.loading) {
                  unsubscribe();
                  resolve();
                }
              });
            });
          } else if (weaponsState.weapons.length === 0 && !weaponsState.error) {
            await useWeaponsStore.getState().fetchWeapons();
          }

          const calendarData = await fetchWithCache<
            Record<
              string,
              Array<{
                dayOne: string;
                dayTwo: string;
                images: ImageUrl[];
                weapons: Array<{ name: string; url: string }>;
              }>
            >
          >(`weaponCalendar.json`);
          get().setWeaponCalendarData(calendarData.data);
        } catch (err) {
          const errorMessage =
            err instanceof Error
              ? err.message
              : 'Failed to fetch weapon materials';
          set({ loading: false, error: errorMessage });
        }
      },

      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),
      reset: () => set(initialState),
    }),
    { name: 'WeaponMaterialStore' }
  )
);

export const useWeaponMaterialLoading = () =>
  useWeaponMaterialStore((state) => state.loading);

export const useWeaponMaterialError = () =>
  useWeaponMaterialStore((state) => state.error);

export const useWeaponMaterialSchedule = () =>
  useWeaponMaterialStore((state) => state.weaponMaterialSchedule);

export const useWeaponMapFromMaterials = () =>
  useWeaponMaterialStore((state) => state.weaponMap);
