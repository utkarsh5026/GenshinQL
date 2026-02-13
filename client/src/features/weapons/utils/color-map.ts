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
    border: 'border-legendary-600/30',
    text: 'text-legendary-500',
    divider: 'border-legendary-600/20',
    avatarBorder: 'border-legendary-500',
    background: 'bg-legendary-500/10',
  },
  4: {
    border: 'border-epic-600/30',
    text: 'text-epic-500',
    divider: 'border-epic-600/20',
    avatarBorder: 'border-epic-500',
    background: 'bg-epic-500/10',
  },
  3: {
    border: 'border-rare-600/30',
    text: 'text-rare-500',
    divider: 'border-rare-600/20',
    avatarBorder: 'border-rare-500',
    background: 'bg-rare-500/10',
  },
  2: {
    border: 'border-uncommon-600/30',
    text: 'text-uncommon-500',
    divider: 'border-uncommon-600/20',
    avatarBorder: 'border-uncommon-500',
    background: 'bg-uncommon-500/10',
  },
  1: {
    border: 'border-common-600/30',
    text: 'text-common-500',
    divider: 'border-common-600/20',
    avatarBorder: 'border-common-500',
    background: 'bg-common-500/10',
  },
} as const;

export function getRarityColor(rarity: number) {
  return rarityColorMap[rarity];
}

/**
 * Comprehensive rarity styling config for premium weapon cards
 * Uses full color palette (50-900 shades) with gradients
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
    // LEGENDARY - Gold accent, clean
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
    // EPIC - Purple accent
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
    // RARE - Blue accent
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
    // UNCOMMON - Green accent
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
    // COMMON - Gray, minimal
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
 * Returns rarity-specific Tailwind classes for menu items based on weapon rarity
 * Mirrors the pattern used in character-description.tsx for elements
 */
export function getRarityClasses(rarity: number): {
  active: string;
  indicator: string;
} {
  const rarityClassMap: Record<number, { active: string; indicator: string }> =
    {
      5: {
        active:
          'bg-linear-to-r from-legendary-500/20 via-legendary-400/15 to-transparent text-legendary-300 border-legendary-500/40',
        indicator: 'bg-legendary-400',
      },
      4: {
        active:
          'bg-linear-to-r from-epic-500/20 via-epic-400/15 to-transparent text-epic-300 border-epic-500/40',
        indicator: 'bg-epic-400',
      },
      3: {
        active:
          'bg-linear-to-r from-rare-500/20 via-rare-400/15 to-transparent text-rare-300 border-rare-500/40',
        indicator: 'bg-rare-400',
      },
      2: {
        active:
          'bg-linear-to-r from-uncommon-500/20 via-uncommon-400/15 to-transparent text-uncommon-300 border-uncommon-500/40',
        indicator: 'bg-uncommon-400',
      },
      1: {
        active:
          'bg-linear-to-r from-common-500/20 via-common-400/15 to-transparent text-common-300 border-common-500/40',
        indicator: 'bg-common-400',
      },
    };
  return rarityClassMap[rarity] || rarityClassMap[1];
}

/**
 * Returns the primary hex color for a rarity level (for inline styles like boxShadow)
 */
export function getRarityHexColor(rarity: number): string {
  const hexMap: Record<number, string> = {
    5: '#D4A84B', // legendary gold
    4: '#A855F7', // epic purple
    3: '#3B82F6', // rare blue
    2: '#22C55E', // uncommon green
    1: '#9CA3AF', // common gray
  };
  return hexMap[rarity] || hexMap[1];
}
