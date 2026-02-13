import React, { memo } from 'react';

import { SUBSTAT_ICONS, TIER_ICONS } from '../constants';
import type { SubstatType, WeaponTier } from '../types';

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
