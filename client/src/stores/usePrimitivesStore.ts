import { create } from 'zustand';

import { fetchWithCache } from '@/features/cache';
import type {
  AttributeName,
  PrimitiveItem,
  Primitives,
  RegionName,
  RoleItem,
} from '@/types';

/**
 * State interface for the primitives store.
 * Manages loading and storage of game primitives (elements, regions, weapon types, roles).
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
        regions: primitives.regions.map((reg) => ({
          ...reg,
          name: reg.name.split('-').join('') as RegionName,
        })),
        attributes:
          primitives.attributes?.map((attr) => ({
            ...attr,
            name: attr.name.replace('%', '') as AttributeName, // "HP%" -> "HP", "DEF%" -> "DEF"
          })) || [],
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

/**
 * Hook to get the attributes array from primitives.
 * @returns Array of attribute primitives or empty array if not loaded
 */
export const useAttributes = () =>
  usePrimitivesStore(
    ({ primitives }) => primitives?.attributes || EMPTY_ATTRIBUTES
  );

/**
 * Hook to get the roles array from primitives.
 * @returns Array of role primitives or empty array if not loaded
 */
export const useRoles = () =>
  usePrimitivesStore(({ primitives }) => primitives?.roles || EMPTY_ROLES);

// WeakMap cache for attribute URL maps (stable references)
const attributeUrlMapCache = new WeakMap<
  readonly PrimitiveItem<AttributeName>[],
  Record<string, string>
>();

function createAttributeUrlMap(
  attributes: readonly PrimitiveItem<AttributeName>[]
): Record<string, string> {
  const cached = attributeUrlMapCache.get(attributes);
  if (cached) return cached;

  const map: Record<string, string> = {};
  attributes.forEach((attr) => {
    map[attr.name] = attr.url;
  });

  attributeUrlMapCache.set(attributes, map);
  return map;
}

/**
 * Hook to get attributes and their URL mapping.
 * Uses WeakMap caching to ensure stable object references.
 */
export const useAttributesMap = () => {
  const attributes = useAttributes();
  return {
    attributes,
    attributeUrlMap: createAttributeUrlMap(attributes),
  };
};

const EMPTY_ELEMENTS: Primitives['elements'] = [] as const;
const EMPTY_REGIONS: Primitives['regions'] = [] as const;
const EMPTY_WEAPON_TYPES: Primitives['weaponTypes'] = [] as const;
const EMPTY_ATTRIBUTES: Primitives['attributes'] = [] as const;
const EMPTY_ROLES: RoleItem[] = [] as const;
