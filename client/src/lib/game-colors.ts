/**
 * Single source of truth for all game-data-driven Tailwind class strings.
 *
 * IMPORTANT: All class strings must be complete, static literals — no template
 * literals or dynamic construction. Tailwind CSS 4 scans source files for full
 * class names and will not pick up dynamically-constructed strings.
 *
 * Usage:
 *   import { ELEMENT_COLORS, RARITY_COLORS } from '@/lib/game-colors';
 *   const cls = ELEMENT_COLORS['pyro'].text;         // 'text-pyro-300'
 *   const hex = RARITY_COLORS[5].hex;               // '#D4A84B'
 */

/** All 7 Genshin elements keyed by lowercase name. */
export type Element =
  | 'pyro'
  | 'hydro'
  | 'anemo'
  | 'electro'
  | 'cryo'
  | 'geo'
  | 'dendro';

/** All 5 rarity tiers. */
export type Rarity = 1 | 2 | 3 | 4 | 5;

/** Rarity tier name used as a CSS module class key. */
export type RarityName = 'legendary' | 'epic' | 'rare' | 'uncommon' | 'common';

interface ElementColorEntry {
  /** Background — e.g. for element-tinted containers */
  bg: string;
  /** Stronger background — e.g. for badge backgrounds */
  bgStrong: string;
  /** Mid-toned text — readable on dark backgrounds */
  text: string;
  /** Light text — for tight badge labels */
  textLight: string;
  /** Accent text — for active states, icons */
  textAccent: string;
  /** Border at medium opacity */
  border: string;
  /** Border at lower opacity */
  borderSoft: string;
  /** Hover border utility class */
  hoverBorder: string;
  /** Solid indicator dot / bar */
  indicator: string;
  /** Gradient fragment used in `bg-linear-to-r` active state rows */
  gradientFrom: string;
  /** Gradient fragment for constellation level bars */
  levelGradient: string;
  /** Full badge pill: bg + border, ready to apply to a container */
  badgeContainer: string;
  /** Glassmorphism background for character cards */
  glass: string;
  /** CSS module animation class name (key into a .module.css) */
  animation: string;
  /** CSS module hover-glow class name (key into a .module.css) */
  glow: string;
  /** Primary hex color for inline styles (e.g. box-shadow) */
  hex: string;
  /**
   * Legacy raw Tailwind color token (no prefix), kept for backward compat with
   * `getElementColor()`. New code should use `hex` or a specific class prop.
   */
  rawColor: string;
}

interface RarityColorEntry {
  /** Star / accent text color */
  text: string;
  /** Stronger text — badges, stat values */
  textStrong: string;
  /** Light text used in active gradient rows */
  textBadge: string;
  /** Solid border — avatar ring, left accent bar */
  border: string;
  /** Soft border with lower opacity */
  borderSoft: string;
  /** Border with /40 opacity — for active tab rows */
  borderActive: string;
  /** Light border with /50 opacity — element-helpers style */
  borderLight: string;
  /** Background tint with low opacity */
  bg: string;
  /** Strong background tint — e.g. filter pills */
  bgStrong: string;
  /** Gradient fragment used in active state rows */
  gradientFrom: string;
  /** Solid indicator dot / bar */
  indicator: string;
  /** Rarity tier name — used as CSS module class key */
  name: RarityName;
  /** CSS module animation class name */
  animation: string;
  /** CSS module hover-glow class name */
  glow: string;
  /** Primary hex color for inline styles */
  hex: string;
  /** Drop-shadow glow for star icons (5★ and 4★ only, empty string otherwise) */
  starGlow: string;
  /**
   * Legacy raw Tailwind color token (no prefix), kept for backward compat with
   * `getRarityColor()`. New code should use `hex` or a specific class prop.
   */
  rawColor: string;
  /** Legacy star text class kept for `getRarityStarColor()` backward compat. */
  legacyStarColor: string;
  /** Legacy border+shadow class kept for `getRarityBorderClass()` backward compat. */
  legacyBorderClass: string;
  /** Legacy glassmorphism class kept for `getRarityGlassClass()` backward compat. */
  legacyGlassClass: string;
}

