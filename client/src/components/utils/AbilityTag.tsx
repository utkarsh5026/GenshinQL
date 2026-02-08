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
import React, { memo } from 'react';

import { getTagConfig } from '@/lib/constellationTags';

interface AbilityTagProps {
  tagId: string;
  size?: 'xs' | 'sm';
}

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
 * Get Tailwind classes for tag styling based on color name.
 * Uses project's custom theme colors from index.css.
 * Subtle design with borders and reduced opacity for better visual hierarchy.
 */
const getTagClasses = (color: string): string => {
  const colorMap: Record<string, string> = {
    pyro: 'border-pyro-500/20 text-pyro-300/80 bg-pyro-500/5',
    hydro: 'border-hydro-500/20 text-hydro-300/80 bg-hydro-500/5',
    electro: 'border-electro-500/20 text-electro-300/80 bg-electro-500/5',
    cryo: 'border-cryo-500/20 text-cryo-300/80 bg-cryo-500/5',
    geo: 'border-geo-500/20 text-geo-300/80 bg-geo-500/5',
    dendro: 'border-dendro-500/20 text-dendro-300/80 bg-dendro-500/5',
    anemo: 'border-anemo-500/20 text-anemo-300/80 bg-anemo-500/5',

    success: 'border-success-500/20 text-success-300/80 bg-success-500/5',
    warning: 'border-warning-500/20 text-warning-300/80 bg-warning-500/5',
    info: 'border-info-500/20 text-info-300/80 bg-info-500/5',
    error: 'border-error-500/20 text-error-300/80 bg-error-500/5',

    celestial:
      'border-celestial-500/20 text-celestial-300/80 bg-celestial-500/5',
    starlight:
      'border-starlight-500/20 text-starlight-300/80 bg-starlight-500/5',
    midnight: 'border-midnight-500/20 text-midnight-300/80 bg-midnight-500/5',

    legendary:
      'border-legendary-500/20 text-legendary-300/80 bg-legendary-500/5',
    epic: 'border-epic-500/20 text-epic-300/80 bg-epic-500/5',
    rare: 'border-rare-500/20 text-rare-300/80 bg-rare-500/5',
    uncommon: 'border-uncommon-500/20 text-uncommon-300/80 bg-uncommon-500/5',
    common: 'border-common-500/20 text-common-300/80 bg-common-500/5',
  };

  return (
    colorMap[color] ?? 'border-common-500/20 text-common-300/80 bg-common-500/5'
  );
};

/**
 * Small badge component for displaying ability tags (talents, passives, constellations).
 * Uses dynamic styling based on tag category color with icons.
 * Subtle design with smaller icons and pill shape for better visual integration.
 */
export const AbilityTag: React.FC<AbilityTagProps> = memo(
  ({ tagId, size = 'xs' }) => {
    const config = getTagConfig(tagId);
    if (!config) return null;

    const Icon = TAG_ICONS[tagId] ?? TrendingUp;
    const sizeClasses =
      size === 'xs' ? 'text-[9px] px-1.5 py-0.5' : 'text-xs px-2 py-0.5';
    const iconSize = size === 'xs' ? 8 : 10;
    const colorClasses = getTagClasses(config.color);

    return (
      <span
        className={`
        inline-flex items-center gap-0.5 rounded-lg font-medium border-none
        ${sizeClasses}
        ${colorClasses}
      `}
      >
        <Icon size={iconSize} className="shrink-0 opacity-70" />
        {config.label}
      </span>
    );
  }
);

AbilityTag.displayName = 'AbilityTag';
