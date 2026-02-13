import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

import type { AbilityReference } from '@/lib/abilityMatcher';
import { extractAbilityNames } from '@/lib/abilityMatcher';
import { decideColor } from '@/utils/color';

import type { Talent } from '../types';

export type CharacterAbilityData = {
  abilityMap: Map<string, AbilityReference>;
  elementColor: string;
};

interface CharacterAbilitiesState {
  cache: Map<string, CharacterAbilityData>;

  setCharacterAbilities: (
    name: string,
    talents: Talent[],
    element: string
  ) => void;
  getAbilityData: (name: string) => CharacterAbilityData | undefined;
  clearCache: () => void;
  removeCharacter: (name: string) => void;
}

const initialState = {
  cache: new Map<string, CharacterAbilityData>(),
};

// Hoisted empty constants (CRITICAL for Zustand selector stability)
const EMPTY_ABILITY_MAP = new Map<string, AbilityReference>();
const EMPTY_ABILITY_DATA: CharacterAbilityData = {
  abilityMap: EMPTY_ABILITY_MAP,
  elementColor: '#000',
};

export const useCharacterAbilitiesStore = create<CharacterAbilitiesState>()(
  devtools(
    (set, get) => ({
      ...initialState,

      setCharacterAbilities: (name, talents, element) => {
        const abilityMap = extractAbilityNames(talents);
        const elementColor = decideColor(element);

        set(
          (state) => {
            const newCache = new Map(state.cache);
            newCache.set(name, { abilityMap, elementColor });
            return { cache: newCache };
          },
          false,
          'characters/abilities/set'
        );
      },

      getAbilityData: (name) => {
        const { cache } = get();
        return cache.get(name);
      },

      clearCache: () => {
        set({ cache: new Map() }, false, 'characters/abilities/clear');
      },

      removeCharacter: (name) => {
        set(
          (state) => {
            const newCache = new Map(state.cache);
            newCache.delete(name);
            return { cache: newCache };
          },
          false,
          'characters/abilities/remove'
        );
      },
    }),
    { name: 'CharacterAbilitiesStore' }
  )
);

// Selector hooks with stable empty constants
export const useCharacterAbilityData = (characterName: string) =>
  useCharacterAbilitiesStore(
    (state) => state.cache.get(characterName) || EMPTY_ABILITY_DATA
  );

export const useAbilityMap = (characterName: string) =>
  useCharacterAbilitiesStore(
    (state) => state.cache.get(characterName)?.abilityMap || EMPTY_ABILITY_MAP
  );

export const useElementColor = (characterName: string) =>
  useCharacterAbilitiesStore(
    (state) => state.cache.get(characterName)?.elementColor || '#000'
  );

// Action selectors
export const useSetCharacterAbilities = () =>
  useCharacterAbilitiesStore((state) => state.setCharacterAbilities);

export const useClearAbilitiesCache = () =>
  useCharacterAbilitiesStore((state) => state.clearCache);
