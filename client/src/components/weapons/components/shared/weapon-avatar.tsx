import React, { useState } from 'react';

import { Drawer, DrawerContent, DrawerTrigger } from '@/components/ui/drawer';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card';
import { AvatarWithSkeleton } from '@/components/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { WeaponDetailed } from '@/stores/useWeaponsStore';

import WeaponCard from './weapon-card';

const bgColorMap = {
  '1': 'bg-gray-300',
  '2': 'bg-gray-400',
  '3': 'bg-blue-300',
  '4': 'bg-purple-900/50',
  '5': 'bg-amber-700/50',
};

interface WeaponAvatarProps {
  weapon: WeaponDetailed;
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
    <div key={name} className="flex cursor-pointer flex-col gap-2">
      <AvatarWithSkeleton
        key={name}
        name={name}
        avatarClassName={`w-10 h-10 border-2 ${bgColorMap[rarity.toString() as keyof typeof bgColorMap]}`}
        url={iconUrl}
      />
      <p className="text-xs font-thin">{name}</p>
    </div>
  );

  const desktopView = (
    <HoverCard key={name}>
      <HoverCardTrigger>{triggerElement}</HoverCardTrigger>
      <HoverCardContent align="center" side="right" className="w-96">
        <WeaponCard weapon={weapon} />
      </HoverCardContent>
    </HoverCard>
  );

  const mobileView = (
    <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
      <DrawerTrigger asChild>{triggerElement}</DrawerTrigger>
      <DrawerContent className="max-h-[85vh]">
        <div className="p-4 overflow-y-auto">
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
