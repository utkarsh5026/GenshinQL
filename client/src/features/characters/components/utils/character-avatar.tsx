import React, { useState } from 'react';

import { Drawer, DrawerContent, DrawerTrigger } from '@/components/ui/drawer';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card';
import { AvatarWithSkeleton } from '@/components/utils';
import { useIsMobile } from '@/hooks/use-mobile';

import { useCharacterMap } from '../../stores/useCharacterStore';
import CharacterCard from '../cards/character-card';

/**
 * Get border class for character cards based on rarity
 */
function getRarityBorderClass(rarity: string | number): string {
  const rarityNum = typeof rarity === 'string' ? parseInt(rarity) : rarity;
  const borderMap: Record<number, string> = {
    5: 'border-2 border-amber-500/60 shadow-lg shadow-amber-500/20',
    4: 'border-2 border-violet-500/60 shadow-lg shadow-violet-500/20',
    3: 'border-2 border-blue-500/50 shadow-md shadow-blue-500/15',
    2: 'border-2 border-green-500/50 shadow-md shadow-green-500/15',
    1: 'border border-gray-400/40 shadow-sm',
  };
  return borderMap[rarityNum] || borderMap[1];
}

/**
 * Get background color class for character avatar based on rarity
 * Uses theme-consistent rarity colors
 */
function getRarityBgClass(rarity: string | number): string {
  const rarityNum = typeof rarity === 'string' ? parseInt(rarity) : rarity;
  const bgMap: Record<number, string> = {
    5: 'bg-legendary-600/50 dark:bg-legendary-700/40',
    4: 'bg-epic-600/50 dark:bg-epic-700/40',
    3: 'bg-rare-500/40 dark:bg-rare-600/40',
    2: 'bg-uncommon-500/40 dark:bg-uncommon-600/40',
    1: 'bg-common-400/30 dark:bg-common-600/30',
  };
  return bgMap[rarityNum] || bgMap[1];
}

interface CharacterAvatarProps {
  characterName: string;
}

/**
 * CharacterAvatar component displays a character icon with interactive functionality
 * - Desktop: Hover to show detailed character information in a HoverCard
 * - Mobile: Click to open detailed character information in a Drawer
 */
const CharacterAvatar: React.FC<CharacterAvatarProps> = ({ characterName }) => {
  // Call all hooks first (before any conditional returns)
  const characterMap = useCharacterMap();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const isMobile = useIsMobile();

  const character = characterMap[characterName];

  // Early return if character not found (after all hooks)
  if (!character) {
    if (process.env.NODE_ENV === 'development') {
      console.warn(
        `CharacterAvatar: Character "${characterName}" not found in store`
      );
    }
    return null;
  }

  const { name, iconUrl, rarity } = character;

  const triggerElement = (
    <div key={name} className="flex cursor-pointer flex-col gap-1">
      <AvatarWithSkeleton
        key={name}
        name={name}
        avatarClassName={`w-10 h-10 ${getRarityBorderClass(rarity)} ${getRarityBgClass(rarity)}`}
        url={iconUrl}
      />
      <p className="text-[10px] font-thin text-foreground/80 text-center line-clamp-1">
        {name}
      </p>
    </div>
  );

  const desktopView = (
    <HoverCard key={name}>
      <HoverCardTrigger>{triggerElement}</HoverCardTrigger>
      <HoverCardContent align="center" side="right" className="w-80 md:w-96">
        <CharacterCard character={character} />
      </HoverCardContent>
    </HoverCard>
  );

  const mobileView = (
    <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
      <DrawerTrigger asChild>{triggerElement}</DrawerTrigger>
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
