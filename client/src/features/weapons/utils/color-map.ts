/**
 * Weapon rarity color utilities.
 * Base palettes sourced from `@/lib/game-colors` — only weapon-card-specific
 * composite configs live here.
 */

import {
  getRarityActiveClasses,
  getRarityEntry,
  getRarityHexColor,
  RARITY_COLORS,
} from '@/lib/game-colors';

export { getRarityHexColor };

export const rarityColorMap: Record<
  number,
  {
    border: string;
    text: string;
    divider: string;
    avatarBorder: string;
    background: string;
  }
> = {
  5: {
    border: RARITY_COLORS[5].borderSoft,
    text: RARITY_COLORS[5].textStrong,
    divider: 'border-legendary-600/20',
    avatarBorder: RARITY_COLORS[5].border,
    background: RARITY_COLORS[5].bg,
  },
  4: {
    border: RARITY_COLORS[4].borderSoft,
    text: RARITY_COLORS[4].textStrong,
    divider: 'border-epic-600/20',
    avatarBorder: RARITY_COLORS[4].border,
    background: RARITY_COLORS[4].bg,
  },
  3: {
    border: RARITY_COLORS[3].borderSoft,
    text: RARITY_COLORS[3].textStrong,
    divider: 'border-rare-600/20',
    avatarBorder: RARITY_COLORS[3].border,
    background: RARITY_COLORS[3].bg,
  },
  2: {
    border: RARITY_COLORS[2].borderSoft,
    text: RARITY_COLORS[2].textStrong,
    divider: 'border-uncommon-600/20',
    avatarBorder: RARITY_COLORS[2].border,
    background: RARITY_COLORS[2].bg,
  },
  1: {
    border: RARITY_COLORS[1].borderSoft,
    text: RARITY_COLORS[1].textStrong,
    divider: 'border-common-600/20',
    avatarBorder: RARITY_COLORS[1].border,
    background: RARITY_COLORS[1].bg,
  },
} as const;

export function getRarityColor(rarity: number) {
  return rarityColorMap[rarity];
}

/**
 * Comprehensive rarity styling config for premium weapon cards.
 * Uses full color palette (50-900 shades) with gradients.
 */
export interface RarityStyleConfig {
  container: string;
  avatarBorder: string;
  starsText: string;
  badge: string;
  statsDivider: string;
  statsBackground: string;
  statLabel: string;
  statValue: string;
  effectBackground: string;
  hoverClass: 'legendary' | 'epic' | 'rare' | 'uncommon' | 'common';
}

export const rarityStyleMap: Record<number, RarityStyleConfig> = {
  5: {
    container:
      'border-l-4 border-legendary-500 bg-surface-50 dark:bg-surface-200 shadow-md',
    avatarBorder: 'border-2 border-legendary-500/60 rounded-lg',
    starsText: 'text-legendary-500 dark:text-legendary-400',
    badge: 'bg-legendary-500/10 text-legendary-600 dark:text-legendary-400',
    statsDivider: 'border-border',
    statsBackground: '',
    statLabel: 'text-muted-foreground',
    statValue: 'text-foreground font-semibold',
    effectBackground: 'bg-legendary-500/5 dark:bg-legendary-900/20',
    hoverClass: 'legendary',
  },
  4: {
    container:
      'border-l-4 border-epic-500 bg-surface-50 dark:bg-surface-200 shadow-md',
    avatarBorder: 'border-2 border-epic-500/60 rounded-lg',
    starsText: 'text-epic-500 dark:text-epic-400',
    badge: 'bg-epic-500/10 text-epic-600 dark:text-epic-400',
    statsDivider: 'border-border',
    statsBackground: '',
    statLabel: 'text-muted-foreground',
    statValue: 'text-foreground font-semibold',
    effectBackground: 'bg-epic-500/5 dark:bg-epic-900/20',
    hoverClass: 'epic',
  },
  3: {
    container:
      'border-l-4 border-rare-500 bg-surface-50 dark:bg-surface-200 shadow',
    avatarBorder: 'border-2 border-rare-500/60 rounded-lg',
    starsText: 'text-rare-500 dark:text-rare-400',
    badge: 'bg-rare-500/10 text-rare-600 dark:text-rare-400',
    statsDivider: 'border-border',
    statsBackground: '',
    statLabel: 'text-muted-foreground',
    statValue: 'text-foreground font-semibold',
    effectBackground: 'bg-rare-500/5 dark:bg-rare-900/20',
    hoverClass: 'rare',
  },
  2: {
    container:
      'border-l-4 border-uncommon-500 bg-surface-50 dark:bg-surface-200 shadow-sm',
    avatarBorder: 'border border-uncommon-500/50 rounded-lg',
    starsText: 'text-uncommon-500 dark:text-uncommon-400',
    badge: 'bg-uncommon-500/10 text-uncommon-600 dark:text-uncommon-400',
    statsDivider: 'border-border',
    statsBackground: '',
    statLabel: 'text-muted-foreground',
    statValue: 'text-foreground',
    effectBackground: '',
    hoverClass: 'uncommon',
  },
  1: {
    container:
      'border-l-4 border-common-400 bg-surface-50 dark:bg-surface-200 shadow-sm',
    avatarBorder: 'border border-common-400/50 rounded-lg',
    starsText: 'text-common-500 dark:text-common-400',
    badge: 'bg-common-500/10 text-common-600 dark:text-common-400',
    statsDivider: 'border-border',
    statsBackground: '',
    statLabel: 'text-muted-foreground',
    statValue: 'text-foreground',
    effectBackground: '',
    hoverClass: 'common',
  },
} as const;

export function getRarityStyles(rarity: number): RarityStyleConfig {
  return rarityStyleMap[rarity] || rarityStyleMap[1];
}

/**
 * Returns rarity-specific active-state classes for menu item rows.
 * Delegates to `getRarityActiveClasses` from `@/lib/game-colors`.
 */
export function getRarityClasses(rarity: number): {
  active: string;
  indicator: string;
} {
  return getRarityActiveClasses(rarity);
}

/**
 * Returns the primary hex color for a rarity level (for inline styles).
 * Re-exported from `@/lib/game-colors` for backward compat.
 */
export { getRarityEntry };
