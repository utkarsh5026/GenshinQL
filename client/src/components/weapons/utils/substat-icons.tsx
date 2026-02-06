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
import React, { memo } from 'react';

import type { SubstatType, WeaponTier } from './substat-utils';

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

interface SubstatIconProps {
  type: SubstatType;
  size?: number;
  className?: string;
}

/**
 * Renders the appropriate icon for a substat type.
 */
export const SubstatIcon: React.FC<SubstatIconProps> = memo(
  ({ type, size = 14, className = '' }) => {
    const Icon = SUBSTAT_ICONS[type];
    if (!Icon || type === 'None') return null;
    return <Icon size={size} className={className} />;
  }
);

SubstatIcon.displayName = 'SubstatIcon';

interface TierIconProps {
  tier: WeaponTier;
  size?: number;
  className?: string;
}

/**
 * Renders the appropriate icon for a weapon tier.
 */
export const TierIcon: React.FC<TierIconProps> = memo(
  ({ tier, size = 12, className = '' }) => {
    const Icon = TIER_ICONS[tier];
    return <Icon size={size} className={className} />;
  }
);

TierIcon.displayName = 'TierIcon';
