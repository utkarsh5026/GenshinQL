import { loadDataForFile } from '@/services/dataService';

import type { TalentBookCalendar } from '../types';

let talentsCache: { talentBooks: TalentBookCalendar[] } | null = null;

/**
 * Fetches and caches talent book calendar data.
 */
export async function loadTalentsData() {
  if (talentsCache) return talentsCache;

  const rawData = await loadDataForFile<
    Record<string, TalentBookCalendar['days']>
  >('dailyTalents.json', null);

  const talentBooks = Object.entries(rawData).map(([location, days]) => ({
    location,
    days,
  }));

  talentsCache = { talentBooks };
  return talentsCache!;
}
