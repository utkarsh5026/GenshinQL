import { useCallback } from "react";
import { useLazyQuery } from "@apollo/client";
import { useAppDispatch, useAppSelector } from "../hooks";
import { RootState } from "../store";
import { GET_CHARACTERS } from "@/graphql/queries";
import { setCharacters } from "../slices/characters";

/**
 * Custom hook to fetch and manage character data.
 *
 * @returns {Object} An object containing characters, loading state, error state, and fetchCharacters function.
 * @property {Character[]} characters - The list of characters.
 * @property {boolean} loading - The loading state of the query.
 * @property {ApolloError | undefined} error - The error state of the query.
 * @property {Function} fetchCharacters - Function to fetch characters from the server.
 */
export const useCharacters = () => {
  const [load, { loading, error }] = useLazyQuery(GET_CHARACTERS);
  const dispatch = useAppDispatch();
  const characters = useAppSelector(
    (state: RootState) => state.characters.characters
  );

  const fetchCharacters = useCallback(async () => {
    const { data } = await load();
    dispatch(setCharacters(data?.characters || []));
  }, [load, dispatch]);

  return { characters, loading, error, fetchCharacters };
};
