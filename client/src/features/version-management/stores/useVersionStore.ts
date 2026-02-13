import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

import { fetchWithCache } from '@/features/cache';

import type { VersionData, VersionMeta } from '../types';

// Stable empty defaults to prevent Zustand selector infinite loops
const EMPTY_CHARACTERS: VersionData['newCharacters'] = [];
const EMPTY_WEAPONS: VersionData['newWeapons'] = [];
const EMPTY_ARTIFACTS: VersionData['newArtifacts'] = [];
const EMPTY_EVENT_WISHES: VersionData['eventWishes'] = [];
const EMPTY_EVENTS: VersionData['newEvents'] = [];
const EMPTY_AREAS: VersionData['newAreas'] = [];
const EMPTY_GALLERY: VersionData['gallery'] = [];

interface VersionStore {
  versionData: VersionData | null;
  versionMeta: VersionMeta | null;
  loading: boolean;
  error: Error | null;

  fetchVersionData: (checkCache?: boolean) => Promise<void>;
  reset: () => void;
}

const initialState = {
  versionData: null as VersionData | null,
  versionMeta: null as VersionMeta | null,
  loading: false,
  error: null as Error | null,
};

export const useVersionStore = create<VersionStore>()(
  devtools(
    (set, get) => ({
      ...initialState,

      fetchVersionData: async (checkCache = true) => {
        const { versionData } = get();
        if (checkCache && versionData) return;

        set({ loading: true, error: null }, false, 'version/fetch/pending');

        try {
          const [dataResult, metaResult] = await Promise.all([
            fetchWithCache<VersionData>('version/latest.json'),
            fetchWithCache<VersionMeta>('version/meta.json'),
          ]);

          set(
            {
              versionData: dataResult.data,
              versionMeta: metaResult.data,
              loading: false,
              error: null,
            },
            false,
            'version/fetch/fulfilled'
          );
        } catch (err) {
          console.error('Error fetching version data:', err);
          const error =
            err instanceof Error
              ? err
              : new Error('Failed to fetch version data');
          set({ loading: false, error }, false, 'version/fetch/rejected');
        }
      },

      reset: () => set(initialState, false, 'version/reset'),
    }),
    { name: 'VersionStore' }
  )
);

// Selectors
export const useVersionData = () =>
  useVersionStore((state) => state.versionData);

export const useVersionMeta = () =>
  useVersionStore((state) => state.versionMeta);

export const useVersionLoading = () =>
  useVersionStore((state) => state.loading);

export const useVersionError = () => useVersionStore((state) => state.error);

export const useNewCharacters = () =>
  useVersionStore(
    (state) => state.versionData?.newCharacters || EMPTY_CHARACTERS
  );

export const useNewWeapons = () =>
  useVersionStore((state) => state.versionData?.newWeapons || EMPTY_WEAPONS);

export const useNewArtifacts = () =>
  useVersionStore(
    (state) => state.versionData?.newArtifacts || EMPTY_ARTIFACTS
  );

export const useEventWishes = () =>
  useVersionStore(
    (state) => state.versionData?.eventWishes || EMPTY_EVENT_WISHES
  );

export const useNewEvents = () =>
  useVersionStore((state) => state.versionData?.newEvents || EMPTY_EVENTS);

export const useNewAreas = () =>
  useVersionStore((state) => state.versionData?.newAreas || EMPTY_AREAS);

export const useSpiralAbyssData = () =>
  useVersionStore((state) => state.versionData?.spiralAbyss || null);

export const useVersionGallery = () =>
  useVersionStore((state) => state.versionData?.gallery || EMPTY_GALLERY);

export const useVersionWallpaper = () =>
  useVersionStore((state) => state.versionData?.gallery?.[0]?.url || null);
