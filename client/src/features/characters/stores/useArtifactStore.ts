import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

import { fetchWithCache } from '@/features/cache';

import type {
  ArtifactLink,
  DetailedArtifact,
  DetailedArtifactsMap,
} from '../types';

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
                set({
                  artifactLinks: [...freshData].sort((a, b) =>
                    a.name.localeCompare(b.name)
                  ),
                });
              },
            }
          );

          set({
            artifactLinks: [...result.data].sort((a, b) =>
              a.name.localeCompare(b.name)
            ),
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

/* ═══════════════════════════════════════════════════════════════════════════
   Detailed Artifacts store
   Fetches `/artifacts/artifacts-detailed.json` (a keyed object) and exposes
   a Map<name, DetailedArtifact> together with per-slot convenience fields.
═══════════════════════════════════════════════════════════════════════════ */

/** Raw JSON shape for a single artifact set entry. */
type RawDetailedArtifact = {
  name: string;
  pieces: { type: string; name: string; iconUrl: string }[];
  twoPieceBonus: string;
  fourPieceBonus: string;
};

/** Top-level JSON shape: an object keyed by set name. */
type RawDetailedArtifactsJson = Record<string, RawDetailedArtifact>;

/**
 * Normalise the raw JSON entry into a `DetailedArtifact` by additionally
 * indexing each piece by its slot type for ergonomic access.
 */
function normaliseArtifact(raw: RawDetailedArtifact): DetailedArtifact {
  const artifact: DetailedArtifact = {
    name: raw.name,
    pieces: raw.pieces as DetailedArtifact['pieces'],
    twoPieceBonus: raw.twoPieceBonus,
    fourPieceBonus: raw.fourPieceBonus,
  };

  for (const piece of raw.pieces) {
    const slot = piece.type as keyof Pick<
      DetailedArtifact,
      'flower' | 'plume' | 'sands' | 'goblet' | 'circlet'
    >;
    if (['flower', 'plume', 'sands', 'goblet', 'circlet'].includes(slot)) {
      (artifact as Record<string, unknown>)[slot] = piece;
    }
  }

  return artifact;
}

/** Build an immutable map from the raw JSON object. */
function buildArtifactsMap(
  raw: RawDetailedArtifactsJson
): DetailedArtifactsMap {
  const entries: [string, DetailedArtifact][] = Object.values(raw)
    .map(normaliseArtifact)
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((a) => [a.name, a]);
  return new Map(entries) as DetailedArtifactsMap;
}

const EMPTY_DETAILED_MAP: DetailedArtifactsMap = new Map();

interface DetailedArtifactsState {
  /** Null until the first fetch completes. */
  artifactsMap: DetailedArtifactsMap | null;
  loading: boolean;
  error: Error | null;

  fetchDetailedArtifacts: () => Promise<void>;
  reset: () => void;
}

const initialDetailedState = {
  artifactsMap: null as DetailedArtifactsMap | null,
  loading: false,
  error: null as Error | null,
};

export const useDetailedArtifactsStore = create<DetailedArtifactsState>()(
  devtools(
    (set, get) => ({
      ...initialDetailedState,

      fetchDetailedArtifacts: async () => {
        if (get().artifactsMap !== null) return;

        set({ loading: true, error: null });

        try {
          const result = await fetchWithCache<RawDetailedArtifactsJson>(
            'artifacts/artifacts-detailed.json',
            {
              cacheKey: 'artifacts-detailed',
              version: 1,
              onUpdate: (freshData) => {
                set({ artifactsMap: buildArtifactsMap(freshData) });
              },
            }
          );

          set({
            artifactsMap: buildArtifactsMap(result.data),
            loading: false,
          });
        } catch (err) {
          set({
            loading: false,
            error:
              err instanceof Error
                ? err
                : new Error('Failed to fetch detailed artifacts'),
          });
        }
      },

      reset: () => set(initialDetailedState),
    }),
    { name: 'DetailedArtifactsStore' }
  )
);

/* ── Selector hooks ─────────────────────────────────────────────────────── */

/** Returns the full map of detailed artifacts (empty map until loaded). */
export const useDetailedArtifactsMap = () =>
  useDetailedArtifactsStore(
    (state) => state.artifactsMap ?? EMPTY_DETAILED_MAP
  );

/** Returns a sorted array of all DetailedArtifact entries. */
export const useDetailedArtifactsList = () =>
  useDetailedArtifactsStore((state) =>
    state.artifactsMap
      ? Array.from(state.artifactsMap.values())
      : ([] as DetailedArtifact[])
  );

/** Returns a single artifact by name, or undefined if not found / not loaded. */
export const useDetailedArtifactByName = (name: string) =>
  useDetailedArtifactsStore((state) => state.artifactsMap?.get(name));

/** Returns true while the initial fetch is in progress. */
export const useDetailedArtifactsLoading = () =>
  useDetailedArtifactsStore((state) => state.loading);

/** Returns the fetch error, if any. */
export const useDetailedArtifactsError = () =>
  useDetailedArtifactsStore((state) => state.error);

/** Returns the fetch action (stable reference, safe to call redundantly). */
export const useFetchDetailedArtifacts = () =>
  useDetailedArtifactsStore((state) => state.fetchDetailedArtifacts);

/** Returns the reset action for the detailed artifacts store. */
export const useResetDetailedArtifacts = () =>
  useDetailedArtifactsStore((state) => state.reset);
