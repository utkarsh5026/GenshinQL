import {
  Activity,
  BarChart3,
  Battery,
  FlaskConical,
  Heart,
  Minus,
  Scale,
  Shield,
  Sparkles,
  Sword,
  Target,
} from 'lucide-react';
import React from 'react';

import type { SubstatType, WeaponTier } from '../types';

/**
 * Icon mapping for each substat type.
 * Maps to Lucide React components.
 */
export const SUBSTAT_ICONS: Record<SubstatType, React.ElementType> = {
  'CRIT Rate': Target,
  'CRIT DMG': Sparkles,
  ATK: Sword,
  HP: Heart,
  DEF: Shield,
  'Energy Recharge': Battery,
  'Elemental Mastery': FlaskConical,
  'Physical DMG Bonus': Activity,
  None: Minus,
};

/**
 * Icon mapping for weapon tier classification.
 */
export const TIER_ICONS: Record<WeaponTier, React.ElementType> = {
  'high-atk': Sword,
  balanced: Scale,
  'high-substat': BarChart3,
};
