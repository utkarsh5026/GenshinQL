import React from 'react';

import type { Weapon } from '@/types';

import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '../ui/hover-card';
import AvatarWithSkeleton from '../utils/AvatarWithSkeleton';
import WeaponCard from './WeaponCard';

const bgColorMap = {
  '1': 'bg-gray-300',
  '2': 'bg-gray-400',
  '3': 'bg-blue-300',
  '4': 'bg-purple-900/50',
  '5': 'bg-amber-700/50',
};

interface WeaponAvatarProps {
  weapon: Weapon;
}

/**
 * WeaponAvatar component displays a weapon icon with hover functionality to show detailed weapon information
 *
 * @component
 * @param {Object} props - Component props
 * @param {Weapon} props.weapon - Weapon data containing name, icon URL, rarity and other details
 * @returns {JSX.Element} A clickable weapon avatar that shows a hover card with full weapon details, including:
 * - Weapon icon with rarity-based border color
 * - Weapon name below icon
 * - Hover card with complete weapon information via WeaponCard component
 */
const WeaponAvatar: React.FC<WeaponAvatarProps> = ({ weapon }) => {
  const { name, iconUrl, rarity } = weapon;
  return (
    <HoverCard key={name}>
      <HoverCardTrigger>
        <div key={name} className={`flex cursor-pointer flex-col gap-2`}>
          <AvatarWithSkeleton
            key={name}
            name={name}
            avatarClassName={`w-10 h-10 border-2 ${bgColorMap[rarity.toString() as keyof typeof bgColorMap]}`}
            url={iconUrl}
          />
          <p className="text-xs font-thin">{name}</p>
        </div>
      </HoverCardTrigger>
      <HoverCardContent
        align="center"
        side="right"
        className="w-96 bg-gray-100"
      >
        <WeaponCard weapon={weapon} />
      </HoverCardContent>
    </HoverCard>
  );
};

export default WeaponAvatar;