/** Element-specific Tailwind class palette. Keys are lowercase element names. */
export const ELEMENT_COLORS: Record<Element, ElementColorEntry> = {
  pyro: {
    bg: 'bg-pyro-900/30',
    bgStrong: 'bg-pyro-900/50',
    text: 'text-pyro-300',
    textLight: 'text-pyro-200',
    textAccent: 'text-pyro-400',
    border: 'border-pyro-500/40',
    borderSoft: 'border-pyro-500/30',
    hoverBorder: 'hover:border-pyro-400/50',
    indicator: 'bg-pyro-400',
    gradientFrom: 'from-pyro-500/20 via-pyro-400/15 to-transparent',
    levelGradient: 'from-pyro-500 to-pyro-700',
    badgeContainer: 'bg-pyro-900/30 border border-pyro-500/30',
    glass:
      'bg-gradient-to-br from-pyro-500/[0.02] via-transparent to-transparent backdrop-blur-md border border-pyro-500/[0.08]',
    animation: 'pyro',
    glow: 'pyroGlow',
    hex: '#e74c3c',
    rawColor: 'red-500',
  },
  hydro: {
    bg: 'bg-hydro-900/30',
    bgStrong: 'bg-hydro-900/50',
    text: 'text-hydro-300',
    textLight: 'text-hydro-200',
    textAccent: 'text-hydro-400',
    border: 'border-hydro-500/40',
    borderSoft: 'border-hydro-500/30',
    hoverBorder: 'hover:border-hydro-400/50',
    indicator: 'bg-hydro-400',
    gradientFrom: 'from-hydro-500/20 via-hydro-400/15 to-transparent',
    levelGradient: 'from-hydro-500 to-hydro-700',
    badgeContainer: 'bg-hydro-900/30 border border-hydro-500/30',
    glass:
      'bg-gradient-to-br from-hydro-500/[0.02] via-transparent to-transparent backdrop-blur-md border border-hydro-500/[0.08]',
    animation: 'hydro',
    glow: 'hydroGlow',
    hex: '#3498db',
    rawColor: 'blue-500',
  },
  anemo: {
    bg: 'bg-anemo-900/30',
    bgStrong: 'bg-anemo-900/50',
    text: 'text-anemo-300',
    textLight: 'text-anemo-200',
    textAccent: 'text-anemo-400',
    border: 'border-anemo-500/40',
    borderSoft: 'border-anemo-500/30',
    hoverBorder: 'hover:border-anemo-400/50',
    indicator: 'bg-anemo-400',
    gradientFrom: 'from-anemo-500/20 via-anemo-400/15 to-transparent',
    levelGradient: 'from-anemo-500 to-anemo-700',
    badgeContainer: 'bg-anemo-900/30 border border-anemo-500/30',
    glass:
      'bg-gradient-to-br from-anemo-500/[0.02] via-transparent to-transparent backdrop-blur-md border border-anemo-500/[0.08]',
    animation: 'anemo',
    glow: 'anemoGlow',
    hex: '#1abc9c',
    rawColor: 'cyan-400',
  },
  electro: {
    bg: 'bg-electro-900/30',
    bgStrong: 'bg-electro-900/50',
    text: 'text-electro-300',
    textLight: 'text-electro-200',
    textAccent: 'text-electro-400',
    border: 'border-electro-500/40',
    borderSoft: 'border-electro-500/30',
    hoverBorder: 'hover:border-electro-400/50',
    indicator: 'bg-electro-400',
    gradientFrom: 'from-electro-500/20 via-electro-400/15 to-transparent',
    levelGradient: 'from-electro-500 to-electro-700',
    badgeContainer: 'bg-electro-900/30 border border-electro-500/30',
    glass:
      'bg-gradient-to-br from-electro-500/[0.02] via-transparent to-transparent backdrop-blur-md border border-electro-500/[0.08]',
    animation: 'electro',
    glow: 'electroGlow',
    hex: '#9b59b6',
    rawColor: 'purple-500',
  },
  cryo: {
    bg: 'bg-cryo-900/30',
    bgStrong: 'bg-cryo-900/50',
    text: 'text-cryo-300',
    textLight: 'text-cryo-200',
    textAccent: 'text-cryo-400',
    border: 'border-cryo-500/40',
    borderSoft: 'border-cryo-500/30',
    hoverBorder: 'hover:border-cryo-400/50',
    indicator: 'bg-cryo-400',
    gradientFrom: 'from-cryo-500/20 via-cryo-400/15 to-transparent',
    levelGradient: 'from-cryo-500 to-cryo-700',
    badgeContainer: 'bg-cryo-900/30 border border-cryo-500/30',
    glass:
      'bg-gradient-to-br from-cryo-500/[0.02] via-transparent to-transparent backdrop-blur-md border border-cryo-500/[0.08]',
    animation: 'cryo',
    glow: 'cryoGlow',
    hex: '#ecf0f1',
    rawColor: 'blue-300',
  },
  geo: {
    bg: 'bg-geo-900/30',
    bgStrong: 'bg-geo-900/50',
    text: 'text-geo-300',
    textLight: 'text-geo-200',
    textAccent: 'text-geo-400',
    border: 'border-geo-500/40',
    borderSoft: 'border-geo-500/30',
    hoverBorder: 'hover:border-geo-400/50',
    indicator: 'bg-geo-400',
    gradientFrom: 'from-geo-500/20 via-geo-400/15 to-transparent',
    levelGradient: 'from-geo-500 to-geo-700',
    badgeContainer: 'bg-geo-900/30 border border-geo-500/30',
    glass:
      'bg-gradient-to-br from-geo-500/[0.02] via-transparent to-transparent backdrop-blur-md border border-geo-500/[0.08]',
    animation: 'geo',
    glow: 'geoGlow',
    hex: '#f1c40f',
    rawColor: 'yellow-600',
  },
  dendro: {
    bg: 'bg-dendro-900/30',
    bgStrong: 'bg-dendro-900/50',
    text: 'text-dendro-300',
    textLight: 'text-dendro-200',
    textAccent: 'text-dendro-400',
    border: 'border-dendro-500/40',
    borderSoft: 'border-dendro-500/30',
    hoverBorder: 'hover:border-dendro-400/50',
    indicator: 'bg-dendro-400',
    gradientFrom: 'from-dendro-500/20 via-dendro-400/15 to-transparent',
    levelGradient: 'from-dendro-500 to-dendro-700',
    badgeContainer: 'bg-dendro-900/30 border border-dendro-500/30',
    glass:
      'bg-gradient-to-br from-dendro-500/[0.02] via-transparent to-transparent backdrop-blur-md border border-dendro-500/[0.08]',
    animation: 'dendro',
    glow: 'dendroGlow',
    hex: '#2ecc71',
    rawColor: 'green-500',
  },
} as const;

