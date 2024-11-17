import { useAppSelector, useAppDispatch } from "../hooks";
import { useCallback } from "react";
import { setWeapons, setLoading, setError } from "../slices/weapons";
import { GET_WEAPONS } from "@/graphql/queries";
import { ApolloError, useLazyQuery } from "@apollo/client";
import { Weapon } from "@/graphql/types";

interface WeaponsHook {
  weapons: Weapon[];
  weaponMap: Record<string, Weapon>;
  loading: boolean;
  error: ApolloError | undefined;
  fetchWeapons: () => Promise<void>;
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
  const { weapons, weaponMap } = useAppSelector((state) => state.weapons);
  const dispatch = useAppDispatch();

  const fetchWeapons = useCallback(async () => {
    dispatch(setLoading(true));
    const { data, error } = await getWeapons();
    if (error) dispatch(setError(error));
    else dispatch(setWeapons(data?.weapons || []));
  }, [dispatch, getWeapons]);

  return { weapons, weaponMap, loading, error, fetchWeapons };
};
