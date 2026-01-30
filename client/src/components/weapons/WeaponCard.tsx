import React from 'react';

import { Weapon } from '@/types';

import AvatarWithSkeleton from '../utils/AvatarWithSkeleton';
import ListSplitter from '../utils/ListSplitter';

interface WeaponCardProps {
  weapon: Weapon;
}

/**
 * WeaponCard component displays detailed information about a weapon
 *
 * @component
 * @param {Object} props - Component props
 * @param {Weapon} props.weapon - Weapon data containing name, icon, stats and effect details
 * @returns {JSX.Element} A card displaying weapon information including:
 * - Weapon icon and basic info (name, rarity stars, type)
 * - Stats (base attack and secondary stat)
 * - Weapon effect description
 */
const WeaponCard: React.FC<WeaponCardProps> = ({ weapon }) => {
  const { name, iconUrl, rarity, effect, attack, subStat, type } = weapon;

  const rarityStars = '★'.repeat(rarity);

  return (
    <div className="flex flex-col border bg-gray-100 border-amber-500/50 rounded-lg text-gray-900">
      <div className="flex items-start gap-4 p-4">
        <AvatarWithSkeleton
          name={name}
          url={iconUrl}
          avatarClassName="w-32 h-32 border-2 border-amber-500"
        />
        <div className="flex flex-col gap-1">
          <h3 className="font-medium text-lg">{name}</h3>
          <p className="text-amber-500">{rarityStars}</p>
          <p className="text-sm text-gray-600">{type}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm p-4 mb-4">
        <div>
          <p className="text-gray-500">Base Attack</p>
          <p className="font-medium">{attack}</p>
        </div>
        <div>
          <p className="text-gray-500">Secondary Stat</p>
          <p className="font-medium">{subStat}</p>
        </div>
      </div>

      <div className="p-4 opacity-70">
        <p className="text-gray-500 text-sm mb-2">Effect</p>
        <div className="text-sm">
          <ListSplitter text={effect} />
        </div>
      </div>
    </div>
  );
};

export default WeaponCard;
