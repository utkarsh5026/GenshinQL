import { useEffect, useState } from 'react';

import { fetchWithCache } from '@/features/cache';

import type { AbyssData } from '../types';
import { parseAbyssFilename } from '../utils';

interface AbyssEnemiesState {
  data: AbyssData | null;
  loading: boolean;
  error: Error | null;
}

/**
 * Fetches spiral-abyss enemy lineup data for a specific date.
 * If dateString is provided, attempts to fetch the corresponding dated file.
 * Falls back to spiral-abyss-latest.json if no date or parsing fails.
 */
export function useAbyssEnemies(dateString?: string): AbyssEnemiesState {
  const [state, setState] = useState<AbyssEnemiesState>({
    data: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const filename = dateString ? parseAbyssFilename(dateString) : null;
        const path = filename
          ? `spiral-abyss/${filename}`
          : 'spiral-abyss/spiral-abyss-latest.json';

        const { data } = await fetchWithCache<AbyssData>(path);
        if (!cancelled) {
          setState({ data, loading: false, error: null });
        }
      } catch {
        if (!cancelled) {
          try {
            const { data } = await fetchWithCache<AbyssData>(
              'spiral-abyss/spiral-abyss-latest.json'
            );
            setState({ data, loading: false, error: null });
          } catch (fallbackErr) {
            setState({
              data: null,
              loading: false,
              error:
                fallbackErr instanceof Error
                  ? fallbackErr
                  : new Error('Failed to fetch abyss data'),
            });
          }
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [dateString]);

  return state;
}
