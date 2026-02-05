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

// ============================================================================
// Constellation Styles
// ============================================================================

const getConstellationStyles = (level: number) => {
  const talentUpgradeStyle = {
    // C3 & C5 - Talent Level Increase (green/success)
    accentColor: 'bg-success-500',
    borderColor: 'border-l-success-500',
    textColor: 'text-success-400',
    bgGlow: 'bg-success-500/5',
    levelGradient: 'from-success-600 to-success-800',
    isTalentUpgrade: true,
  };

  const styles = [
    {
      // C1 - Starlight (softer blue)
      accentColor: 'bg-starlight-500',
      borderColor: 'border-l-starlight-500',
      textColor: 'text-starlight-400',
      bgGlow: 'bg-starlight-500/5',
      levelGradient: 'from-starlight-600 to-starlight-800',
      isTalentUpgrade: false,
    },
    {
      // C2 - Info (blue)
      accentColor: 'bg-info-500',
      borderColor: 'border-l-info-500',
      textColor: 'text-info-400',
      bgGlow: 'bg-info-500/5',
      levelGradient: 'from-info-600 to-info-800',
      isTalentUpgrade: false,
    },
    talentUpgradeStyle, // C3
    {
      // C4 - Celestial (amber)
      accentColor: 'bg-celestial-500',
      borderColor: 'border-l-celestial-500',
      textColor: 'text-celestial-400',
      bgGlow: 'bg-celestial-500/5',
      levelGradient: 'from-celestial-600 to-celestial-800',
      isTalentUpgrade: false,
    },
    talentUpgradeStyle, // C5
    {
      accentColor: 'bg-warning-500',
      borderColor: 'border-l-warning-500',
      textColor: 'text-warning-400',
      bgGlow: 'bg-warning-500/5',
      levelGradient: 'from-warning-600 to-warning-800',
      isTalentUpgrade: false,
    },
  ];

  return styles[level - 1] || styles[0];
};

interface CharacterConstellationsProps {
  constellations: Constellation[];
}

const CharacterConstellations: React.FC<CharacterConstellationsProps> = ({
  constellations,
}) => {
  return (
    <div className="flex flex-col gap-2">
      {constellations.map((constellation) => (
        <ConstellationItem
          key={constellation.name}
          constellation={constellation}
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
}

const ConstellationItem: React.FC<ConstellationItemProps> = ({
  constellation,
}) => {
  const styles = getConstellationStyles(constellation.level);

  // Extract tags from description - memoized to avoid recalculation on re-renders
  const tags = useMemo(
    () => extractConstellationTags(constellation.description),
    [constellation.description]
  );

  return (
    <div className="group flex gap-3 p-3 rounded border border-border/40 bg-card/30 hover:bg-card/50 hover:border-border/60 transition-all">
      {/* Icon */}
      <div className="relative shrink-0">
        <img
          className="w-10 h-10 object-contain opacity-90"
          src={constellation.iconUrl}
          alt={constellation.name}
        />
        {/* Talent upgrade indicator */}
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
              w-7 h-7 rounded-full bg-linear-to-br ${styles.levelGradient}
              text-white text-xs font-bold
            `}
          >
            {constellation.level}
          </span>
          <h3 className="text-sm font-semibold text-foreground/90">
            {constellation.name}
          </h3>
          {styles.isTalentUpgrade && (
            <span className="text-xs text-success-400 font-medium">
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
