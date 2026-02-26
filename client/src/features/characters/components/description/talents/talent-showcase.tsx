import { Clock, Zap } from 'lucide-react';
import React, { useMemo, useState } from 'react';

import { Heading, Text } from '@/components/ui/text';
import { AbilityTag } from '@/components/utils';
import { AnimatedCover } from '@/components/utils';
import { AbilitiesListSplitter } from '@/components/utils';
import { CachedImage } from '@/features/cache';
import { useCharacterTalents } from '@/features/characters/hooks';
import { extractConstellationTags } from '@/features/characters/utils/ability-tags';
import { AnimationMedia } from '@/types';
import { decideColor } from '@/utils/color';

import type { CharacterDetailed, Talent } from '../../../types';
import { TalentScalingTable } from './scaling-table';
interface TalentShowcaseProps {
  character: CharacterDetailed;
}

/**
 * TalentShowcase displays all combat talents in a unified view
 * combining animations, descriptions, and scaling tables
 *
 * Uses the useCharacterTalents hook for centralized talent + animation data access
 */
const TalentShowcase: React.FC<TalentShowcaseProps> = ({ character }) => {
  const { mainTalents } = useCharacterTalents(character);
  const elementColor = decideColor(character.element);

  return (
    <div className="flex flex-col gap-4 sm:gap-6 md:gap-8">
      {mainTalents.map(({ talent, animations, energyCost, cooldown }) => (
        <TalentShowcaseCard
          key={talent.talentName}
          talent={talent}
          animations={animations}
          energyCost={energyCost}
          cooldown={cooldown}
          elementColor={elementColor}
          characterName={character.name}
        />
      ))}
    </div>
  );
};

interface TalentShowcaseCardProps {
  talent: Talent;
  animations: AnimationMedia[];
  energyCost?: string;
  cooldown?: string;
  elementColor: string;
  characterName: string;
}

const TalentShowcaseCard: React.FC<TalentShowcaseCardProps> = ({
  talent,
  animations,
  energyCost,
  cooldown,
  elementColor,
  characterName,
}) => {
  const tags = useMemo(
    () => extractConstellationTags(talent.description),
    [talent.description]
  );

  return (
    <div
      className="rounded-lg sm:rounded-xl overflow-hidden border transition-all duration-300"
      style={{
        borderColor: `${elementColor}30`,
        boxShadow: `0 4px 24px ${elementColor}10`,
      }}
    >
      {/* Header */}
      <div
        className="flex items-center flex-wrap gap-3 sm:gap-4 p-4 sm:p-5 md:p-6"
        style={{
          background: `linear-gradient(135deg, ${elementColor}15 0%, transparent 60%)`,
        }}
      >
        <div
          className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-lg sm:rounded-xl p-1.5 sm:p-2 shrink-0"
          style={{
            background: `linear-gradient(135deg, ${elementColor}25, ${elementColor}10)`,
            boxShadow: `0 0 16px ${elementColor}20`,
          }}
        >
          <CachedImage
            src={talent.talentIcon}
            alt={talent.talentName}
            className="w-full h-full object-contain"
          />
        </div>
        <div className="flex-1 min-w-0">
          <Text
            as="p"
            weight="medium"
            uppercase
            color="muted"
            className="text-[11px] sm:text-xs tracking-wider mb-0.5 sm:mb-1"
          >
            {talent.talentType}
          </Text>
          <Heading
            level={4}
            weight="bold"
            truncate
            className="text-base sm:text-lg md:text-xl"
          >
            {talent.talentName}
          </Heading>
          {/* Tags */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2 sm:mt-2.5">
              {tags.map((tagId) => (
                <AbilityTag key={tagId} tagId={tagId} size="xs" />
              ))}
            </div>
          )}
        </div>
        {/* Stats badges */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {energyCost && (
            <div
              className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 md:px-3 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm font-semibold"
              style={{
                background: `${elementColor}20`,
                color: elementColor,
              }}
            >
              <Zap className="w-3 h-3 sm:w-4 sm:h-4" />
              {energyCost}
            </div>
          )}
          {cooldown && (
            <div className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 md:px-3 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm font-semibold bg-midnight-700/60 text-starlight-300">
              <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
              {cooldown}
            </div>
          )}
        </div>
      </div>

      {/* Content: Animation + Description — stacked vertically */}
      <div className="flex flex-col">
        {/* Animation Section */}
        <div className="bg-midnight-900/40 p-4 sm:p-5 md:p-6">
          {animations.length > 0 ? (
            <Animations animations={animations} />
          ) : (
            <Text
              as="div"
              color="muted"
              className="aspect-video flex items-center justify-center bg-midnight-800/50 rounded-md sm:rounded-lg text-xs sm:text-sm"
            >
              No animation available
            </Text>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2">
          <div className="p-4 sm:p-5 md:p-6">
            <Text
              as="span"
              weight="semibold"
              uppercase
              className="text-xs sm:text-sm text-starlight-300 tracking-wider mb-3 sm:mb-4 block"
            >
              Description
            </Text>
            <div className="text-sm sm:text-base text-starlight-300 leading-relaxed">
              <AbilitiesListSplitter
                text={talent.description}
                characterName={characterName}
              />
            </div>
          </div>

          {/* Scaling Table */}
          <div className="p-4 sm:p-5 md:p-6 bg-midnight-800/10 border-t lg:border-t-0 border-midnight-600/20">
            <Text
              as="span"
              weight="semibold"
              uppercase
              className="text-xs sm:text-sm text-starlight-300 tracking-wider mb-3 sm:mb-4 block"
            >
              Talent Scaling
            </Text>
            <TalentScalingTable talent={talent} elementColor={elementColor} />
          </div>
        </div>
      </div>
    </div>
  );
};

const Animations: React.FC<{ animations: AnimationMedia[] }> = ({
  animations,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentAnimation = animations[currentIndex];

  return (
    <div className="space-y-3 sm:space-y-4 max-w-xl mx-auto">
      {/* Main Animation */}
      <div className="rounded-lg sm:rounded-xl overflow-hidden border border-midnight-600/30">
        <AnimatedCover
          animation={currentAnimation}
          fallbackUrl={currentAnimation?.imageUrl}
        />
      </div>

      {animations.length > 1 && (
        <div className="flex gap-2 sm:gap-2.5 overflow-x-auto scrollbar-hide pb-1">
          {animations.map((anim, index) => (
            <button
              key={anim.imageUrl || index}
              onClick={() => setCurrentIndex(index)}
              className={`shrink-0 w-20 h-12 sm:w-24 sm:h-14 rounded-md sm:rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                index === currentIndex
                  ? 'border-celestial-400 shadow-lg'
                  : 'border-midnight-600/40 hover:border-starlight-500/50 opacity-70 hover:opacity-100'
              }`}
            >
              <CachedImage
                src={anim.imageUrl}
                alt={anim.caption || `Animation ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {/* Caption */}
      {currentAnimation?.caption && (
        <Text
          as="p"
          color="muted"
          align="center"
          className="text-[11px] sm:text-xs"
        >
          {currentAnimation.caption}
        </Text>
      )}
    </div>
  );
};

export default TalentShowcase;
