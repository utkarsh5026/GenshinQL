import { createSlice } from "@reduxjs/toolkit";
import type { ImageUrl, WeaponMaterialSchedule } from "@/graphql/types";
import { ApolloError } from "@apollo/client";

export type WeaponMaterial = {
  day: string;
  materialImages: ImageUrl[];
};

interface WeaponMaterialState {
  weaponMaterialSchedule: WeaponMaterialSchedule[] | null;
  loading: boolean;
  error: ApolloError | undefined;
  weaponMap: Record<string, WeaponMaterial>;
}

/**
 * Creates a mapping of weapon names to their material farming details.
 *
 * Takes an array of weapon material schedules and transforms it into a map where:
 * - Keys are weapon names
 * - Values contain the day the materials can be farmed and the material images
 *
 * This allows for quick lookups of when specific weapons' materials are available.
 *
 * @param {WeaponMaterialSchedule[]} schedules - Array of weapon material schedules containing farming days and materials
 * @returns {Record<string, WeaponMaterial>} Map of weapon names to their material farming details
 */
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

const initialState: WeaponMaterialState = {
  weaponMaterialSchedule: null,
  loading: false,
  error: undefined,
  weaponMap: {},
};

const weaponMaterialSlice = createSlice({
  name: "weaponMaterial",
  initialState,
  reducers: {
    setWeaponMaterialSchedule: (state, action) => {
      state.weaponMaterialSchedule = action.payload;
      state.weaponMap = createWeaponMap(action.payload);
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
  },
});

export const { setWeaponMaterialSchedule, setLoading, setError } =
  weaponMaterialSlice.actions;
export default weaponMaterialSlice.reducer;
