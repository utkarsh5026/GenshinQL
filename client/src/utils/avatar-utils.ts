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
 * Avatar size to Tailwind class mapping
 */
export const AVATAR_SIZE_CLASSES: Record<AvatarSize, string> = {
  xs: 'w-8 h-8', // 32px
  sm: 'w-10 h-10', // 40px
  md: 'w-12 h-12', // 48px
  lg: 'w-16 h-16', // 64px
  xl: 'w-20 h-20', // 80px
};

/**
 * Avatar name text size mapping
 * Scales text proportionally with avatar size
 */
export const AVATAR_TEXT_CLASSES: Record<AvatarSize, string> = {
  xs: 'text-[8px]', // Extra tiny
  sm: 'text-[10px]', // Current CharacterAvatar default
  md: 'text-xs', // Current WeaponAvatar default
  lg: 'text-sm', // Larger contexts
  xl: 'text-base', // Hero contexts
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
    5: 'border-2 border-amber-500/60 shadow-lg shadow-amber-500/20',
    4: 'border-2 border-violet-500/60 shadow-lg shadow-violet-500/20',
    3: 'border-2 border-blue-500/50 shadow-md shadow-blue-500/15',
    2: 'border-2 border-green-500/50 shadow-md shadow-green-500/15',
    1: 'border border-gray-400/40 shadow-sm',
  };
  return borderMap[rarityNum] || borderMap[1];
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
