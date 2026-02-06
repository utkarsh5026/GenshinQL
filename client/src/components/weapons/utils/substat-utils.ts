/**
 * Weapon substat utilities
 * Provides emoji mappings, colors, and tier classification for weapon substats
 */

export type SubstatType =
  | 'CRIT Rate'
  | 'CRIT DMG'
  | 'ATK'
  | 'HP'
  | 'DEF'
  | 'Energy Recharge'
  | 'Elemental Mastery'
  | 'Physical DMG Bonus'
  | 'None';

// Emoji mappings for each stat type
export const SUBSTAT_EMOJIS: Record<SubstatType, string> = {
  'CRIT Rate': '🎯',
  'CRIT DMG': '💥',
  ATK: '⚔️',
  HP: '❤️',
  DEF: '🛡️',
  'Energy Recharge': '⚡',
  'Elemental Mastery': '🌀',
  'Physical DMG Bonus': '💪',
  None: '—',
};

// Color classes for each stat type
export const SUBSTAT_COLORS: Record<
  SubstatType,
  { text: string; bg: string; hex: string }
> = {
  'CRIT Rate': { text: 'text-red-400', bg: 'bg-red-500/10', hex: '#f87171' },
  'CRIT DMG': {
    text: 'text-orange-400',
    bg: 'bg-orange-500/10',
    hex: '#fb923c',
  },
  ATK: { text: 'text-amber-400', bg: 'bg-amber-500/10', hex: '#fbbf24' },
  HP: { text: 'text-green-400', bg: 'bg-green-500/10', hex: '#4ade80' },
  DEF: { text: 'text-yellow-400', bg: 'bg-yellow-500/10', hex: '#facc15' },
  'Energy Recharge': {
    text: 'text-purple-400',
    bg: 'bg-purple-500/10',
    hex: '#c084fc',
  },
  'Elemental Mastery': {
    text: 'text-teal-400',
    bg: 'bg-teal-500/10',
    hex: '#2dd4bf',
  },
  'Physical DMG Bonus': {
    text: 'text-slate-300',
    bg: 'bg-slate-500/10',
    hex: '#cbd5e1',
  },
  None: { text: 'text-white/40', bg: '', hex: '#9ca3af' },
};

// Weapon tier classification
export type WeaponTier = 'high-atk' | 'balanced' | 'high-substat';

export interface WeaponTierInfo {
  tier: WeaponTier;
  label: string;
  emoji: string;
  description: string;
}

export interface ParsedSubstat {
  type: SubstatType;
  value: string;
  emoji: string;
  colors: (typeof SUBSTAT_COLORS)[SubstatType];
}

/**
 * Parse a substat string like "CRIT Rate 22.1%" into its components
 */
export function parseSubstat(subStatString: string): ParsedSubstat {
  if (!subStatString || subStatString === 'None') {
    return {
      type: 'None',
      value: '',
      emoji: SUBSTAT_EMOJIS['None'],
      colors: SUBSTAT_COLORS['None'],
    };
  }

  // Match patterns like "CRIT Rate 22.1%", "ATK 41.3%", "Elemental Mastery 165"
  const patterns: { pattern: RegExp; type: SubstatType }[] = [
    { pattern: /^CRIT Rate\s+(.+)$/, type: 'CRIT Rate' },
    { pattern: /^CRIT DMG\s+(.+)$/, type: 'CRIT DMG' },
    { pattern: /^ATK\s+(.+)$/, type: 'ATK' },
    { pattern: /^HP\s+(.+)$/, type: 'HP' },
    { pattern: /^DEF\s+(.+)$/, type: 'DEF' },
    { pattern: /^Energy Recharge\s+(.+)$/, type: 'Energy Recharge' },
    { pattern: /^Elemental Mastery\s+(.+)$/, type: 'Elemental Mastery' },
    { pattern: /^Physical DMG Bonus\s+(.+)$/, type: 'Physical DMG Bonus' },
  ];

  for (const { pattern, type } of patterns) {
    const match = subStatString.match(pattern);
    if (match) {
      return {
        type,
        value: match[1],
        emoji: SUBSTAT_EMOJIS[type],
        colors: SUBSTAT_COLORS[type],
      };
    }
  }

  // Fallback for unknown substats
  return {
    type: 'None',
    value: subStatString,
    emoji: '',
    colors: SUBSTAT_COLORS['None'],
  };
}

/**
 * Get the emoji for a given substat type
 */
export function getSubstatEmoji(type: SubstatType): string {
  return SUBSTAT_EMOJIS[type] || '';
}

/**
 * Get the color classes for a given substat type
 */
export function getSubstatColors(
  type: SubstatType
): (typeof SUBSTAT_COLORS)[SubstatType] {
  return SUBSTAT_COLORS[type] || SUBSTAT_COLORS['None'];
}

/**
 * Classify a weapon into tiers based on its base ATK
 *
 * In Genshin Impact, weapons follow an inverse relationship between
 * base ATK and substat value:
 * - High base ATK (608): Low substat value
 * - Medium base ATK (510-565): Medium substat value
 * - Low base ATK (454 or below): High substat value
 *
 * This is consistent across all 5★ weapons and follows similar patterns
 * for 4★ weapons.
 */
export function getWeaponTier(baseAtk: number | string): WeaponTierInfo {
  const atk = typeof baseAtk === 'string' ? parseInt(baseAtk, 10) : baseAtk;

  // 5★ weapons: 608 (high ATK), 542 (balanced), 454 (high substat)
  // 4★ weapons follow similar tiers: 565+, 510, 454 or below
  if (atk >= 580) {
    return {
      tier: 'high-atk',
      label: 'High ATK',
      emoji: '⚔️',
      description: 'High base ATK, lower substat value',
    };
  } else if (atk >= 500) {
    return {
      tier: 'balanced',
      label: 'Balanced',
      emoji: '⚖️',
      description: 'Balanced base ATK and substat value',
    };
  } else {
    return {
      tier: 'high-substat',
      label: 'High Sub',
      emoji: '📊',
      description: 'Lower base ATK, higher substat value',
    };
  }
}
