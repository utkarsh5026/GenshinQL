import {
  Activity,
  Battery,
  Circle,
  Clock,
  Flame,
  FlaskConical,
  Footprints,
  GraduationCap,
  Heart,
  Layers,
  Move,
  Plus,
  Shield,
  Sparkles,
  Sword,
  Target,
  Timer,
  TrendingUp,
  Zap,
} from 'lucide-react';
import React, { memo, useMemo } from 'react';

import { ListSplitter } from '@/components/utils';
import {
  extractConstellationTags,
  getTagConfig,
} from '@/lib/constellationTags';
import { Constellation } from '@/types';

interface ConstellationTagProps {
  tagId: string;
  size?: 'xs' | 'sm';
}

/**
 * Get Tailwind classes for tag styling based on color name.
 * Uses project's custom theme colors from index.css.
 */
const getTagClasses = (color: string): string => {
  const colorMap: Record<string, string> = {
    pyro: 'bg-pyro-500/15 text-pyro-400',
    hydro: 'bg-hydro-500/15 text-hydro-400',
    electro: 'bg-electro-500/15 text-electro-400',
    cryo: 'bg-cryo-500/15 text-cryo-400',
    geo: 'bg-geo-500/15 text-geo-400',
    dendro: 'bg-dendro-500/15 text-dendro-400',
    anemo: 'bg-anemo-500/15 text-anemo-400',

    success: 'bg-success-500/15 text-success-400',
    warning: 'bg-warning-500/15 text-warning-400',
    info: 'bg-info-500/15 text-info-400',
    error: 'bg-error-500/15 text-error-400',

    celestial: 'bg-celestial-500/15 text-celestial-400',
    starlight: 'bg-starlight-500/15 text-starlight-400',
    midnight: 'bg-midnight-500/15 text-midnight-400',

    legendary: 'bg-legendary-500/15 text-legendary-400',
    epic: 'bg-epic-500/15 text-epic-400',
    rare: 'bg-rare-500/15 text-rare-400',
    uncommon: 'bg-uncommon-500/15 text-uncommon-400',
    common: 'bg-common-500/15 text-common-400',
  };

  return colorMap[color] ?? 'bg-common-500/15 text-common-400';
};

/**
 * Icon mapping for each tag category.
 */
const TAG_ICONS: Record<string, React.ElementType> = {
  dmg: Flame,
  'crit-rate': Target,
  'crit-dmg': Sparkles,
  atk: Sword,
  'elemental-mastery': FlaskConical,
  hp: Heart,
  def: Shield,
  shield: Shield,
  healing: Plus,
  resistance: Circle,
  energy: Battery,
  'cd-reduction': Timer,
  duration: Clock,
  charge: Zap,
  stamina: Activity,
  'talent-level': GraduationCap,
  stack: Layers,
  'elemental-reaction': FlaskConical,
  movement: Footprints,
  aoe: Move,
};

/**
 * Small badge component for displaying individual constellation tags.
 * Uses dynamic styling based on tag category color with icons.
 */
const ConstellationTag: React.FC<ConstellationTagProps> = memo(
  ({ tagId, size = 'xs' }) => {
    const config = getTagConfig(tagId);
    if (!config) return null;

    const Icon = TAG_ICONS[tagId] ?? TrendingUp;
    const sizeClasses =
      size === 'xs' ? 'text-[10px] px-1.5 py-0.5' : 'text-xs px-2 py-0.5';
    const iconSize = size === 'xs' ? 10 : 12;
    const colorClasses = getTagClasses(config.color);

    return (
      <span
        className={`
        inline-flex items-center gap-0.5 rounded-lg font-medium
        ${sizeClasses}
        ${colorClasses}
      `}
      >
        <Icon size={iconSize} className="shrink-0" />
        {config.label}
      </span>
    );
  }
);

/**
 * Returns element-specific Tailwind classes for constellation styling
 */
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
    // C3 & C5 - Talent Level Increase (green/success)
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
}

const CharacterConstellations: React.FC<CharacterConstellationsProps> = ({
  constellations,
  element,
}) => {
  const elementClasses = getElementClasses(element);

  return (
    <div className="flex flex-col gap-2">
      {constellations.map((constellation) => (
        <ConstellationItem
          key={constellation.name}
          constellation={constellation}
          elementClasses={elementClasses}
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
}

const ConstellationItem: React.FC<ConstellationItemProps> = ({
  constellation,
  elementClasses,
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
        <img
          className="w-10 h-10 object-contain opacity-90"
          src={constellation.iconUrl}
          alt={constellation.name}
        />
        {styles.isTalentUpgrade && (
          <div className="absolute -top-0.5 -right-0.5 flex items-center justify-center w-4 h-4 rounded-full bg-success-600 text-white text-[9px] font-bold">
            +3
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 space-y-1.5">
        {/* Title with inline level */}
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
              <ConstellationTag key={tagId} tagId={tagId} size="xs" />
            ))}
          </div>
        )}

        {/* Description */}
        <div className="text-xs leading-relaxed text-muted-foreground/80">
          <ListSplitter text={constellation.description} />
        </div>
      </div>
    </div>
  );
};

export default CharacterConstellations;
