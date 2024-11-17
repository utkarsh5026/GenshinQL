import { useAppDispatch, useAppSelector } from "../hooks";
import { GET_WEAPON_MATERIALS_CALENDAR } from "@/graphql/queries";
import { ApolloError, useLazyQuery } from "@apollo/client";
import { useCallback } from "react";
import {
  setError,
  setWeaponMaterialSchedule,
  WeaponMaterial,
} from "../slices/weapon-material";
import { WeaponMaterialSchedule } from "@/graphql/types";

interface WeaponMaterialHook {
  weaponMaterialSchedule: WeaponMaterialSchedule[] | null;
  loading: boolean;
  error: ApolloError | undefined;
  weaponMap: Record<string, WeaponMaterial>;
  fetchWeaponMaterials: () => Promise<void>;
}

export const useWeaponMaterials = (): WeaponMaterialHook => {
  const [getWeaponMaterials, { loading: fetchLoading }] = useLazyQuery(
    GET_WEAPON_MATERIALS_CALENDAR
  );
  const { weaponMaterialSchedule, error, weaponMap } = useAppSelector(
    (state) => state.weaponMaterial
  );

  const dispatch = useAppDispatch();
  const fetchWeaponMaterials = useCallback(async () => {
    const { data, error } = await getWeaponMaterials();
    if (error) dispatch(setError(error));
    else dispatch(setWeaponMaterialSchedule(data.weaponMaterialSchedule));
  }, [getWeaponMaterials, dispatch]);

  return {
    weaponMaterialSchedule,
    loading: fetchLoading,
    error,
    weaponMap,
    fetchWeaponMaterials,
  };
};
