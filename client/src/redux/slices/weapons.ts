import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { Weapon } from "@/graphql/types";

interface WeaponsState {
  weapons: Weapon[];
  weaponMap: Record<string, number>;
  weaponTypeMap: Record<string, number[]>;
  loading: boolean;
  error: Error | null;
}

const createWeaponMap = (weapons: Weapon[]): Record<string, number> => {
  return weapons.reduce(
    (acc, weapon, index) => {
      acc[weapon.name] = index;
      return acc;
    },
    {} as Record<string, number>
  );
};

const createWeaponTypeMap = (weapons: Weapon[]): Record<string, number[]> => {
  const weaponTypeMap: Record<string, number[]> = {};
  weapons.forEach((weapon, index) => {
    weaponTypeMap[weapon.type] = weaponTypeMap[weapon.type] || [];
    weaponTypeMap[weapon.type].push(index);
  });
  return weaponTypeMap;
};

const initialState: WeaponsState = {
  weapons: [],
  weaponMap: {},
  loading: false,
  error: null,
  weaponTypeMap: {},
};

export const weaponsSlice = createSlice({
  name: "weapons",
  initialState,
  reducers: {
    setWeapons: (state, action: PayloadAction<Weapon[]>) => {
      console.log(action.payload);
      state.weapons = action.payload;
      state.weaponMap = createWeaponMap(action.payload);
      state.weaponTypeMap = createWeaponTypeMap(action.payload);
      state.loading = false;
      state.error = null;
    },

    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },

    setError: (state, action: PayloadAction<Error | null>) => {
      state.error = action.payload;
    },

    addWeapons: (state, action: PayloadAction<Weapon[]>) => {
      const existingWeaponNames = new Set(state.weapons.map((w) => w.name));

      const uniqueWeapons = action.payload.filter(
        (weapon) => !existingWeaponNames.has(weapon.name)
      );

      if (uniqueWeapons.length > 0) {
        state.weapons = [...state.weapons, ...uniqueWeapons];
        state.weaponMap = createWeaponMap(state.weapons);
      }
    },
  },
});

export const { setWeapons, setLoading, setError, addWeapons } =
  weaponsSlice.actions;

export default weaponsSlice.reducer;
