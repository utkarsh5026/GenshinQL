import { ExternalLink } from 'lucide-react';
import React from 'react';
import { Link } from 'react-router-dom';

import { AvatarWithSkeleton, ListSplitter } from '@/components/utils';
import { WeaponDetailed } from '@/stores/useWeaponsStore';

import { getRarityColor } from '../../utils/color-map';

interface WeaponCardProps {
  weapon: WeaponDetailed;
}

/**
 * WeaponCard component displays detailed information about a weapon
 */
const WeaponCard: React.FC<WeaponCardProps> = ({ weapon }) => {
  const { name, iconUrl, rarity, effect, attack, subStat, weaponType } = weapon;

  const rarityStars = '★'.repeat(rarity);

  const rarityColors = getRarityColor(rarity);

  return (
    <div
      className={`flex flex-col border bg-surface-100 dark:bg-surface-200 ${rarityColors.border} rounded-lg text-foreground shadow-lg`}
    >
      <div className="flex items-start gap-4 p-4">
        <AvatarWithSkeleton
          name={name}
          url={iconUrl}
          avatarClassName={`w-32 h-32 border-2 ${rarityColors.avatarBorder}`}
        />
        <div className="flex flex-col gap-1">
          <h3 className="font-medium text-lg text-foreground">{name}</h3>
          <p className={`${rarityColors.text} font-semibold`}>{rarityStars}</p>
          <p className="text-sm text-muted-foreground">{weaponType}</p>
        </div>
      </div>

      <div
        className={`grid grid-cols-2 gap-4 text-sm p-4 mb-4 border-t ${rarityColors.divider}`}
      >
        <div>
          <p className="text-muted-foreground">Base Attack</p>
          <p className="font-medium text-foreground">{attack}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Secondary Stat</p>
          <p className="font-medium text-foreground">{subStat}</p>
        </div>
      </div>

      <div className="p-4 bg-surface-100 dark:bg-surface-100">
        <p className="text-muted-foreground text-sm mb-2 font-medium">Effect</p>
        <div className="text-sm text-foreground/90">
          <ListSplitter text={effect} />
        </div>
      </div>

      <div className="p-4 border-t">
        <Link
          to={`/weapons/${name}`}
          className="flex items-center justify-center gap-2 text-sm text-blue-500 hover:text-blue-600 transition-colors"
        >
          <span>View Full Details</span>
          <ExternalLink className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
};

export default WeaponCard;
