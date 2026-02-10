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
import type { WeaponSummary } from '@/features/weapons/types';
import { useIsMobile } from '@/hooks/use-mobile';

import WeaponCard from './weapon-card';

/**
 * Get border class for weapon cards based on rarity
 */
function getRarityBorderClass(rarity: number): string {
  const borderMap: Record<number, string> = {
    5: 'border-2 border-amber-500/60 shadow-lg shadow-amber-500/20',
    4: 'border-2 border-violet-500/60 shadow-lg shadow-violet-500/20',
    3: 'border-2 border-blue-500/50 shadow-md shadow-blue-500/15',
    2: 'border-2 border-green-500/50 shadow-md shadow-green-500/15',
    1: 'border border-gray-400/40 shadow-sm',
  };
  return borderMap[rarity] || borderMap[1];
}

/**
 * Get background color class for weapon avatar based on rarity
 * Uses theme-consistent rarity colors
 */
function getRarityBgClass(rarity: number): string {
  const bgMap: Record<number, string> = {
    5: 'bg-legendary-600/50 dark:bg-legendary-700/40',
    4: 'bg-epic-600/50 dark:bg-epic-700/40',
    3: 'bg-rare-500/40 dark:bg-rare-600/40',
    2: 'bg-uncommon-500/40 dark:bg-uncommon-600/40',
    1: 'bg-common-400/30 dark:bg-common-600/30',
  };
  return bgMap[rarity] || bgMap[1];
}

interface WeaponAvatarProps {
  weapon: WeaponSummary;
}

/**
 * WeaponAvatar component displays a weapon icon with interactive functionality
 * - Desktop: Hover to show detailed weapon information in a HoverCard
 * - Mobile: Click to open detailed weapon information in a Drawer
 */
const WeaponAvatar: React.FC<WeaponAvatarProps> = ({ weapon }) => {
  const { name, iconUrl, rarity } = weapon;
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const isMobile = useIsMobile();

  const triggerElement = (
    <div key={name} className="flex cursor-pointer flex-col gap-1 sm:gap-2">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>
            <CachedImage
              src={iconUrl}
              alt={name}
              showSkeleton={true}
              skeletonShape="circle"
              className={`w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full ${getRarityBorderClass(rarity)} ${getRarityBgClass(rarity)}`}
            />
          </TooltipTrigger>
          <TooltipContent>{name}</TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <p className="text-[10px] sm:text-xs font-thin text-foreground/80">
        {name}
      </p>
    </div>
  );

  const desktopView = (
    <HoverCard key={name}>
      <HoverCardTrigger>{triggerElement}</HoverCardTrigger>
      <HoverCardContent align="center" side="right" className="w-80 md:w-96">
        <WeaponCard weapon={weapon} />
      </HoverCardContent>
    </HoverCard>
  );

  const mobileView = (
    <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
      <DrawerTrigger asChild>{triggerElement}</DrawerTrigger>
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
