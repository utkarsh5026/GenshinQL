import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

import { fetchWithCache } from '@/features/cache';
import type { ImaginariumData, SpiralAbyssData } from '@/types';

interface GameContentState {
  spiralAbyss: SpiralAbyssData | null;
  imaginarium: ImaginariumData | null;
  loading: boolean;
  error: Error | null;

  fetchSpiralAbyss: () => Promise<void>;
  fetchImaginarium: () => Promise<void>;
  fetchAll: () => Promise<void>;
  reset: () => void;
}

const initialState = {
  spiralAbyss: null as SpiralAbyssData | null,
  imaginarium: null as ImaginariumData | null,
  loading: false,
  error: null as Error | null,
};

export const useGameContentStore = create<GameContentState>()(
  devtools(
    (set, get) => ({
      ...initialState,

      fetchSpiralAbyss: async () => {
        const { spiralAbyss } = get();
        if (spiralAbyss) return;

        set({ loading: true, error: null });

        try {
          const { data } = await fetchWithCache<SpiralAbyssData>(
            'gameContent/spiralAbyss.json'
          );
          set({ spiralAbyss: data, loading: false });
        } catch (err) {
          set({
            loading: false,
            error:
              err instanceof Error
                ? err
                : new Error('Failed to fetch Spiral Abyss data'),
          });
        }
      },

      fetchImaginarium: async () => {
        const { imaginarium } = get();
        if (imaginarium) return;

        set({ loading: true, error: null });

        try {
          const { data } = await fetchWithCache<ImaginariumData>(
            'gameContent/imaginarium.json'
          );
          set({ imaginarium: data, loading: false });
        } catch (err) {
          set({
            loading: false,
            error:
              err instanceof Error
                ? err
                : new Error('Failed to fetch Imaginarium data'),
          });
        }
      },

      fetchAll: async () => {
        set({ loading: true, error: null });
        const { fetchSpiralAbyss, fetchImaginarium } = get();

        try {
          await Promise.all([
            fetchSpiralAbyss().catch(() => null),
            fetchImaginarium().catch(() => null),
          ]);
        } catch (err) {
          set({
            loading: false,
            error:
              err instanceof Error
                ? err
                : new Error('Failed to fetch game content'),
          });
        }
      },

      reset: () => set(initialState),
    }),
    { name: 'GameContentStore' }
  )
);

export const useSpiralAbyss = () =>
  useGameContentStore((state) => state.spiralAbyss);
export const useImaginarium = () =>
  useGameContentStore((state) => state.imaginarium);
export const useGameContentLoading = () =>
  useGameContentStore((state) => state.loading);
export const useGameContentError = () =>
  useGameContentStore((state) => state.error);
