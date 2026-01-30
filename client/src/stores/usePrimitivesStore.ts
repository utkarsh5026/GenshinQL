import { create } from 'zustand';

import { fetchPrimitives as fetchPrimitivesService } from '@/services/dataService';
import type { Primitives } from '@/types';

interface PrimitivesState {
  primitives: Primitives | null;
  loading: boolean;
  error: string | null;

  setPrimitives: (primitives: Primitives) => void;
  fetchPrimitives: () => Promise<void>;
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
      primitives,
      loading: false,
    });
  },

  fetchPrimitives: async () => {
    set({ loading: true, error: null });

    try {
      const data = await fetchPrimitivesService();
      get().setPrimitives(data);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to fetch primitives';
      set({ loading: false, error: errorMessage });
    }
  },

  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  reset: () => set(initialState),
}));

export const usePrimitives = () =>
  usePrimitivesStore((state) => state.primitives);

export const useElements = () =>
  usePrimitivesStore((state) => state.primitives?.elements || []);

export const useRegions = () =>
  usePrimitivesStore((state) => state.primitives?.regions || []);

export const useWeaponTypes = () =>
  usePrimitivesStore((state) => state.primitives?.weaponTypes || []);

export const usePrimitivesLoading = () =>
  usePrimitivesStore((state) => state.loading);

export const usePrimitivesError = () =>
  usePrimitivesStore((state) => state.error);