/** Fallback element colors for unknown/missing elements. */
export const ELEMENT_FALLBACK: ElementColorEntry = {
  bg: 'bg-midnight-900/30',
  bgStrong: 'bg-midnight-900/50',
  text: 'text-muted-foreground',
  textLight: 'text-muted-foreground',
  textAccent: 'text-muted-foreground',
  border: 'border-midnight-500/40',
  borderSoft: 'border-midnight-500/30',
  hoverBorder: 'hover:border-midnight-400/50',
  indicator: 'bg-midnight-400',
  gradientFrom: 'from-celestial-500/20 via-celestial-400/15 to-transparent',
  levelGradient: 'from-celestial-600 to-celestial-800',
  badgeContainer: 'bg-midnight-900/50 border border-midnight-500/30',
  glass:
    'bg-gradient-to-br from-gray-400/[0.02] via-transparent to-transparent backdrop-blur-md border border-gray-400/[0.08]',
  animation: '',
  glow: '',
  hex: '#000000',
  rawColor: 'gray-400',
};

/** Rarity-specific Tailwind class palette. Keys are rarity integers 1–5. */
export const RARITY_COLORS: Record<Rarity, RarityColorEntry> = {
  5: {
    text: 'text-legendary-400',
    textStrong: 'text-legendary-500',
    textBadge: 'text-legendary-300',
    border: 'border-legendary-500',
    borderActive: 'border-legendary-500/40',
    borderSoft: 'border-legendary-600/30',
    borderLight: 'border-legendary-500/50',
    bg: 'bg-legendary-500/10',
    bgStrong: 'bg-legendary-900/30',
    gradientFrom: 'from-legendary-500/20 via-legendary-400/15 to-transparent',
    indicator: 'bg-legendary-400',
    name: 'legendary',
    animation: 'legendary',
    glow: 'legendaryGlow',
    hex: '#D4A84B',
    starGlow: 'drop-shadow-[0_0_4px_rgba(212,168,75,0.7)]',
    rawColor: 'amber-500',
    legacyStarColor: 'text-amber-400',
    legacyBorderClass:
      'border-4 border-amber-500/60 shadow-lg shadow-amber-500/20',
    legacyGlassClass:
      'bg-gradient-to-br from-amber-500/[0.08] via-yellow-500/[0.03] to-transparent backdrop-blur-md',
  },
  4: {
    text: 'text-epic-400',
    textStrong: 'text-epic-500',
    textBadge: 'text-epic-300',
    border: 'border-epic-500',
    borderActive: 'border-epic-500/40',
    borderSoft: 'border-epic-600/30',
    borderLight: 'border-epic-500/50',
    bg: 'bg-epic-500/10',
    bgStrong: 'bg-epic-900/30',
    gradientFrom: 'from-epic-500/20 via-epic-400/15 to-transparent',
    indicator: 'bg-epic-400',
    name: 'epic',
    animation: 'epic',
    glow: 'epicGlow',
    hex: '#A855F7',
    starGlow: 'drop-shadow-[0_0_4px_rgba(168,85,247,0.7)]',
    rawColor: 'violet-500',
    legacyStarColor: 'text-violet-400',
    legacyBorderClass:
      'border-4 border-violet-500/60 shadow-lg shadow-violet-500/20',
    legacyGlassClass:
      'bg-gradient-to-br from-violet-500/[0.08] via-purple-500/[0.03] to-transparent backdrop-blur-md',
  },
  3: {
    text: 'text-rare-400',
    textStrong: 'text-rare-500',
    textBadge: 'text-rare-300',
    border: 'border-rare-500',
    borderActive: 'border-rare-500/40',
    borderSoft: 'border-rare-600/30',
    borderLight: 'border-rare-500/50',
    bg: 'bg-rare-500/10',
    bgStrong: 'bg-rare-900/30',
    gradientFrom: 'from-rare-500/20 via-rare-400/15 to-transparent',
    indicator: 'bg-rare-400',
    name: 'rare',
    animation: 'rare',
    glow: 'rareGlow',
    hex: '#3B82F6',
    starGlow: '',
    rawColor: 'blue-500',
    legacyStarColor: 'text-blue-400',
    legacyBorderClass:
      'border-2 border-blue-500/50 shadow-md shadow-blue-500/15',
    legacyGlassClass:
      'bg-gradient-to-br from-blue-500/[0.05] via-transparent to-transparent backdrop-blur-sm',
  },
  2: {
    text: 'text-uncommon-400',
    textStrong: 'text-uncommon-500',
    textBadge: 'text-uncommon-300',
    border: 'border-uncommon-500',
    borderActive: 'border-uncommon-500/40',
    borderSoft: 'border-uncommon-600/30',
    borderLight: 'border-uncommon-500/50',
    bg: 'bg-uncommon-500/10',
    bgStrong: 'bg-uncommon-900/30',
    gradientFrom: 'from-uncommon-500/20 via-uncommon-400/15 to-transparent',
    indicator: 'bg-uncommon-400',
    name: 'uncommon',
    animation: 'uncommon',
    glow: 'uncommonGlow',
    hex: '#22C55E',
    starGlow: '',
    rawColor: 'green-500',
    legacyStarColor: 'text-green-400',
    legacyBorderClass:
      'border-2 border-green-500/50 shadow-md shadow-green-500/15',
    legacyGlassClass:
      'bg-gradient-to-br from-green-500/[0.05] via-transparent to-transparent backdrop-blur-sm',
  },
  1: {
    text: 'text-common-400',
    textStrong: 'text-common-500',
    textBadge: 'text-common-300',
    border: 'border-common-500',
    borderActive: 'border-common-500/40',
    borderSoft: 'border-common-600/30',
    borderLight: 'border-common-500/50',
    bg: 'bg-common-500/10',
    bgStrong: 'bg-common-900/30',
    gradientFrom: 'from-common-500/20 via-common-400/15 to-transparent',
    indicator: 'bg-common-400',
    name: 'common',
    animation: 'common',
    glow: 'commonGlow',
    hex: '#9CA3AF',
    starGlow: '',
    rawColor: 'gray-400',
    legacyStarColor: 'text-gray-400',
    legacyBorderClass: 'border border-gray-400/40 shadow-sm',
    legacyGlassClass:
      'bg-gradient-to-br from-gray-400/[0.03] via-transparent to-transparent',
  },
} as const;

