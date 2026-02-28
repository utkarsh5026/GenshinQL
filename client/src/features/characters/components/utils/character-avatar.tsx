import React, { useState } from 'react';

import { Drawer, DrawerContent, DrawerTrigger } from '@/components/ui/drawer';
import { RarityStars } from '@/components/ui/genshin-game-icons';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card';
import { AvatarWithSkeleton } from '@/components/utils';
import { CachedImage } from '@/features/cache';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import {
  AVATAR_SIZE_CLASSES,
  AVATAR_TEXT_CLASSES,
  type AvatarSize,
  BADGE_POSITION_CLASSES,
  type BadgePosition,
  getRarityBorderClass,
  getRarityGradientClass,
  type NamePosition,
} from '@/utils/avatar-utils';

import { useCharacterMap } from '../../stores/useCharacterStore';
import CharacterCard from '../cards/character-card';

interface CharacterAvatarProps {
  characterName: string;
  size?: AvatarSize; // Default: 'sm'

  showName?: boolean; // Default: true
  namePosition?: NamePosition; // Default: 'bottom'

  interactive?: boolean; // Default: true - enables HoverCard/Drawer
  onClick?: () => void; // Custom click handler (overrides interactive)

  renderBadge?: () => React.ReactNode;
  badgePosition?: BadgePosition; // Default: 'top-right'

  showElement?: boolean; // Default: false - shows element icon overlay
  showRarity?: boolean; // Default: false - shows rarity stars overlay

  className?: string; // Container className
  avatarClassName?: string; // Avatar image className (merged with defaults)
  imageClassName?: string; // Inner image className
  nameClassName?: string; // Name text className
}

/**
 * CharacterAvatar component displays a character icon with interactive functionality
 * - Desktop: Hover to show detailed character information in a HoverCard
 * - Mobile: Click to open detailed character information in a Drawer
 *
 * Now supports configurable size, name display, badges, and interactivity
 * Can optionally show element icon and rarity overlays
 */
const CharacterAvatar: React.FC<CharacterAvatarProps> = ({
  characterName,
  size = 'sm',
  showName = true,
  namePosition = 'bottom',
  interactive = true,
  onClick,
  renderBadge,
  badgePosition = 'top-right',
  showElement = false,
  showRarity = false,
  className,
  avatarClassName,
  imageClassName,
  nameClassName,
}) => {
  const characterMap = useCharacterMap();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const isMobile = useIsMobile();

  const character = characterMap[characterName];

  if (!character) {
    return null;
  }

  const { name, iconUrl, rarity, elementUrl } = character;

  const finalAvatarClassName = cn(
    AVATAR_SIZE_CLASSES[size],
    getRarityBorderClass(rarity),
    getRarityGradientClass(rarity),
    'relative overflow-hidden group-hover:brightness-110 transition-all duration-300',
    // Add inner glow for glass effect
    'after:absolute after:inset-0 after:rounded-full after:shadow-[inset_0_2px_6px_rgba(255,255,255,0.4)] after:pointer-events-none after:transition-opacity after:duration-300 group-hover:after:opacity-100 after:opacity-70',
    avatarClassName
  );

  // Element badge size scales with avatar — responsive mobile → desktop
  const elementBadgeSizeMap: Record<AvatarSize, string> = {
    xs: 'w-3 h-3 sm:w-3.5 sm:h-3.5',
    sm: 'w-3.5 h-3.5 sm:w-4 sm:h-4',
    md: 'w-4 h-4 sm:w-5 sm:h-5',
    lg: 'w-5 h-5 sm:w-6 sm:h-6',
    xl: 'w-6 h-6 sm:w-7 sm:h-7',
  };

  const elementIconSizeMap: Record<AvatarSize, number> = {
    xs: 10,
    sm: 12,
    md: 16,
    lg: 20,
    xl: 24,
  };

  const rarityNum = Number.parseInt(rarity, 10);

  const avatarElement = (
    <div className="relative inline-block">
      <AvatarWithSkeleton
        name={namePosition === 'tooltip' ? name : ''}
        avatarClassName={finalAvatarClassName}
        imageClassName={imageClassName}
        url={iconUrl}
      />
      {renderBadge && (
        <div className={cn('absolute', BADGE_POSITION_CLASSES[badgePosition])}>
          {renderBadge()}
        </div>
      )}
      {/* Element Icon — small floating circle at bottom-right edge */}
      {showElement && elementUrl && (
        <div
          className={cn(
            'absolute -bottom-1 -right-1 rounded-full ring-2 ring-background/80 shadow-md shadow-black/40 flex items-center justify-center bg-background/90 backdrop-blur-sm transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-12',
            elementBadgeSizeMap[size]
          )}
        >
          <CachedImage
            src={elementUrl}
            alt={character.element}
            width={elementIconSizeMap[size]}
            height={elementIconSizeMap[size]}
            className="rounded-full drop-shadow-sm"
          />
        </div>
      )}
    </div>
  );

  /** Maps AvatarSize to the GameIconSize scale used by RarityStars */
  const rarityStarSizeMap: Record<AvatarSize, 'xs' | 'sm'> = {
    xs: 'xs',
    sm: 'xs',
    md: 'xs',
    lg: 'sm',
    xl: 'sm',
  };

  /** Rarity stars — row of ★ above the avatar */
  const rarityStars =
    showRarity && rarityNum > 0 ? (
      <RarityStars
        rarity={rarityNum}
        size={rarityStarSizeMap[size]}
        className="justify-center"
      />
    ) : null;

  const nameLabel =
    showName && namePosition === 'bottom' ? (
      <p
        className={cn(
          AVATAR_TEXT_CLASSES[size],
          ' text-foreground/80 text-center line-clamp-1',
          nameClassName
        )}
      >
        {name}
      </p>
    ) : null;

  const containerElement = (
    <div
      className={cn(
        'group flex flex-col items-center gap-1 transition-all duration-300 hover:scale-105 hover:-translate-y-0.5 hover:drop-shadow-xl z-0 hover:z-10',
        onClick || interactive ? 'cursor-pointer' : '',
        className
      )}
      onClick={onClick}
    >
      {rarityStars}
      {avatarElement}
      {nameLabel}
    </div>
  );

  if (onClick || !interactive) {
    return containerElement;
  }

  const desktopView = (
    <HoverCard key={name}>
      <HoverCardTrigger asChild>{containerElement}</HoverCardTrigger>
      <HoverCardContent align="center" side="right" className="w-80 md:w-96">
        <CharacterCard character={character} showAnimation />
      </HoverCardContent>
    </HoverCard>
  );

  const mobileView = (
    <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
      <DrawerTrigger asChild>{containerElement}</DrawerTrigger>
      <DrawerContent className="max-h-[85vh]">
        <div className="p-3 sm:p-4 overflow-y-auto">
          <CharacterCard character={character} showAnimation />
        </div>
      </DrawerContent>
    </Drawer>
  );

  return (
    <>
      {!isMobile && desktopView}
      {isMobile && mobileView}
    </>
  );
};

export default CharacterAvatar;
