/**
 * Rarity color helpers — thin wrappers delegating to `@/lib/game-colors`.
 *
 * All maps now live in `game-colors.ts`. Import directly from there in new code:
 *   import { RARITY_COLORS, getRarityHexColor } from '@/lib/game-colors';
 */

import {
  getRarityAnimationClass as _getRarityAnimationClass,
  getRarityEntry,
  getRarityGlowClass as _getRarityGlowClass,
} from '@/lib/game-colors';

/** @deprecated Use `RARITY_COLORS[rarity].rawColor` from `@/lib/game-colors`. */
export const getRarityColor = (rarity: number): string =>
  getRarityEntry(rarity).rawColor;

/** @deprecated Use `RARITY_COLORS[rarity].legacyBorderClass` from `@/lib/game-colors`. */
export const getRarityBorderClass = (rarity: number): string =>
  getRarityEntry(rarity).legacyBorderClass;

/** @deprecated Use `RARITY_COLORS[rarity].legacyGlassClass` from `@/lib/game-colors`. */
export const getRarityGlassClass = (rarity: number): string =>
  getRarityEntry(rarity).legacyGlassClass;

export const getRarityAnimationClass = _getRarityAnimationClass;
export const getRarityGlowClass = _getRarityGlowClass;

/** @deprecated Use `RARITY_COLORS[rarity].legacyStarColor` from `@/lib/game-colors`. */
export const getRarityStarColor = (rarity: number): string =>
  getRarityEntry(rarity).legacyStarColor;
