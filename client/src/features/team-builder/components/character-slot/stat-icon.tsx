import React from 'react';

import { CachedImage } from '@/features/cache';
import { useAttributesMap, useElements } from '@/stores/usePrimitivesStore';

/**
 * Maps the abbreviated stat label strings used in artifact-stats constants
 * to the canonical attribute name used in primitives.json (after stripping %).
 *
 * Keys  → stat strings from SANDS/GOBLET/CIRCLET_MAIN_STATS + SUBSTAT_OPTIONS
 * Values → attribute name in primitives OR element name for DMG% stats
 */
const STAT_TO_ATTRIBUTE: Record<
  string,
  { type: 'attribute' | 'element'; name: string }
> = {
  // Core attributes
  'ATK%': { type: 'attribute', name: 'ATK' },
  ATK: { type: 'attribute', name: 'ATK' },
  'DEF%': { type: 'attribute', name: 'DEF' },
  DEF: { type: 'attribute', name: 'DEF' },
  'HP%': { type: 'attribute', name: 'HP' },
  HP: { type: 'attribute', name: 'HP' },
  EM: { type: 'attribute', name: 'Elemental Mastery' },
  'ER%': { type: 'attribute', name: 'Energy Recharge' },
  'CRIT Rate%': { type: 'attribute', name: 'CRIT Rate' },
  'CRIT DMG%': { type: 'attribute', name: 'CRIT DMG' },
  'Healing Bonus%': { type: 'attribute', name: 'HP' }, // closest available icon

  // Element DMG% — map to element icons
  'Pyro DMG%': { type: 'element', name: 'Pyro' },
  'Hydro DMG%': { type: 'element', name: 'Hydro' },
  'Cryo DMG%': { type: 'element', name: 'Cryo' },
  'Electro DMG%': { type: 'element', name: 'Electro' },
  'Anemo DMG%': { type: 'element', name: 'Anemo' },
  'Geo DMG%': { type: 'element', name: 'Geo' },
  'Dendro DMG%': { type: 'element', name: 'Dendro' },
  'Physical DMG%': { type: 'attribute', name: 'ATK' }, // no physical icon, use ATK
};

interface StatIconProps {
  stat: string;
  className?: string;
}

/**
 * Renders a small inline icon for a Genshin artifact stat string.
 * Falls back gracefully to nothing if no icon is found.
 */
export const StatIcon: React.FC<StatIconProps> = ({
  stat,
  className = 'w-3 h-3 shrink-0',
}) => {
  const { attributeUrlMap } = useAttributesMap();
  const elements = useElements();

  const mapping = STAT_TO_ATTRIBUTE[stat];
  if (!mapping) return null;

  let url: string | undefined;

  if (mapping.type === 'attribute') {
    url = attributeUrlMap[mapping.name];
  } else {
    url = elements.find((e) => e.name === mapping.name)?.url;
  }

  if (!url) return null;

  return (
    <CachedImage
      src={url}
      alt={stat}
      className={className}
      showSkeleton={false}
    />
  );
};
