import { useCallback, useState } from 'react';

import type { RecentItem, SearchResult } from './types';
const STORAGE_KEY = 'genshinql-search-recents';
const MAX_RECENTS = 5;

// Map navigation routes to icon names for reconstruction
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
      let route: string;
      let recentItem: RecentItem;

      switch (result.type) {
        case 'navigation':
          route = result.route;
          recentItem = {
            type: 'navigation',
            name: result.label,
            route,
            label: result.label,
            iconName: navigationIconMap[route],
            iconColor: result.iconColor,
            timestamp: Date.now(),
          };
          break;
        case 'character':
          route = `/characters/${result.name}`;
          recentItem = {
            type: 'character',
            name: result.name,
            route,
            iconUrl: result.iconUrl,
            rarity: result.rarity,
            element: result.element,
            weaponType: result.weaponType,
            timestamp: Date.now(),
          };
          break;
        case 'weapon':
          route = `/weapons/${result.name}`;
          recentItem = {
            type: 'weapon',
            name: result.name,
            route,
            iconUrl: result.iconUrl,
            rarity: result.rarity,
            weaponType: result.weaponType,
            timestamp: Date.now(),
          };
          break;
      }

      // Remove existing entry with same route
      const filtered = prev.filter((r) => r.route !== route);

      // Add new item at the beginning and limit to MAX_RECENTS
      const updated = [recentItem, ...filtered].slice(0, MAX_RECENTS);

      // Save to localStorage
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
