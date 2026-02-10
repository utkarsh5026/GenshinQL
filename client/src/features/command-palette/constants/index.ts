/**
 * Element color classes for search result badges
 * Uses element-specific Tailwind classes (anemo-500, pyro-500, etc.)
 * Different from lib/elementColors.ts which uses generic colors (red-500, blue-500)
 */
export const SEARCH_ELEMENT_COLORS: Record<string, string> = {
  anemo: 'bg-anemo-500/20 text-anemo-400 border-anemo-500/30',
  pyro: 'bg-pyro-500/20 text-pyro-400 border-pyro-500/30',
  hydro: 'bg-hydro-500/20 text-hydro-400 border-hydro-500/30',
  electro: 'bg-electro-500/20 text-electro-400 border-electro-500/30',
  cryo: 'bg-cryo-500/20 text-cryo-400 border-cryo-500/30',
  geo: 'bg-geo-500/20 text-geo-400 border-geo-500/30',
  dendro: 'bg-dendro-500/20 text-dendro-400 border-dendro-500/30',
};

export const getSearchElementColor = (element: string): string => {
  return (
    SEARCH_ELEMENT_COLORS[element.toLowerCase()] ||
    'bg-gray-500/20 text-gray-400 border-gray-500/30'
  );
};
