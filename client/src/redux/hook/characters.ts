import { useCallback } from "react";
import { useLazyQuery } from "@apollo/client";
import { useAppDispatch, useAppSelector } from "../hooks";
import { RootState } from "../store";
import { GET_CHARACTERS } from "@/graphql/queries";
import { setCharacters } from "../slices/characters";
import type { Character } from "@/graphql/types";
import type { ApolloError } from "@apollo/client";

interface CharacterHook {
  characters: Character[];
  characterMap: Record<string, Character>;
  loading: boolean;
  error: ApolloError | undefined;
  fetchCharacters: () => Promise<void>;
}

/**
 * Custom hook to fetch and manage character data.
 *
 * @returns {Object} An object containing characters, loading state, error state, and fetchCharacters function.
 * @property {Character[]} characters - The list of characters.
 * @property {boolean} loading - The loading state of the query.
 * @property {ApolloError | undefined} error - The error state of the query.
 * @property {Function} fetchCharacters - Function to fetch characters from the server.
 */
export const useCharacters = (): CharacterHook => {
  const [load, { loading, error }] = useLazyQuery(GET_CHARACTERS);
  const dispatch = useAppDispatch();
  const { characters, characterMap } = useAppSelector(
    (state: RootState) => state.characters
  );

  const fetchCharacters = useCallback(
    async (checkCache = true) => {
      if (checkCache && characters.length > 0) return;
      const { data } = await load();
      dispatch(setCharacters(data?.characters || []));
    },
    [load, dispatch, characters]
  );

  return { characters, characterMap, loading, error, fetchCharacters };
};