/** Fallback rarity colors for out-of-range values. */
export const RARITY_FALLBACK = RARITY_COLORS[1];

/* ─────────────────────────────────────────────────────────────
   Element helper functions
   These are the canonical helpers. All other helpers in the
   codebase should delegate to these.
───────────────────────────────────────────────────────────── */

/** Normalises an element string and looks up its color entry, or returns the fallback. */
export function getElementEntry(element?: string): ElementColorEntry {
  if (!element) return ELEMENT_FALLBACK;
  return ELEMENT_COLORS[element.toLowerCase() as Element] ?? ELEMENT_FALLBACK;
}

/** Background tint class for an element-themed container. */
export function getElementBgClass(element?: string): string {
  return getElementEntry(element).bg;
}

/** Mid-toned text class for an element. */
export function getElementTextClass(element?: string): string {
  return getElementEntry(element).text;
}

/** Border class at medium opacity for an element. */
export function getElementBorderClass(element?: string): string {
  return getElementEntry(element).border;
}

/**
 * Returns the combined badge pill classes (bg + border) for an element.
 * Equivalent to the former ELEMENT_BADGE_MAP in element-helpers.ts.
 */
export function getElementBadgeClass(element?: string): string {
  const entry = getElementEntry(element);
  if (!element || !ELEMENT_COLORS[element.toLowerCase() as Element]) {
    return 'bg-midnight-900/50 text-midnight-200 border-midnight-500/30';
  }
  return `${entry.bgStrong} ${entry.textLight} ${entry.borderSoft}`;
}

