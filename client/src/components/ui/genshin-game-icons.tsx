import React from 'react';

import { CachedImage } from '@/features/cache';
import { ELEMENT_COLORS, RARITY_COLORS } from '@/lib/game-colors';
import { cn } from '@/lib/utils';

/** Size variant for Genshin game icon badge components */
export type GameIconSize = 'xs' | 'sm' | 'md' | 'lg';

interface SizeConfig {
  iconPx: number;
  iconClass: string;
  textClass: string;
  gapClass: string;
  paddingClass: string;
}

const SIZE_MAP: Record<GameIconSize, SizeConfig> = {
  xs: {
    iconPx: 10,
    iconClass: 'w-2.5 h-2.5',
    textClass: 'text-[10px]',
    gapClass: 'gap-1',
    paddingClass: 'px-1.5 py-0.5',
  },
  sm: {
    iconPx: 14,
    iconClass: 'w-3.5 h-3.5',
    textClass: 'text-xs',
    gapClass: 'gap-1',
    paddingClass: 'px-2 py-0.5',
  },
  md: {
    iconPx: 16,
    iconClass: 'w-4 h-4',
    textClass: 'text-xs',
    gapClass: 'gap-1.5',
    paddingClass: 'px-2.5 py-1',
  },
  lg: {
    iconPx: 20,
    iconClass: 'w-5 h-5',
    textClass: 'text-sm',
    gapClass: 'gap-1.5',
    paddingClass: 'px-3 py-1',
  },
};

const ELEMENT_BADGE_FALLBACK: { container: string; text: string } = {
  container: 'bg-midnight-800/30 border border-midnight-600/40',
  text: 'text-muted-foreground',
};

const NEUTRAL_BADGE = {
  container: 'bg-muted/60 border border-border/40',
  text: 'text-muted-foreground',
};

const RARITY_STAR_SIZE_CLASS: Record<GameIconSize, string> = {
  xs: 'text-[10px]',
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg',
};

/* ─────────────────────────────────────────────────────────────
   ElementBadge
───────────────────────────────────────────────────────────── */

interface ElementBadgeProps {
  /** Element name e.g. "Pyro", "Hydro". Used as alt text and label. */
  name: string;
  /** CDN URL for the element icon (character.elementUrl or primitives lookup). */
  url: string;
  /** Controls icon and text size. Default: 'sm'. */
  size?: GameIconSize;
  /** Show element name next to the icon. Default: true. */
  showLabel?: boolean;
  /** Extra classes merged onto the pill container. */
  className?: string;
}

/**
 * Renders a Genshin Impact element icon as a colored pill badge.
 * The badge background and text adopt the element's custom color tokens
 * (pyro, hydro, anemo, electro, cryo, geo, dendro).
 */
export const ElementBadge: React.FC<ElementBadgeProps> = ({
  name,
  url,
  size = 'sm',
  showLabel = true,
  className,
}) => {
  const sizeConfig = SIZE_MAP[size];
  const elementKey = name.toLowerCase();
  const elementEntry =
    ELEMENT_COLORS[elementKey as keyof typeof ELEMENT_COLORS];
  const colors = elementEntry
    ? { container: elementEntry.badgeContainer, text: elementEntry.text }
    : ELEMENT_BADGE_FALLBACK;

  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full',
        sizeConfig.paddingClass,
        sizeConfig.gapClass,
        colors.container,
        className
      )}
    >
      <CachedImage
        src={url}
        alt={name}
        width={sizeConfig.iconPx}
        height={sizeConfig.iconPx}
        className={cn(sizeConfig.iconClass, 'object-contain shrink-0')}
        skeletonShape="rounded"
        skeletonSize="sm"
      />
      {showLabel && (
        <span
          className={cn(
            'leading-none font-medium capitalize',
            colors.text,
            sizeConfig.textClass
          )}
        >
          {name}
        </span>
      )}
    </div>
  );
};

interface WeaponTypeBadgeProps {
  /** Weapon type name e.g. "Sword", "Bow". Used as alt text and label. */
  name: string;
  /** CDN URL for the weapon type icon (character.weaponUrl or primitives lookup). */
  url: string;
  /** Controls icon and text size. Default: 'sm'. */
  size?: GameIconSize;
  /** Show weapon type name next to the icon. Default: true. */
  showLabel?: boolean;
  /** Extra classes merged onto the pill container. */
  className?: string;
}

/**
 * Renders a Genshin Impact weapon type icon as a neutral pill badge.
 * Neutral styling (muted background/border) is used since weapon types
 * do not have dedicated element-style color tokens.
 */
export const WeaponTypeBadge: React.FC<WeaponTypeBadgeProps> = ({
  name,
  url,
  size = 'sm',
  showLabel = true,
  className,
}) => {
  const sizeConfig = SIZE_MAP[size];

  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full',
        sizeConfig.paddingClass,
        sizeConfig.gapClass,
        NEUTRAL_BADGE.container,
        className
      )}
    >
      <CachedImage
        src={url}
        alt={name}
        width={sizeConfig.iconPx}
        height={sizeConfig.iconPx}
        className={cn(sizeConfig.iconClass, 'object-contain shrink-0')}
        skeletonShape="rounded"
        skeletonSize="sm"
      />
      {showLabel && (
        <span
          className={cn(
            'leading-none font-medium capitalize',
            NEUTRAL_BADGE.text,
            sizeConfig.textClass
          )}
        >
          {name}
        </span>
      )}
    </div>
  );
};

