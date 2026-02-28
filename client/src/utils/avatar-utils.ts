/**
 * Shared utilities and types for avatar components (CharacterAvatar, WeaponAvatar)
 * Provides consistent sizing, styling, and positioning across avatar implementations
 */

// ============================================================================
// Types
// ============================================================================

/**
 * Avatar size variants
 * - xs: 32px - Compact lists, dense layouts
 * - sm: 40px - Default for CharacterAvatar
 * - md: 48px - Default for WeaponAvatar
 * - lg: 64px - Featured items, larger contexts
 * - xl: 80px - Hero sections, prominent displays
 */
export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

/**
 * Name display position options
 * - bottom: Below avatar (default, current behavior)
 * - tooltip: Only in hover tooltip (saves space)
 * - none: No name display
 */
export type NamePosition = 'bottom' | 'tooltip' | 'none';

/**
 * Badge overlay position options
 * Positions badge absolutely at specified corner
 */
export type BadgePosition =
  | 'top-left'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-right';

// ============================================================================
// Size Mappings
// ============================================================================

/**
 * Responsive avatar size to Tailwind class mapping.
 *
 * Each variant uses a mobile-first responsive pair: a compact size at the
 * base (mobile) breakpoint and a slightly larger size at sm: (≥640px) and up.
 * This ensures avatars look appropriately sized on every device without any
 * additional configuration in the consuming component.
 *
 * Size chart (mobile → desktop):
 * - xs  : 24px  → 32px  — Ultra-compact lists
 * - sm  : 32px  → 40px  — Default CharacterAvatar
 * - md  : 40px  → 48px  — Default WeaponAvatar
 * - lg  : 48px  → 64px  — Featured / prominent displays
 * - xl  : 64px  → 80px  — Hero sections
 */
export const AVATAR_SIZE_CLASSES: Record<AvatarSize, string> = {
  xs: 'w-6 h-6 sm:w-8 sm:h-8',
  sm: 'w-8 h-8 sm:w-10 sm:h-10',
  md: 'w-10 h-10 sm:w-12 sm:h-12',
  lg: 'w-12 h-12 sm:w-16 sm:h-16',
  xl: 'w-16 h-16 sm:w-20 sm:h-20',
};

/**
 * Responsive avatar name text size mapping.
 * Scales text proportionally with avatar size and device.
 */
export const AVATAR_TEXT_CLASSES: Record<AvatarSize, string> = {
  xs: 'text-[7px] sm:text-[8px]',
  sm: 'text-[8px] sm:text-[10px]',
  md: 'text-[10px] sm:text-xs',
  lg: 'text-xs sm:text-sm',
  xl: 'text-sm sm:text-base',
};

/**
 * Badge position to Tailwind positioning classes
 */
export const BADGE_POSITION_CLASSES: Record<BadgePosition, string> = {
  'top-left': '-top-1 -left-1',
  'top-right': '-top-1 -right-1',
  'bottom-left': '-bottom-1 -left-1',
  'bottom-right': '-bottom-1 -right-1',
};

// ============================================================================
// Rarity Styling Functions
// ============================================================================

/**
 * Get border class for character/weapon cards based on rarity
 * Provides consistent rarity-based border styling across avatar components
 *
 * @param rarity - Rarity level (1-5, string or number)
 * @returns Tailwind border classes with shadows
 */
export function getRarityBorderClass(rarity: string | number): string {
  const rarityNum = typeof rarity === 'string' ? parseInt(rarity) : rarity;
  const borderMap: Record<number, string> = {
    5: 'border-2 border-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.5)]',
    4: 'border-2 border-violet-400 shadow-[0_0_12px_rgba(139,92,246,0.5)]',
    3: 'border-2 border-blue-400 shadow-[0_0_12px_rgba(59,130,246,0.5)]',
    2: 'border-2 border-green-400 shadow-[0_0_12px_rgba(34,197,94,0.5)]',
    1: 'border border-gray-400/80 shadow-sm',
  };
  return borderMap[rarityNum] || borderMap[1];
}

/**
 * Get background gradient class for avatar based on rarity
 * Provides rich, dynamic backgrounds for premium feel
 *
 * @param rarity - Rarity level (1-5, string or number)
 * @returns Tailwind gradient classes
 */
export function getRarityGradientClass(rarity: string | number): string {
  const rarityNum = typeof rarity === 'string' ? parseInt(rarity) : rarity;
  const gradientMap: Record<number, string> = {
    5: 'bg-gradient-to-br from-amber-200 via-amber-500/70 to-amber-700 dark:from-amber-600/70 dark:via-amber-800/60 dark:to-stone-900',
    4: 'bg-gradient-to-br from-violet-300 via-violet-500/70 to-violet-800 dark:from-violet-600/70 dark:via-violet-800/60 dark:to-stone-900',
    3: 'bg-gradient-to-br from-blue-200 via-blue-500/70 to-blue-800 dark:from-blue-600/70 dark:via-blue-800/60 dark:to-stone-900',
    2: 'bg-gradient-to-br from-green-200 via-green-500/70 to-green-800 dark:from-green-600/70 dark:via-green-800/60 dark:to-stone-900',
    1: 'bg-gradient-to-br from-gray-200 via-gray-400/70 to-gray-600 dark:from-gray-600/70 dark:via-gray-800/60 dark:to-stone-900',
  };
  return gradientMap[rarityNum] || gradientMap[1];
}

/**
 * Get background color class for avatar based on rarity
 * Uses theme-consistent rarity colors with dark mode support
 *
 * @param rarity - Rarity level (1-5, string or number)
 * @returns Tailwind background classes with dark mode variants
 */
export function getRarityBgClass(rarity: string | number): string {
  const rarityNum = typeof rarity === 'string' ? parseInt(rarity) : rarity;
  const bgMap: Record<number, string> = {
    5: 'bg-legendary-600/50 dark:bg-legendary-700/40',
    4: 'bg-epic-600/50 dark:bg-epic-700/40',
    3: 'bg-rare-500/40 dark:bg-rare-600/40',
    2: 'bg-uncommon-500/40 dark:bg-uncommon-600/40',
    1: 'bg-common-400/30 dark:bg-common-600/30',
  };
  return bgMap[rarityNum] || bgMap[1];
}
