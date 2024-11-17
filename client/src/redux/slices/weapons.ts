import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { Weapon } from "@/graphql/types";

interface WeaponsState {
  weapons: Weapon[];
  weaponMap: Record<string, Weapon>;
  loading: boolean;
  error: Error | null;
}

const createWeaponMap = (weapons: Weapon[]): Record<string, Weapon> => {
  return weapons.reduce(
    (acc, weapon) => {
      acc[weapon.name] = weapon;
      return acc;
    },
    {} as Record<string, Weapon>
  );
};

const initialState: WeaponsState = {
  weapons: [],
  weaponMap: {},
  loading: false,
  error: null,
};

export const weaponsSlice = createSlice({
  name: "weapons",
  initialState,
  reducers: {
    setWeapons: (state, action: PayloadAction<Weapon[]>) => {
      state.weapons = action.payload;
      state.weaponMap = createWeaponMap(action.payload);
      state.loading = false;
      state.error = null;
    },

    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },

    setError: (state, action: PayloadAction<Error | null>) => {
      state.error = action.payload;
    },
  },
});

export const { setWeapons, setLoading, setError } = weaponsSlice.actions;

export default weaponsSlice.reducer;
