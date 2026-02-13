import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

import { fetchWithCache } from '@/features/cache';

import type { ArtifactLink } from '../types';

interface ArtifactLinksState {
  artifactLinks: ArtifactLink[] | null;
  loading: boolean;
  error: Error | null;

  fetchArtifactLinks: () => Promise<void>;
  reset: () => void;
}

const initialState = {
  artifactLinks: null as ArtifactLink[] | null,
  loading: false,
  error: null as Error | null,
};

const EMPTY_ARTIFACT_LINKS: readonly ArtifactLink[] = [];

export const useArtifactLinksStore = create<ArtifactLinksState>()(
  devtools(
    (set, get) => ({
      ...initialState,

      fetchArtifactLinks: async () => {
        const { artifactLinks } = get();
        if (artifactLinks !== null) return;

        set({ loading: true, error: null });

        try {
          const result = await fetchWithCache<ArtifactLink[]>(
            'artifacts/artifacts-links.json',
            {
              cacheKey: 'artifact-links',
              version: 1,
              onUpdate: (freshData) => {
                set({ artifactLinks: freshData });
              },
            }
          );

          set({
            artifactLinks: result.data,
            loading: false,
          });
        } catch (err) {
          set({
            loading: false,
            error:
              err instanceof Error
                ? err
                : new Error('Failed to fetch artifact links'),
          });
        }
      },

      reset: () => set(initialState),
    }),
    { name: 'ArtifactLinksStore' }
  )
);

export const useArtifactLinks = () =>
  useArtifactLinksStore((state) => state.artifactLinks ?? EMPTY_ARTIFACT_LINKS);

export const useArtifactLinksLoading = () =>
  useArtifactLinksStore((state) => state.loading);

export const useArtifactLinksError = () =>
  useArtifactLinksStore((state) => state.error);

export const useFetchArtifactLinks = () =>
  useArtifactLinksStore((state) => state.fetchArtifactLinks);

export const useResetArtifactLinks = () =>
  useArtifactLinksStore((state) => state.reset);