/** Glassmorphism background for element-tinted cards. */
export function getElementGlassClass(element: string): string {
  return getElementEntry(element).glass;
}

/** CSS module animation class name for an element. */
export function getElementAnimationClass(element: string): string {
  return getElementEntry(element).animation;
}

/** CSS module hover-glow class name for an element. */
export function getElementGlowClass(element: string): string {
  return getElementEntry(element).glow;
}

/** Primary hex color for inline styles. Equivalent to former `decideColor()`. */
export function getElementHexColor(element: string): string {
  return getElementEntry(element).hex;
}

/**
 * Legacy helper — returns a raw Tailwind color token (no prefix, e.g. 'red-500').
 * New code should use `getElementHexColor()` or a specific class field instead.
 */
export function getElementColor(element: string): string {
  return getElementEntry(element).rawColor;
}

/* ─────────────────────────────────────────────────────────────
   Rarity helper functions
───────────────────────────────────────────────────────────── */

/** Normalises a rarity value and looks up its color entry, or returns the fallback. */
export function getRarityEntry(rarity: number | string): RarityColorEntry {
  const n = Math.min(
    Math.max(Number.parseInt(String(rarity), 10) || 1, 1),
    5
  ) as Rarity;
  return RARITY_COLORS[n] ?? RARITY_FALLBACK;
}

/** Border class string from `element-helpers.ts` style. */
export function getRarityBorderClass(rarity?: string | number): string {
  if (rarity === undefined) return RARITY_FALLBACK.borderLight;
  /** Accept '5-Star' / '4-Star' strings used by version-management */
  if (String(rarity) === '5-Star') return RARITY_COLORS[5].borderLight;
  if (String(rarity) === '4-Star') return RARITY_COLORS[4].borderLight;
  return getRarityEntry(rarity).borderLight;
}

/** Text class from `element-helpers.ts` style. */
export function getRarityTextClass(rarity?: string | number): string {
  if (rarity === undefined) return RARITY_FALLBACK.text;
  if (String(rarity) === '5-Star') return RARITY_COLORS[5].text;
  if (String(rarity) === '4-Star') return RARITY_COLORS[4].text;
  return getRarityEntry(rarity).text;
}

/** Background class from `element-helpers.ts` style. */
export function getRarityBgClass(rarity?: string | number): string {
  if (rarity === undefined) return RARITY_FALLBACK.bgStrong;
  if (String(rarity) === '5-Star') return RARITY_COLORS[5].bgStrong;
  if (String(rarity) === '4-Star') return RARITY_COLORS[4].bgStrong;
  return getRarityEntry(rarity).bgStrong;
}

/** Primary hex color for inline styles. */
export function getRarityHexColor(rarity: number): string {
  return getRarityEntry(rarity).hex;
}

/** CSS module animation class name for a rarity tier. */
export function getRarityAnimationClass(rarity: number): string {
  return getRarityEntry(rarity).animation;
}

/** CSS module hover-glow class name for a rarity tier. */
export function getRarityGlowClass(rarity: number): string {
  return getRarityEntry(rarity).glow;
}

/**
 * Active-state classes for menu items / tab rows (gradient + text + border).
 * Equivalent to the former `getRarityClasses()` in weapons/utils/color-map.ts.
 */
export function getRarityActiveClasses(rarity: number): {
  active: string;
  indicator: string;
} {
  const entry = getRarityEntry(rarity);
  return {
    active: `bg-linear-to-r ${entry.gradientFrom} ${entry.textBadge} ${entry.borderActive}`,
    indicator: entry.indicator,
  };
}
