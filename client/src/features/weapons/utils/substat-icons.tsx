import React, { memo } from 'react';

import { CachedImage } from '@/features/cache';
import { cn } from '@/lib/utils';
import { useAttributesMap } from '@/stores/usePrimitivesStore';

import { SUBSTAT_ICONS, TIER_ICONS } from '../constants';
import type { SubstatType, WeaponTier } from '../types';

interface SubstatIconProps {
  type: SubstatType;
  size?: number;
  className?: string;
}

/**
 * Renders the appropriate icon for a substat type.
 * Uses CachedImage for attributes from primitives.json,
 * falls back to Lucide icons for Physical DMG Bonus.
 */
export const SubstatIcon: React.FC<SubstatIconProps> = memo(
  ({ type, size = 14, className = '' }) => {
    const { attributeUrlMap } = useAttributesMap();

    if (type === 'None') return null;

    // Try CachedImage first (for stats in primitives)
    const attributeUrl = attributeUrlMap[type];
    if (attributeUrl) {
      return (
        <CachedImage
          src={attributeUrl}
          alt={type}
          className={cn('inline-block', className)}
          style={{ width: size, height: size }}
          lazy={false}
          showSkeleton={false}
        />
      );
    }

    // Fallback to Lucide for Physical DMG Bonus
    const Icon = SUBSTAT_ICONS[type];
    if (!Icon) return null;
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
