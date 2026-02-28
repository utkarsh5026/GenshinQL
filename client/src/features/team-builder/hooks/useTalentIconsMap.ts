import { useEffect, useState } from 'react';

import { fetchCharTalents } from '../services';
import type { CharTalentsMap } from '../types';

const EMPTY_MAP: CharTalentsMap = {};

/** Loads the character talent icon map once and returns it. Returns an empty map while loading. */
export function useTalentIconsMap(): CharTalentsMap {
  const [talentMap, setTalentMap] = useState<CharTalentsMap>(EMPTY_MAP);

  console.log(talentMap);

  useEffect(() => {
    fetchCharTalents()
      .then(setTalentMap)
      .catch(() => {});
  }, []);

  return talentMap;
}
