import { useAppSelector, useAppDispatch } from "../hooks";
import { useCallback } from "react";
import {
  setWeapons,
  setLoading,
  setError,
  addWeapons,
} from "../slices/weapons";
import { GET_WEAPONS, GET_WEAPONS_OF_TYPE } from "@/graphql/queries";
import { ApolloError, useLazyQuery } from "@apollo/client";
import { Weapon } from "@/graphql/types";

interface WeaponsHook {
  weapons: Weapon[];
  weaponMap: Record<string, number>;
  weaponTypeMap: Record<string, number[]>;
  loading: boolean;
  error: ApolloError | undefined;
  fetchWeapons: () => Promise<void>;
  fetchWeaponsOfType: (type: string) => Promise<void>;
}

/**
 * Custom hook for managing weapon data in the Redux store.
 * Provides functionality to fetch weapons from the GraphQL API and access weapon state.
 *
 * @returns {WeaponsHook} Object containing:
 *   - weapons: Array of all weapons
 *   - weaponMap: Map of weapon names to weapon objects for quick lookup
 *   - loading: Boolean indicating if weapons are being fetched
 *   - error: Any error that occurred during fetch
 *   - fetchWeapons: Function to trigger weapon data fetch
 */
export const useWeapons = (): WeaponsHook => {
  const [getWeapons, { loading, error }] = useLazyQuery(GET_WEAPONS);
  const [getWeaponsOfType] = useLazyQuery(GET_WEAPONS_OF_TYPE);
  const { weapons, weaponMap, weaponTypeMap } = useAppSelector(
    (state) => state.weapons
  );
  const dispatch = useAppDispatch();

  const fetchWeapons = useCallback(async () => {
    dispatch(setLoading(true));
    const { data, error } = await getWeapons();
    console.log(data);
    if (error) dispatch(setError(error));
    else if (data)
      dispatch(
        setWeapons(
          data?.weapons
            .map((rec: { weapons: Weapon[] }) => rec.weapons)
            .flat() || []
        )
      );
  }, [dispatch, getWeapons]);

  const fetchWeaponsOfType = useCallback(
    async (type: string) => {
      dispatch(setLoading(true));
      try {
        const { data, error } = await getWeaponsOfType({ variables: { type } });
        if (error) {
          dispatch(setError(error));
          return;
        }

        const typeWeapons = data?.weaponsOfType ?? [];
        dispatch(addWeapons(typeWeapons));
      } finally {
        dispatch(setLoading(false));
      }
    },
    [dispatch, getWeaponsOfType]
  );

  return {
    weapons,
    weaponMap,
    weaponTypeMap,
    loading,
    error,
    fetchWeapons,
    fetchWeaponsOfType,
  };
};
