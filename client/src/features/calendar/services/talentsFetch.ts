import { fetchWithCache } from '@/features/cache';

import type { TalentBookCalendar } from '../types';

let talentsCache: { talentBooks: TalentBookCalendar[] } | null = null;

/**
 * Fetches and caches talent book calendar data.
 */
export async function loadTalentsData() {
  if (talentsCache) return talentsCache;

  const { data: rawData } = await fetchWithCache<
    Record<
      string,
      Array<{
        dayOne: string;
        dayTwo: string;
        books: { name: string; url: string }[];
        characters: { name: string; url: string }[];
      }>
    >
  >('dailyTalents.json');

  const talentBooks = Object.entries(rawData).map(([location, days]) => ({
    location,
    days,
  }));

  talentsCache = { talentBooks };
  return talentsCache!;
}
