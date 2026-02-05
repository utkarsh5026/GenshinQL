import { ChevronDown, ChevronUp, Clock, Zap } from 'lucide-react';
import React, { useMemo, useState } from 'react';

import { CachedImage } from '@/components/utils/CachedImage';
import ListSplitter from '@/components/utils/list-splitter';
import { extractConstellationTags } from '@/lib/constellationTags';
import { useCharacterTalents } from '@/stores/useCharactersStore';
import type { AnimationMedia, CharacterDetailed, Talent } from '@/types';
import { decideColor } from '@/utils/color';

import { AnimatedCover } from '../../utils/AnimatedCover';
import { AbilityTag } from '../utils/AbilityTag';
import { TalentScalingTable } from './TalentScalingTable';

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
  const { mainTalents, loading } = useCharacterTalents(character);
  const elementColor = decideColor(character.element);

  return (
    <div className="flex flex-col gap-8">
      {mainTalents.map(({ talent, animations, energyCost, cooldown }) => (
        <TalentShowcaseCard
          key={talent.talentName}
          talent={talent}
          animations={animations}
          energyCost={energyCost}
          cooldown={cooldown}
          elementColor={elementColor}
          loading={loading}
        />
      ))}
    </div>
  );
};

/* ===================== Talent Showcase Card ===================== */

interface TalentShowcaseCardProps {
  talent: Talent;
  animations: AnimationMedia[];
  energyCost?: string;
  cooldown?: string;
  elementColor: string;
  loading: boolean;
}

const TalentShowcaseCard: React.FC<TalentShowcaseCardProps> = ({
  talent,
  animations,
  energyCost,
  cooldown,
  elementColor,
  loading,
}) => {
  const [currentAnimationIndex, setCurrentAnimationIndex] = useState(0);
  const [showScaling, setShowScaling] = useState(false);

  const currentAnimation = animations[currentAnimationIndex];
  const tags = useMemo(
    () => extractConstellationTags(talent.description),
    [talent.description]
  );

  return (
    <div
      className="rounded-xl overflow-hidden border transition-all duration-300"
      style={{
        borderColor: `${elementColor}30`,
        boxShadow: `0 4px 24px ${elementColor}10`,
      }}
    >
      {/* Header */}
      <div
        className="flex items-center gap-4 p-4"
        style={{
          background: `linear-gradient(135deg, ${elementColor}15 0%, transparent 60%)`,
        }}
      >
        <div
          className="w-14 h-14 rounded-xl p-2 shrink-0"
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
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-0.5">
            {talent.talentType}
          </p>
          <h4 className="text-lg font-bold text-foreground truncate">
            {talent.talentName}
          </h4>
          {/* Tags */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {tags.map((tagId) => (
                <AbilityTag key={tagId} tagId={tagId} size="xs" />
              ))}
            </div>
          )}
        </div>
        {/* Stats badges */}
        <div className="flex items-center gap-2 shrink-0">
          {energyCost && (
            <div
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold"
              style={{
                background: `${elementColor}20`,
                color: elementColor,
              }}
            >
              <Zap className="w-4 h-4" />
              {energyCost}
            </div>
          )}
          {cooldown && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold bg-midnight-700/60 text-starlight-300">
              <Clock className="w-4 h-4" />
              {cooldown}
            </div>
          )}
        </div>
      </div>

      {/* Content: Animation + Description */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
        {/* Animation Section */}
        <div className="bg-midnight-900/40 p-4">
          {loading ? (
            <AnimationSkeleton />
          ) : animations.length > 0 ? (
            <div className="space-y-3">
              {/* Main Animation */}
              <div className="rounded-lg overflow-hidden border border-midnight-600/30">
                <AnimatedCover
                  animation={currentAnimation}
                  fallbackUrl={currentAnimation?.imageUrl}
                  aspectRatio="16/9"
                  showLoadingIndicator={true}
                />
              </div>

              {/* Animation Thumbnails */}
              {animations.length > 1 && (
                <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
                  {animations.map((anim, index) => (
                    <button
                      key={anim.imageUrl || index}
                      onClick={() => setCurrentAnimationIndex(index)}
                      className={`shrink-0 w-20 h-12 rounded-md overflow-hidden border-2 transition-all duration-200 ${
                        index === currentAnimationIndex
                          ? 'border-celestial-400 shadow-lg'
                          : 'border-midnight-600/40 hover:border-starlight-500/50 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img
                        src={anim.imageUrl}
                        alt={anim.caption || `Animation ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}

              {/* Animation Caption */}
              {currentAnimation?.caption && (
                <p className="text-xs text-muted-foreground text-center">
                  {currentAnimation.caption}
                </p>
              )}
            </div>
          ) : (
            <div className="aspect-video flex items-center justify-center bg-midnight-800/50 rounded-lg text-muted-foreground text-sm">
              No animation available
            </div>
          )}
        </div>

        {/* Description Section */}
        <div className="p-5 bg-midnight-800/20 flex flex-col">
          <div className="flex-1 overflow-auto max-h-[300px] scrollbar-hide">
            <div className="text-sm text-starlight-300 leading-relaxed">
              <ListSplitter text={talent.description} />
            </div>
          </div>
        </div>
      </div>

      {/* Scaling Table (Expandable) */}
      <div className="border-t border-midnight-600/30">
        <button
          onClick={() => setShowScaling(!showScaling)}
          className="w-full flex items-center justify-between p-4 hover:bg-midnight-700/30 transition-colors"
        >
          <span className="text-sm font-semibold text-starlight-300 uppercase tracking-wider">
            Talent Scaling
          </span>
          {showScaling ? (
            <ChevronUp className="w-5 h-5 text-muted-foreground" />
          ) : (
            <ChevronDown className="w-5 h-5 text-muted-foreground" />
          )}
        </button>

        {showScaling && (
          <div className="px-8 pb-4">
            <TalentScalingTable talent={talent} elementColor={elementColor} />
          </div>
        )}
      </div>
    </div>
  );
};

/* ===================== Animation Skeleton ===================== */

const AnimationSkeleton: React.FC = () => (
  <div className="space-y-3 animate-pulse">
    <div className="aspect-video bg-midnight-700/50 rounded-lg" />
    <div className="flex gap-2">
      {[1, 2, 3].map((i) => (
        <div key={i} className="w-20 h-12 bg-midnight-700/40 rounded-md" />
      ))}
    </div>
  </div>
);

export default TalentShowcase;
