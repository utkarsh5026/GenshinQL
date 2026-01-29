import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { fetchCharacters as fetchCharactersService } from '@/services/dataService';
import type { Character } from '@/types';

interface CharactersState {
  characters: Character[];
  characterMap: Record<string, Character>;
  loading: boolean;
  error: Error | null;

  setCharacters: (characters: Character[]) => void;
  fetchCharacters: (checkCache?: boolean) => Promise<void>;
  reset: () => void;
}

const initialState = {
  characters: [],
  characterMap: {},
  loading: false,
  error: null,
};

const createCharacterMap = (
  characters: Character[]
): Record<string, Character> => {
  return characters.reduce(
    (acc, char) => {
      acc[char.name] = char;
      return acc;
    },
    {} as Record<string, Character>
  );
};

export const useCharactersStore = create<CharactersState>()(
  devtools(
    (set, get) => ({
      ...initialState,

      setCharacters: (characters) =>
        set(
          {
            characters,
            characterMap: createCharacterMap(characters),
            loading: false,
            error: null,
          },
          false,
          'characters/setCharacters'
        ),

      fetchCharacters: async (checkCache = true) => {
        const { characters } = get();
        if (checkCache && characters.length > 0) return;

        set(
          { loading: true, error: null },
          false,
          'characters/fetchCharacters/pending'
        );

        try {
          const data = await fetchCharactersService();
          set(
            {
              characters: data || [],
              characterMap: createCharacterMap(data || []),
              loading: false,
              error: null,
            },
            false,
            'characters/fetchCharacters/fulfilled'
          );
        } catch (err) {
          console.error('Error fetching characters:', err);
          const error =
            err instanceof Error
              ? err
              : new Error('Failed to fetch characters');
          set(
            { loading: false, error },
            false,
            'characters/fetchCharacters/rejected'
          );
        }
      },

      reset: () => set(initialState, false, 'characters/reset'),
    }),
    { name: 'CharactersStore' }
  )
);

export const useCharacters = () =>
  useCharactersStore((state) => state.characters);
export const useCharacterMap = () =>
  useCharactersStore((state) => state.characterMap);
export const useCharactersLoading = () =>
  useCharactersStore((state) => state.loading);
export const useCharactersError = () =>
  useCharactersStore((state) => state.error);
