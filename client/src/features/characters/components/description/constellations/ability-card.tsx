import React, { memo, useMemo } from 'react';

import { AbilitiesListSplitter, AbilityTag } from '@/components/utils';
import { CachedImage } from '@/features/cache';
import { extractConstellationTags } from '@/features/characters/utils';
import { cn } from '@/lib/utils';

interface AbilityCardProps {
  iconUrl: string;
  iconAlt: string;
  /** Optional overlay badge on the icon (e.g., "+3" for C3/C5 constellations). */
  iconOverlay?: React.ReactNode;
  /** Badge rendered before the name (level circle for constellations, type pill for passives). */
  badge: React.ReactNode;
  name: string;
  /** Optional extra content after the name (e.g., "• Talent Lv. +3" for C3/C5). */
  headerExtra?: React.ReactNode;
  description: string;
  characterName: string;
  /** Additional classes for container (element-themed or type-themed border colors). */
  className?: string;
}

export const AbilityCard = memo<AbilityCardProps>(
  ({
    iconUrl,
    iconAlt,
    iconOverlay,
    badge,
    name,
    headerExtra,
    description,
    characterName,
    className,
  }) => {
    const tags = useMemo(
      () => extractConstellationTags(description),
      [description]
    );

    return (
      <div
        className={cn(
          'group flex gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl sm:rounded-2xl',
          'border-none bg-card hover:bg-card/50 transition-all',
          className
        )}
      >
        <div className="relative shrink-0">
          <CachedImage
            lazy
            className="w-10 h-10 sm:w-11 sm:h-11 object-contain opacity-90"
            src={iconUrl}
            alt={iconAlt}
            skeletonSize="md"
            skeletonShape="circle"
          />
          {iconOverlay && (
            <div className="absolute -top-0.5 -right-0.5">{iconOverlay}</div>
          )}
        </div>

        <div className="flex-1 min-w-0 space-y-1.5 sm:space-y-2">
          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
            {badge}
            <h3 className="text-xs sm:text-sm md:text-md font-semibold text-foreground/90">
              {name}
            </h3>
            {headerExtra}
          </div>

          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {tags.map((tagId) => (
                <AbilityTag key={tagId} tagId={tagId} size="xs" />
              ))}
            </div>
          )}

          <AbilitiesListSplitter
            text={description}
            characterName={characterName}
          />
        </div>
      </div>
    );
  }
);

AbilityCard.displayName = 'AbilityCard';
