import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

import { usePrimitivesStore } from '@/stores/usePrimitivesStore';

import { fetchCharacterProfile } from '../services';
import type { CharacterDetailed } from '../types';

interface CharacterProfileState {
  profiles: Map<string, CharacterDetailed>;
  loadingStates: Map<string, boolean>;
  errorStates: Map<string, Error | null>;

  setProfile: (name: string, profile: CharacterDetailed) => void;
  setLoading: (name: string, loading: boolean) => void;
  setError: (name: string, error: Error | null) => void;
  fetchProfile: (name: string) => Promise<CharacterDetailed | null>;
  clearCache: () => void;
  removeProfile: (name: string) => void;
}

const initialState = {
  profiles: new Map<string, CharacterDetailed>(),
  loadingStates: new Map<string, boolean>(),
  errorStates: new Map<string, Error | null>(),
};

export const useCharacterProfileStore = create<CharacterProfileState>()(
  devtools(
    (set, get) => ({
      ...initialState,

      setProfile: (name, profile) => {
        set((state) => {
          const newProfiles = new Map(state.profiles);
          newProfiles.set(name, profile);
          return { profiles: newProfiles };
        });
      },

      setLoading: (name, loading) => {
        set((state) => {
          const newLoadingStates = new Map(state.loadingStates);
          newLoadingStates.set(name, loading);
          return { loadingStates: newLoadingStates };
        });
      },

      setError: (name, error) => {
        set((state) => {
          const newErrorStates = new Map(state.errorStates);
          newErrorStates.set(name, error);
          return { errorStates: newErrorStates };
        });
      },

      fetchProfile: async (name: string) => {
        const { profiles, setProfile, setLoading, setError } = get();

        const cached = profiles.get(name);
        if (cached) return cached;

        setLoading(name, true);
        setError(name, null);

        try {
          const primitives = await usePrimitivesStore
            .getState()
            .loadPrimitives();

          const profile = await fetchCharacterProfile(name, primitives);

          if (!profile) {
            throw new Error(`Character profile not found for: ${name}`);
          }

          setProfile(name, profile);
          setLoading(name, false);
          return profile;
        } catch (error) {
          const err =
            error instanceof Error
              ? error
              : new Error('Failed to fetch character');
          setError(name, err);
          setLoading(name, false);
          return null;
        }
      },

      clearCache: () => {
        set({
          profiles: new Map(),
          loadingStates: new Map(),
          errorStates: new Map(),
        });
      },
    }),
    { name: 'CharacterProfileStore' }
  )
);

export const useCharacterProfile = (characterName: string) =>
  useCharacterProfileStore(
    (state) => state.profiles.get(characterName) || null
  );

export const useCharacterProfileLoading = (characterName: string) =>
  useCharacterProfileStore(
    (state) => state.loadingStates.get(characterName) || false
  );

export const useCharacterProfileError = (characterName: string) =>
  useCharacterProfileStore(
    (state) => state.errorStates.get(characterName) || null
  );

export const useFetchCharacterProfile = () =>
  useCharacterProfileStore((state) => state.fetchProfile);

export const useClearProfileCache = () =>
  useCharacterProfileStore((state) => state.clearCache);

export const useRemoveProfile = () =>
  useCharacterProfileStore((state) => state.removeProfile);
