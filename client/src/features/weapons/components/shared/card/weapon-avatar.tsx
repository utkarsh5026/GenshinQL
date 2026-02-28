import React, { useState } from 'react';

import { Drawer, DrawerContent, DrawerTrigger } from '@/components/ui/drawer';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
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

import { useWeaponMap } from '../../../stores/useWeaponsStore';
import WeaponCard from './weapon-card';

interface WeaponAvatarProps {
  weaponName: string;

  size?: AvatarSize; // Default: 'md'

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

  showSkeleton?: boolean; // Default: true
}

/**
 * WeaponAvatar component displays a weapon icon with interactive functionality
 * - Desktop: Hover to show detailed weapon information in a HoverCard
 * - Mobile: Click to open detailed weapon information in a Drawer
 *
 * Now supports configurable size, name display, badges, and interactivity
 */
const WeaponAvatar: React.FC<WeaponAvatarProps> = ({
  weaponName,
  size = 'md',
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
  showSkeleton = true,
}) => {
  const weaponMap = useWeaponMap();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const isMobile = useIsMobile();

  const weapon = weaponMap[weaponName];

  if (!weapon) {
    return null;
  }

  const { name, iconUrl, rarity } = weapon;

  const finalAvatarClassName = cn(
    'rounded-full flex items-center justify-center shrink-0 relative overflow-hidden group-hover:brightness-110 transition-all duration-300',
    AVATAR_SIZE_CLASSES[size],
    getRarityBorderClass(rarity),
    getRarityGradientClass(rarity),
    // Add inner glow for glass effect
    'after:absolute after:inset-0 after:rounded-full after:shadow-[inset_0_2px_6px_rgba(255,255,255,0.4)] after:pointer-events-none after:transition-opacity after:duration-300 group-hover:after:opacity-100 after:opacity-70',
    avatarClassName
  );

  const avatarElement = (
    <div className="relative">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className={finalAvatarClassName}>
              <CachedImage
                src={iconUrl}
                alt={name}
                showSkeleton={showSkeleton}
                skeletonShape="circle"
                className={cn(
                  'w-full h-full rounded-full object-cover p-1',
                  imageClassName
                )}
              />
            </div>
          </TooltipTrigger>
          {(namePosition === 'tooltip' || namePosition === 'none') && (
            <TooltipContent>{name}</TooltipContent>
          )}
        </Tooltip>
      </TooltipProvider>
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
        'group flex flex-col gap-1 transition-all duration-300 hover:scale-105 hover:-translate-y-0.5 hover:drop-shadow-xl z-0 hover:z-10',
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
        <WeaponCard weapon={weapon} />
      </HoverCardContent>
    </HoverCard>
  );

  const mobileView = (
    <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
      <DrawerTrigger asChild>{containerElement}</DrawerTrigger>
      <DrawerContent className="max-h-[85vh]">
        <div className="p-3 sm:p-4 overflow-y-auto">
          <WeaponCard weapon={weapon} />
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

export default WeaponAvatar;
