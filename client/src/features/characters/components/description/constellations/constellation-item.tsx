import React, { useMemo } from 'react';

import { AbilityTag } from '@/components/utils';
import { AbilitiesListSplitter } from '@/components/utils';
import { CachedImage } from '@/features/cache';
import {
  extractConstellationTags,
  getConstellationStyles,
  getElementClasses,
} from '@/features/characters/utils';

import type { Constellation } from '../../../types';

/**
 * Inner component for individual constellation with memoized tag extraction.
 */
interface ConstellationItemProps {
  constellation: Constellation;
  elementClasses: ReturnType<typeof getElementClasses>;
  characterName: string;
}

export const ConstellationItem: React.FC<ConstellationItemProps> = ({
  constellation,
  elementClasses,
  characterName,
}) => {
  const styles = getConstellationStyles(constellation.level);
  const tags = useMemo(
    () => extractConstellationTags(constellation.description),
    [constellation.description]
  );

  return (
    <div
      className={`group flex gap-2 sm:gap-3 p-2 sm:p-3 rounded-xl sm:rounded-2xl border-none bg-card hover:bg-card/50 transition-all ${elementClasses.border} ${elementClasses.hoverBorder}`}
    >
      <div className="relative shrink-0">
        <CachedImage
          lazy
          className="w-8 h-8 sm:w-10 sm:h-10 object-contain opacity-90"
          src={constellation.iconUrl}
          alt={constellation.name}
          skeletonSize="md"
          skeletonShape="circle"
        />
        {styles.isTalentUpgrade && (
          <div className="absolute -top-0.5 -right-0.5 flex items-center justify-center w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-success-600 text-white text-[8px] sm:text-[9px] font-bold">
            +3
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 space-y-1 sm:space-y-1.5">
        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
          <span
            className={`
              shrink-0 flex items-center justify-center
              w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-linear-to-br ${elementClasses.levelGradient}
              text-white text-[10px] sm:text-xs font-bold
            `}
          >
            {constellation.level}
          </span>
          <h3 className="text-xs sm:text-sm md:text-md font-semibold text-foreground/90">
            {constellation.name}
          </h3>
          {styles.isTalentUpgrade && (
            <span
              className={`text-[10px] sm:text-xs font-medium ${elementClasses.accent}`}
            >
              • Talent Lv. +3
            </span>
          )}
        </div>

        {/* Tags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {tags.map((tagId) => (
              <AbilityTag key={tagId} tagId={tagId} size="xs" />
            ))}
          </div>
        )}

        {/* Description */}
        <div className="text-[11px] sm:text-xs leading-relaxed text-muted-foreground/80">
          <AbilitiesListSplitter
            text={constellation.description}
            characterName={characterName}
          />
        </div>
      </div>
    </div>
  );
};
