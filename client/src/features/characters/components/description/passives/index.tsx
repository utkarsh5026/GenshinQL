import React, { useMemo } from 'react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AbilityTag } from '@/components/utils';
import EnhancedListSplitter from '@/components/utils/EnhancedListSplitter';
import { CachedImage } from '@/features/cache';
import { Talent } from '@/features/characters/types';
import { getPassiveStyles, sortPassives } from '@/features/characters/utils';
import { extractConstellationTags } from '@/features/characters/utils/ability-tags';

interface CharacterPassivesProps {
  passives: Talent[];
  characterName: string;
}

/**
 * CharacterPassives component displays a list of passive talents for a character.
 */
export const CharacterPassives: React.FC<CharacterPassivesProps> = ({
  passives,
  characterName,
}) => {
  const passivesWithTags = useMemo(() => {
    return passives.sort(sortPassives).map((passive) => {
      return {
        ...passive,
        tags: extractConstellationTags(passive.description),
      };
    });
  }, [passives]);

  return (
    <div className="flex flex-col gap-5">
      {passivesWithTags.map((passive) => {
        const styles = getPassiveStyles(passive.talentType);
        return (
          <Card
            key={passive.talentName}
            className={`
              group relative overflow-hidden border-2 transition-all duration-300
              ${styles.borderClass} ${styles.bgClass} ${styles.glowClass}
              hover:shadow-lg hover:scale-[1.01] hover:-translate-y-0.5
            `}
          >
            {/* Decorative corner accent */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-linear-to-bl from-white/5 to-transparent pointer-events-none" />

            <CardHeader className="pb-3">
              <div className="flex items-start gap-3">
                {/* Icon with styled background */}
                <div
                  className={`
                  relative shrink-0 rounded-lg p-2 ${styles.iconBgClass}
                  ring-1 ring-white/10 group-hover:ring-white/20 transition-all
                  group-hover:scale-110 duration-300
                `}
                >
                  <CachedImage
                    lazy
                    className="h-10 w-10 drop-shadow-lg"
                    src={passive.talentIcon}
                    alt={passive.talentName}
                    skeletonSize="md"
                    skeletonShape="rounded"
                  />
                  {/* Icon glow effect */}
                  <div className="absolute inset-0 rounded-lg bg-linear-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>

                {/* Title and tag */}
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-lg font-semibold text-foreground/95 mb-2 leading-tight">
                    {passive.talentName}
                  </CardTitle>
                  <span
                    className={`
                    inline-block px-3 py-1 rounded-full text-xs font-medium border
                    ${styles.tagClass} transition-all duration-300
                    group-hover:scale-105
                  `}
                  >
                    {passive.talentType}
                  </span>
                  {/* Tags */}
                  {passive.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {passive.tags.map((tagId) => (
                        <AbilityTag key={tagId} tagId={tagId} size="xs" />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </CardHeader>

            <CardContent className="pt-0">
              {/* Subtle divider */}
              <div className="h-px bg-linear-to-r from-transparent via-white/10 to-transparent mb-4" />

              {/* Description with better typography */}
              <div className="text-sm leading-relaxed text-foreground/80">
                <EnhancedListSplitter
                  text={passive.description}
                  characterName={characterName}
                />
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
