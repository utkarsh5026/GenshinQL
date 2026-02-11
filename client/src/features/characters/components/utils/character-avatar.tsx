import React, { useState } from 'react';

import { Drawer, DrawerContent, DrawerTrigger } from '@/components/ui/drawer';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card';
import { AvatarWithSkeleton } from '@/components/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import {
  AVATAR_SIZE_CLASSES,
  AVATAR_TEXT_CLASSES,
  type AvatarSize,
  BADGE_POSITION_CLASSES,
  type BadgePosition,
  getRarityBgClass,
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

  const { name, iconUrl, rarity } = character;

  const finalAvatarClassName = cn(
    AVATAR_SIZE_CLASSES[size],
    getRarityBorderClass(rarity),
    getRarityBgClass(rarity),
    avatarClassName
  );

  const avatarElement = (
    <div className="relative">
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
    </div>
  );

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
        'flex flex-col gap-1',
        onClick || interactive ? 'cursor-pointer' : '',
        className
      )}
      onClick={onClick}
    >
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
