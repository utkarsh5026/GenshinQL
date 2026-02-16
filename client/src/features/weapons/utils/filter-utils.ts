import { cn } from '@/lib/utils';

import { getRarityColor } from './color-map';

/**
 * Abbreviates long substat labels for compact display in filters
 */
export const getCompactSubstatLabel = (substat: string): string => {
  const abbreviations: Record<string, string> = {
    'Elemental Mastery': 'EM',
    'Energy Recharge': 'ER',
  };
  return abbreviations[substat] || substat;
};

/**
 * Returns rarity button classes for filter buttons
 * Uses centralized rarity color theme from color-map.ts
 * @param rarity - The rarity level (1-5)
 * @param isSelected - Whether the rarity is currently selected
 * @returns Tailwind class string for button styling
 */
export function getRarityFilterClasses(
  rarity: number,
  isSelected: boolean
): string {
  const colors = getRarityColor(rarity);

  if (isSelected) {
    return cn('bg-primary/20 border-primary', colors?.text || 'text-primary');
  }

  return 'bg-muted/30 border-border/30 text-muted-foreground hover:bg-muted/50';
}
