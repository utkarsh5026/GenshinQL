import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import type {
  RecentItem,
  SearchResult,
} from '@/features/command-palette/types';

const MAX_RECENTS = 5;

const navigationIconMap: Record<string, string> = {
  '/talents': 'Calendar',
  '/characters/table': 'Users',
  '/characters/routine': 'Target',
  '/weapons/calendar': 'Calendar',
  '/weapons/grid': 'Swords',
  '/tierlist': 'Star',
  '/guesser': 'Gamepad2',
};

interface RecentsState {
  recents: RecentItem[];
  addRecent: (result: SearchResult) => void;
  clearRecents: () => void;
}

const EMPTY_RECENTS: RecentItem[] = [];

export const useRecentsStore = create<RecentsState>()(
  persist(
    (set) => ({
      recents: [],

      addRecent: (result: SearchResult) => {
        set((state) => {
          const timestamp = Date.now();
          const route =
            result.type === 'navigation'
              ? result.route
              : `/${result.type}s/${result.name}`;

          const recentItem: RecentItem = {
            ...result,
            route,
            timestamp,
            ...(result.type === 'navigation' && {
              name: result.label,
              iconName: navigationIconMap[route],
            }),
          } as RecentItem;

          const filtered = state.recents.filter((r) => r.route !== route);
          const updated = [recentItem, ...filtered].slice(0, MAX_RECENTS);

          return { recents: updated };
        });
      },

      clearRecents: () => {
        set({ recents: [] });
      },
    }),
    {
      name: 'genshinql-search-recents',
    }
  )
);

export const useRecents = () =>
  useRecentsStore((state) => state.recents || EMPTY_RECENTS);

export const useAddRecent = () => useRecentsStore((state) => state.addRecent);

export const useClearRecents = () =>
  useRecentsStore((state) => state.clearRecents);

export { navigationIconMap };
