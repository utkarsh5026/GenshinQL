import { useCallback, useState } from 'react';

import type { RecentItem, SearchResult } from './types';
const STORAGE_KEY = 'genshinql-search-recents';
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

function loadRecents(): RecentItem[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Failed to load recents from localStorage:', e);
  }
  return [];
}

function saveRecents(recents: RecentItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(recents));
  } catch (e) {
    console.error('Failed to save recents to localStorage:', e);
  }
}

export function useRecents() {
  const [recents, setRecents] = useState<RecentItem[]>(() => loadRecents());

  const addRecent = useCallback((result: SearchResult) => {
    setRecents((prev) => {
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

      const filtered = prev.filter((r) => r.route !== route);
      const updated = [recentItem, ...filtered].slice(0, MAX_RECENTS);
      saveRecents(updated);
      return updated;
    });
  }, []);

  const clearRecents = useCallback(() => {
    setRecents([]);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return { recents, addRecent, clearRecents };
}

export { navigationIconMap };
