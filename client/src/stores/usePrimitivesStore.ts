import { create } from 'zustand';

import { fetchWithCache } from '@/features/cache';
import type { Primitives } from '@/types';

/**
 * State interface for the primitives store.
 * Manages loading and storage of game primitives (elements, regions, weapon types).
 */
interface PrimitivesState {
  /** The cached primitives data */
  primitives: Primitives | null;

  /** Loading state indicator */
  loading: boolean;

  /** Error message if fetch fails */
  error: string | null;

  /** Sets the primitives data and processes region names */
  setPrimitives: (primitives: Primitives) => void;

  /** Fetches primitives from cache if not already loaded */
  fetchPrimitives: () => Promise<void>;

  /** Loads primitives, fetching if necessary, and returns the data */
  loadPrimitives: () => Promise<Primitives>;

  /** Sets the loading state */
  setLoading: (loading: boolean) => void;

  /** Sets the error state */
  setError: (error: string | null) => void;

  /** Resets the store to initial state */
  reset: () => void;
}

const initialState = {
  primitives: null,
  loading: false,
  error: null,
};

export const usePrimitivesStore = create<PrimitivesState>()((set, get) => ({
  ...initialState,

  setPrimitives: (primitives) => {
    set({
      primitives: {
        ...primitives,
        regions: primitives.regions.map((reg) => {
          return {
            ...reg,
            name: reg.name.split('-').join(''),
          };
        }),
      },
      loading: false,
    });
  },

  fetchPrimitives: async () => {
    set({ loading: true, error: null });

    try {
      const { primitives, setPrimitives } = get();
      if (primitives !== null) return;

      const { data } = await fetchWithCache<Primitives>('primitives.json');
      setPrimitives(data);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to fetch primitives';
      set({ loading: false, error: errorMessage });
    }
  },

  loadPrimitives: async () => {
    const { primitives, fetchPrimitives } = get();
    if (primitives) {
      return primitives;
    }

    await fetchPrimitives();

    const newPrimitives = get().primitives;
    if (!newPrimitives) {
      throw new Error('Failed to load primitives');
    }
    return newPrimitives;
  },

  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  reset: () => set(initialState),
}));

/**
 * Hook to get the primitives data.
 * @returns The primitives object or null if not loaded
 */
export const usePrimitives = () =>
  usePrimitivesStore(({ primitives }) => primitives);

/**
 * Hook to get the elements array from primitives.
 * @returns Array of element primitives or empty array if not loaded
 */
export const useElements = () =>
  usePrimitivesStore(
    ({ primitives }) => primitives?.elements || EMPTY_ELEMENTS
  );

/**
 * Hook to get the regions array from primitives.
 * @returns Array of region primitives or empty array if not loaded
 */
export const useRegions = () =>
  usePrimitivesStore(({ primitives }) => primitives?.regions || EMPTY_REGIONS);

/**
 * Hook to get the weapon types array from primitives.
 * @returns Array of weapon type primitives or empty array if not loaded
 */
export const useWeaponTypes = () =>
  usePrimitivesStore(
    ({ primitives }) => primitives?.weaponTypes || EMPTY_WEAPON_TYPES
  );

const EMPTY_ELEMENTS: Primitives['elements'] = [] as const;
const EMPTY_REGIONS: Primitives['regions'] = [] as const;
const EMPTY_WEAPON_TYPES: Primitives['weaponTypes'] = [] as const;
