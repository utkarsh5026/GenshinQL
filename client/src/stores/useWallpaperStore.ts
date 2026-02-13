import { useEffect } from 'react';
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

import { fetchWithCache } from '@/features/cache';

type WallpaperManifest = Record<string, string[]>;

interface WallpaperState {
  manifest: WallpaperManifest | null;
  shuffledPool: string[];
  nextIndex: number;
  assignments: Record<string, string>;
  loading: boolean;
  error: string | null;

  fetchManifest: () => Promise<void>;
  claimWallpaper: (consumerKey: string) => string | undefined;
  releaseWallpaper: (consumerKey: string) => void;
}

function shuffle<T>(arr: readonly T[]): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

const initialState = {
  manifest: null as WallpaperManifest | null,
  shuffledPool: [] as string[],
  nextIndex: 0,
  assignments: {} as Record<string, string>,
  loading: false,
  error: null as string | null,
};

export const useWallpaperStore = create<WallpaperState>()(
  devtools(
    (set, get) => ({
      ...initialState,

      fetchManifest: async () => {
        const { manifest } = get();
        if (manifest) return;

        set({ loading: true, error: null }, false, 'wallpaper/fetch/pending');

        try {
          const { data } = await fetchWithCache<WallpaperManifest>(
            'images/wallpapers/manifest.json'
          );

          const allUrls = Object.values(data)
            .flat()
            .map((url) => `/${url}`);
          const shuffled = shuffle(allUrls);

          set(
            {
              manifest: data,
              shuffledPool: shuffled,
              nextIndex: 0,
              loading: false,
            },
            false,
            'wallpaper/fetch/fulfilled'
          );
        } catch (err) {
          const errorMessage =
            err instanceof Error
              ? err.message
              : 'Failed to fetch wallpaper manifest';
          set(
            { loading: false, error: errorMessage },
            false,
            'wallpaper/fetch/rejected'
          );
        }
      },

      claimWallpaper: (consumerKey: string) => {
        const state = get();

        if (state.assignments[consumerKey]) {
          return state.assignments[consumerKey];
        }

        if (state.shuffledPool.length === 0) {
          return undefined;
        }

        let { nextIndex, shuffledPool } = state;

        if (nextIndex >= shuffledPool.length) {
          shuffledPool = shuffle(shuffledPool);
          nextIndex = 0;
        }

        const url = shuffledPool[nextIndex];

        set(
          {
            shuffledPool,
            nextIndex: nextIndex + 1,
            assignments: {
              ...state.assignments,
              [consumerKey]: url,
            },
          },
          false,
          `wallpaper/claim/${consumerKey}`
        );

        return url;
      },

      releaseWallpaper: (consumerKey: string) => {
        const { assignments } = get();
        if (!(consumerKey in assignments)) return;

        const remaining = { ...assignments };
        delete remaining[consumerKey];
        set(
          { assignments: remaining },
          false,
          `wallpaper/release/${consumerKey}`
        );
      },
    }),
    { name: 'WallpaperStore' }
  )
);

export function useWallpaper(consumerKey: string): string | undefined {
  const poolReady = useWallpaperStore((s) => s.shuffledPool.length > 0);

  useEffect(() => {
    useWallpaperStore.getState().fetchManifest();
  }, []);

  useEffect(() => {
    if (poolReady) {
      useWallpaperStore.getState().claimWallpaper(consumerKey);
    }
  }, [consumerKey, poolReady]);

  useEffect(() => {
    return () => {
      useWallpaperStore.getState().releaseWallpaper(consumerKey);
    };
  }, [consumerKey]);

  return useWallpaperStore((s) => s.assignments[consumerKey]);
}
