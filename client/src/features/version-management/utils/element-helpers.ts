/**
 * Element and rarity helper functions for the version-management feature.
 * All color maps are sourced from the central `@/lib/game-colors`.
 */

import {
  getElementBadgeClass,
  getElementBgClass,
  getElementBorderClass,
  getElementTextClass,
  getRarityBgClass,
  getRarityBorderClass,
  getRarityTextClass,
} from '@/lib/game-colors';

export {
  getElementBadgeClass,
  getElementBgClass,
  getElementBorderClass,
  getElementTextClass,
  getRarityBgClass,
  getRarityBorderClass,
  getRarityTextClass,
};

/** Strips soft hyphens (U+00AD) from a string. */
export function stripSoftHyphens(text: string): string {
  return text.replace(/\u00AD/g, '');
}
