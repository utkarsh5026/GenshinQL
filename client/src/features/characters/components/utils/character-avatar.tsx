import React, { useState } from 'react';

import { Drawer, DrawerContent, DrawerTrigger } from '@/components/ui/drawer';
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
    avatarClassName
  );

  // Element badge size scales with avatar
  const elementBadgeSizeMap: Record<AvatarSize, string> = {
    xs: 'w-3.5 h-3.5',
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
    xl: 'w-7 h-7',
  };

  const elementIconSizeMap: Record<AvatarSize, number> = {
    xs: 10,
    sm: 12,
    md: 16,
    lg: 20,
    xl: 24,
  };

  // Rarity star text size scales with avatar
  const rarityStarSizeMap: Record<AvatarSize, string> = {
    xs: 'text-[8px]',
    sm: 'text-[9px]',
    md: 'text-[10px]',
    lg: 'text-xs',
    xl: 'text-sm',
  };

  const rarityNum = Number.parseInt(rarity, 10);
  const starColor = rarityNum === 5 ? 'text-amber-400' : 'text-violet-400';

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
            'absolute -bottom-0.5 -right-0.5 rounded-full ring-2 ring-background flex items-center justify-center bg-background/90',
            elementBadgeSizeMap[size]
          )}
        >
          <CachedImage
            src={elementUrl}
            alt={character.element}
            width={elementIconSizeMap[size]}
            height={elementIconSizeMap[size]}
            className="rounded-full"
          />
        </div>
      )}
    </div>
  );

  // Rarity stars — row of ★ above the avatar
  const rarityStars =
    showRarity && rarityNum > 0 ? (
      <div className="flex items-center justify-center gap-0.5 leading-none">
        {Array.from({ length: Math.min(rarityNum, 5) }).map((_, i) => (
          <span
            key={i}
            className={cn(starColor, rarityStarSizeMap[size], 'drop-shadow-sm')}
          >
            ★
          </span>
        ))}
      </div>
    ) : null;

  const nameLabel =
    showName && namePosition === 'bottom' ? (
      <p
        className={cn(
          AVATAR_TEXT_CLASSES[size],
          'font-thin text-foreground/80 text-center line-clamp-1',
          nameClassName
        )}
      >
        {name}
      </p>
    ) : null;

  const containerElement = (
    <div
      className={cn(
        'flex flex-col items-center gap-1',
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
        <CharacterCard character={character} />
      </HoverCardContent>
    </HoverCard>
  );

  const mobileView = (
    <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
      <DrawerTrigger asChild>{containerElement}</DrawerTrigger>
      <DrawerContent className="max-h-[85vh]">
        <div className="p-3 sm:p-4 overflow-y-auto">
          <CharacterCard character={character} />
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
