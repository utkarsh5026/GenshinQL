/**
 * Element color helpers — thin wrappers delegating to `@/lib/game-colors`.
 *
 * All maps now live in `game-colors.ts`. Import directly from there in new code:
 *   import { ELEMENT_COLORS, getElementGlassClass } from '@/lib/game-colors';
 */

import {
  getElementAnimationClass as _getElementAnimationClass,
  getElementColor as _getElementColor,
  getElementGlassClass as _getElementGlassClass,
  getElementGlowClass as _getElementGlowClass,
} from '@/lib/game-colors';

export const getElementColor = _getElementColor;
export const getElementGlassClass = _getElementGlassClass;
export const getElementAnimationClass = _getElementAnimationClass;
export const getElementGlowClass = _getElementGlowClass;
