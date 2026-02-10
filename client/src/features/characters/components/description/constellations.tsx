import React, { useMemo } from 'react';

import { AbilityTag } from '@/components/utils';
import EnhancedListSplitter from '@/components/utils/EnhancedListSplitter';
import { CachedImage } from '@/features/cache';
import { extractConstellationTags } from '@/lib/constellationTags';

import type { Constellation } from '../../types';

const getElementClasses = (element?: string) => {
  const elementLower = element?.toLowerCase() ?? '';
  const elementClassMap: Record<
    string,
    {
      border: string;
      hoverBorder: string;
      levelGradient: string;
      accent: string;
    }
  > = {
    anemo: {
      border: 'border-anemo-500/30',
      hoverBorder: 'hover:border-anemo-400/50',
      levelGradient: 'from-anemo-500 to-anemo-700',
      accent: 'text-anemo-400',
    },
    pyro: {
      border: 'border-pyro-500/30',
      hoverBorder: 'hover:border-pyro-400/50',
      levelGradient: 'from-pyro-500 to-pyro-700',
      accent: 'text-pyro-400',
    },
    hydro: {
      border: 'border-hydro-500/30',
      hoverBorder: 'hover:border-hydro-400/50',
      levelGradient: 'from-hydro-500 to-hydro-700',
      accent: 'text-hydro-400',
    },
    electro: {
      border: 'border-electro-500/30',
      hoverBorder: 'hover:border-electro-400/50',
      levelGradient: 'from-electro-500 to-electro-700',
      accent: 'text-electro-400',
    },
    cryo: {
      border: 'border-cryo-500/30',
      hoverBorder: 'hover:border-cryo-400/50',
      levelGradient: 'from-cryo-500 to-cryo-700',
      accent: 'text-cryo-400',
    },
    geo: {
      border: 'border-geo-500/30',
      hoverBorder: 'hover:border-geo-400/50',
      levelGradient: 'from-geo-500 to-geo-700',
      accent: 'text-geo-400',
    },
    dendro: {
      border: 'border-dendro-500/30',
      hoverBorder: 'hover:border-dendro-400/50',
      levelGradient: 'from-dendro-500 to-dendro-700',
      accent: 'text-dendro-400',
    },
  };

  return (
    elementClassMap[elementLower] || {
      border: 'border-border/40',
      hoverBorder: 'hover:border-border/60',
      levelGradient: 'from-celestial-600 to-celestial-800',
      accent: 'text-celestial-400',
    }
  );
};

const getConstellationStyles = (level: number) => {
  const talentUpgradeStyle = {
    isTalentUpgrade: true,
  };

  const styles = [
    { isTalentUpgrade: false }, // C1
    { isTalentUpgrade: false }, // C2
    talentUpgradeStyle, // C3
    { isTalentUpgrade: false }, // C4
    talentUpgradeStyle, // C5
    { isTalentUpgrade: false }, // C6
  ];

  return styles[level - 1] || styles[0];
};

interface CharacterConstellationsProps {
  constellations: Constellation[];
  element?: string;
  characterName: string;
}

const CharacterConstellations: React.FC<CharacterConstellationsProps> = ({
  constellations,
  element,
  characterName,
}) => {
  const elementClasses = getElementClasses(element);

  return (
    <div className="flex flex-col gap-2">
      {constellations.map((constellation) => (
        <ConstellationItem
          key={constellation.name}
          constellation={constellation}
          elementClasses={elementClasses}
          characterName={characterName}
        />
      ))}
    </div>
  );
};

/**
 * Inner component for individual constellation with memoized tag extraction.
 */
interface ConstellationItemProps {
  constellation: Constellation;
  elementClasses: ReturnType<typeof getElementClasses>;
  characterName: string;
}

const ConstellationItem: React.FC<ConstellationItemProps> = ({
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
      className={`group flex gap-3 p-3 rounded-2xl border-none bg-card hover:bg-card/50 transition-all ${elementClasses.border} ${elementClasses.hoverBorder}`}
    >
      <div className="relative shrink-0">
        <CachedImage
          lazy
          className="w-10 h-10 object-contain opacity-90"
          src={constellation.iconUrl}
          alt={constellation.name}
          skeletonSize="md"
          skeletonShape="circle"
        />
        {styles.isTalentUpgrade && (
          <div className="absolute -top-0.5 -right-0.5 flex items-center justify-center w-4 h-4 rounded-full bg-success-600 text-white text-[9px] font-bold">
            +3
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 space-y-1.5">
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className={`
              shrink-0 flex items-center justify-center
              w-5 h-5 rounded-full bg-linear-to-br ${elementClasses.levelGradient}
              text-white text-xs font-bold
            `}
          >
            {constellation.level}
          </span>
          <h3 className="text-md font-semibold text-foreground/90">
            {constellation.name}
          </h3>
          {styles.isTalentUpgrade && (
            <span className={`text-xs font-medium ${elementClasses.accent}`}>
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
        <div className="text-xs leading-relaxed text-muted-foreground/80">
          <EnhancedListSplitter
            text={constellation.description}
            characterName={characterName}
          />
        </div>
      </div>
    </div>
  );
};

export default CharacterConstellations;