interface NationBadgeProps {
  /** Nation/region name e.g. "Mondstadt", "Liyue". Used as alt text and label. */
  name: string;
  /** CDN URL for the nation icon (character.regionUrl or primitives lookup). */
  url: string;
  /** Controls icon and text size. Default: 'sm'. */
  size?: GameIconSize;
  /** Show nation name next to the icon. Default: true. */
  showLabel?: boolean;
  /** Extra classes merged onto the pill container. */
  className?: string;
}

/**
 * Renders a Genshin Impact nation/region icon as a neutral pill badge.
 * Neutral styling is used since nations do not have dedicated color tokens.
 */
export const NationBadge: React.FC<NationBadgeProps> = ({
  name,
  url,
  size = 'sm',
  showLabel = true,
  className,
}) => {
  const sizeConfig = SIZE_MAP[size];

  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full',
        sizeConfig.paddingClass,
        sizeConfig.gapClass,
        NEUTRAL_BADGE.container,
        className
      )}
    >
      <CachedImage
        src={url}
        alt={name}
        width={sizeConfig.iconPx}
        height={sizeConfig.iconPx}
        className={cn(sizeConfig.iconClass, 'object-contain shrink-0')}
        skeletonShape="rounded"
        skeletonSize="sm"
      />
      {showLabel && (
        <span
          className={cn(
            'leading-none font-medium',
            NEUTRAL_BADGE.text,
            sizeConfig.textClass
          )}
        >
          {name}
        </span>
      )}
    </div>
  );
};

interface RarityStarsProps {
  /** Star count, 1–5. Accepts both number and string (parsed internally). */
  rarity: number | string;
  /** Controls the font size of ★ symbols. Default: 'sm'. */
  size?: GameIconSize;
  /** Apply a rarity-appropriate drop-shadow glow on the stars. Default: false. */
  showGlow?: boolean;
  /** Extra classes merged onto the flex container (e.g. 'justify-center mb-3'). */
  className?: string;
}

/**
 * Renders a row of ★ star symbols with rarity-appropriate coloring.
 * 5-star uses legendary gold, 4-star uses epic purple, etc.
 * Uses the custom OKLCH rarity Tailwind tokens (legendary, epic, rare, uncommon, common).
 */
export const RarityStars: React.FC<RarityStarsProps> = ({
  rarity,
  size = 'sm',
  showGlow = false,
  className,
}) => {
  const rarityNum = Math.min(
    Math.max(Number.parseInt(String(rarity), 10) || 0, 0),
    5
  );
  const rarityEntry =
    RARITY_COLORS[rarityNum as keyof typeof RARITY_COLORS] ?? RARITY_COLORS[1];
  const starConfig = { color: rarityEntry.text, glow: rarityEntry.starGlow };
  const sizeClass = RARITY_STAR_SIZE_CLASS[size];

  return (
    <div className={cn('flex items-center gap-px', className)}>
      {Array.from({ length: rarityNum }).map((_, i) => (
        <span
          key={i}
          className={cn(
            'leading-none',
            starConfig.color,
            showGlow && starConfig.glow,
            sizeClass
          )}
        >
          ★
        </span>
      ))}
    </div>
  );
};

interface CharacterBadgesProps {
  element: string;
  elementUrl: string;
  weaponType: string;
  weaponUrl: string;
  region: string;
  regionUrl: string;
  /** Controls icon and text size for all three badges. Default: 'sm'. */
  size?: GameIconSize;
  /** Show label text on all three badges. Default: true. */
  showLabels?: boolean;
  /** 'row' renders all three inline; 'column' stacks them. Default: 'row'. */
  layout?: 'row' | 'column';
  /** Extra classes merged onto the wrapper. */
  className?: string;
}

/**
 * Convenience composite that renders ElementBadge, WeaponTypeBadge, and
 * NationBadge together. Use for character summaries where all three are shown.
 */
export const CharacterBadges: React.FC<CharacterBadgesProps> = ({
  element,
  elementUrl,
  weaponType,
  weaponUrl,
  region,
  regionUrl,
  size = 'sm',
  showLabels = true,
  layout = 'row',
  className,
}) => (
  <div
    className={cn(
      'flex items-center gap-1.5',
      layout === 'column' && 'flex-col items-start',
      className
    )}
  >
    <ElementBadge
      name={element}
      url={elementUrl}
      size={size}
      showLabel={showLabels}
    />
    <WeaponTypeBadge
      name={weaponType}
      url={weaponUrl}
      size={size}
      showLabel={showLabels}
    />
    <NationBadge
      name={region}
      url={regionUrl}
      size={size}
      showLabel={showLabels}
    />
  </div>
);
