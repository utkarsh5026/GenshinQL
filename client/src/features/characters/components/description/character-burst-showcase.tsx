import { Clock, Zap } from 'lucide-react';
import React from 'react';

import { TextProcessor } from '@/components/utils';
import AnimatedCover from '@/components/utils/AnimatedCover';
import { CachedImage } from '@/features/cache';
import { useCharacterTalents } from '@/stores/useCharactersStore';
import { CharacterDetailed, CharacterMenuItem } from '@/types';
import { formatDescription } from '@/utils/text-sanitize';

/* Elemental Burst Showcase Component */
interface ElementalBurstShowcaseProps {
  character: CharacterDetailed;
  elementColor: string;
  onNavigate: (menuItem: CharacterMenuItem) => void;
}

const ElementalBurstShowcase: React.FC<ElementalBurstShowcaseProps> = ({
  character,
  elementColor,
  onNavigate,
}) => {
  const { elementalBurst, loading } = useCharacterTalents(character);
  if (!elementalBurst) return null;

  const { talent, animations, energyCost, cooldown } = elementalBurst;
  const currentAnimation = animations[0];

  if (loading) {
    return (
      <div
        className="rounded-xl overflow-hidden border transition-all duration-300"
        style={{
          borderColor: `${elementColor}40`,
          boxShadow: `0 4px 20px ${elementColor}15`,
        }}
      >
        <div className="aspect-video bg-midnight-900/50 animate-pulse flex items-center justify-center">
          <p className="text-sm text-muted-foreground">
            Loading burst details...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="rounded-xl overflow-hidden border transition-all duration-300 hover:shadow-lg"
      style={{
        borderColor: `${elementColor}40`,
        boxShadow: `0 4px 20px ${elementColor}15`,
      }}
    >
      {/* Header with icon and name */}
      <div
        className="flex items-center gap-4 p-4"
        style={{
          background: `linear-gradient(135deg, ${elementColor}20 0%, transparent 50%)`,
        }}
      >
        <div
          className="w-14 h-14 rounded-xl p-2 shrink-0"
          style={{
            background: `linear-gradient(135deg, ${elementColor}30, ${elementColor}10)`,
            boxShadow: `0 0 20px ${elementColor}20`,
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
        </div>
        {/* Stats badges */}
        <div className="flex items-center gap-2">
          {energyCost && (
            <div
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold"
              style={{
                background: `${elementColor}25`,
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

      {/* Content area with video and description */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
        {/* Preview Animation */}
        {animations.length > 0 ? (
          <div className="relative aspect-video bg-midnight-900/50">
            <AnimatedCover
              animation={currentAnimation}
              fallbackUrl={currentAnimation?.imageUrl}
              aspectRatio="16/9"
              showLoadingIndicator={true}
            />
            {/* Overlay gradient */}
            <div className="absolute inset-0 bg-linear-to-r from-transparent via-transparent to-midnight-900/80 pointer-events-none md:block hidden" />
          </div>
        ) : (
          <div className="aspect-video flex items-center justify-center bg-midnight-800/50 text-muted-foreground text-sm">
            No animation available
          </div>
        )}

        {/* Description */}
        <div className="p-5 flex flex-col justify-center bg-midnight-800/30">
          <TextProcessor
            text={formatDescription(talent.description)}
            className="text-sm text-starlight-300 leading-relaxed"
          />
          <button
            onClick={() => onNavigate('Talents')}
            className="mt-4 text-xs font-medium uppercase tracking-wider transition-colors self-start px-4 py-2 rounded-lg border hover:bg-midnight-700/50 cursor-pointer"
            style={{
              color: elementColor,
              borderColor: `${elementColor}40`,
            }}
          >
            View Full Details →
          </button>
        </div>
      </div>
    </div>
  );
};

export default ElementalBurstShowcase;
