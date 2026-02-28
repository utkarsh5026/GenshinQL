import { fetchWithCache } from '@/features/cache';

import type { CharTalentsMap } from '../types';

/** Fetches the aggregated character talent icon map from chrTalents.json. */
export async function fetchCharTalents(): Promise<CharTalentsMap> {
  const { data } = await fetchWithCache<CharTalentsMap>('chrTalents.json');
  return data;
}
