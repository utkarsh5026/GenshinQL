import { create } from 'zustand';
import { useShallow } from 'zustand/react/shallow';

import { loadDataForFile } from '@/services/dataService';
import type { PrimitiveItem, Primitives } from '@/types';

interface PrimitivesState {
  primitives: Primitives | null;
  loading: boolean;
  error: string | null;

  setPrimitives: (primitives: Primitives) => void;
  fetchPrimitives: () => Promise<void>;
  loadPrimitives: () => Promise<Primitives>;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
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

      const data = await loadDataForFile<Primitives>('primitives.json', null);
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

export const usePrimitives = () =>
  usePrimitivesStore((state) => state.primitives);

export const useElements = () =>
  usePrimitivesStore((state) => state.primitives?.elements || EMPTY_ELEMENTS);

export const useRegions = () =>
  usePrimitivesStore((state) => state.primitives?.regions || EMPTY_REGIONS);

export const useWeaponTypes = () =>
  usePrimitivesStore(
    (state) => state.primitives?.weaponTypes || EMPTY_WEAPON_TYPES
  );

export const usePrimitivesLoading = () =>
  usePrimitivesStore((state) => state.loading);

export const usePrimitivesError = () =>
  usePrimitivesStore((state) => state.error);

const EMPTY_ELEMENTS: Primitives['elements'] = [];
const EMPTY_REGIONS: Primitives['regions'] = [];
const EMPTY_WEAPON_TYPES: Primitives['weaponTypes'] = [];

const EMPTY_ITEMS: readonly PrimitiveItem[] = [];
const EMPTY_URL_MAP: Record<string, string> = {};

export function usePrimitivesMap(mapOf: keyof Primitives) {
  return usePrimitivesStore(
    useShallow(({ primitives }) => {
      const items = primitives?.[mapOf] || EMPTY_ITEMS;

      if (!items || items.length === 0) {
        return {
          items: EMPTY_ITEMS,
          itemUrlMap: EMPTY_URL_MAP,
        };
      }

      const itemUrlMap: Record<string, string> = {};
      items.forEach((item) => {
        if (item.name && item.url) {
          itemUrlMap[item.name] = item.url;
        }
      });

      return {
        items,
        itemUrlMap,
      };
    })
  );
}
