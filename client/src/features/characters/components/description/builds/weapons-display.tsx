import React from 'react';
import { Link } from 'react-router-dom';

import { CachedImage } from '@/features/cache';
import { useWeaponsStore } from '@/features/weapons/stores/useWeaponsStore';
import { CharacterBuild } from '@/types';

interface WeaponsDisplayProps {
  weapons: CharacterBuild['weapons'];
  elementColor: string;
}

export const WeaponsDisplay: React.FC<WeaponsDisplayProps> = ({
  weapons,
  elementColor,
}) => {
  const weaponMap = useWeaponsStore((state) => state.weaponMap);

  const getWeaponIcon = (weaponName: string) => {
    const weapon = weaponMap[weaponName];
    return weapon?.iconUrl;
  };

  const getRarityStars = (weaponName: string) => {
    const weapon = weaponMap[weaponName];
    return weapon ? '★'.repeat(weapon.rarity) : '';
  };

  return (
    <div className="space-y-6">
      {/* 5-Star Weapons */}
      {weapons.fiveStar.length > 0 && (
        <div>
          <h4
            className="text-sm font-semibold uppercase tracking-wider mb-4"
            style={{ color: elementColor }}
          >
            5-Star Weapons
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {weapons.fiveStar.map((weapon) => (
              <WeaponMiniCard
                key={weapon.name}
                weaponName={weapon.name}
                notes={weapon.notes}
                iconUrl={getWeaponIcon(weapon.name)}
                rarity={getRarityStars(weapon.name)}
                elementColor={elementColor}
              />
            ))}
          </div>
        </div>
      )}

      {/* 4-Star Weapons */}
      {weapons.fourStar.length > 0 && (
        <div>
          <h4
            className="text-sm font-semibold uppercase tracking-wider mb-4"
            style={{ color: elementColor }}
          >
            4-Star Weapons
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {weapons.fourStar.map((weapon) => (
              <WeaponMiniCard
                key={weapon.name}
                weaponName={weapon.name}
                notes={weapon.notes}
                iconUrl={getWeaponIcon(weapon.name)}
                rarity={getRarityStars(weapon.name)}
                elementColor={elementColor}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

interface WeaponMiniCardProps {
  weaponName: string;
  notes?: string;
  iconUrl?: string;
  rarity?: string;
  elementColor: string;
}

const WeaponMiniCard: React.FC<WeaponMiniCardProps> = ({
  weaponName,
  notes,
  iconUrl,
  rarity,
  elementColor,
}) => {
  const [isHovered, setIsHovered] = React.useState(false);

  const content = (
    <div
      className="group relative p-3 rounded-lg border transition-all duration-300 hover:-translate-y-1 h-full flex flex-col"
      style={{
        borderColor: `${elementColor}20`,
        backgroundColor: 'rgba(0, 0, 0, 0.2)',
        boxShadow: isHovered
          ? `0 6px 16px ${elementColor}20`
          : `0 2px 8px ${elementColor}10`,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Weapon Icon */}
      <div className="flex justify-center mb-2">
        {iconUrl ? (
          <CachedImage
            src={iconUrl}
            alt={weaponName}
            lazy={true}
            rootMargin="200px"
            showSkeleton={true}
            skeletonShape="rounded"
            skeletonSize="md"
            className="w-16 h-16 object-contain"
          />
        ) : (
          <div className="w-16 h-16 rounded-lg bg-midnight-700 flex items-center justify-center text-xs font-bold text-muted-foreground">
            {weaponName.substring(0, 2)}
          </div>
        )}
      </div>

      {/* Rarity */}
      {rarity && (
        <div
          className="text-center text-xs mb-1"
          style={{ color: elementColor }}
        >
          {rarity}
        </div>
      )}

      {/* Weapon Name */}
      <div className="text-center text-xs font-medium text-starlight-200 mb-2 line-clamp-2 grow">
        {weaponName}
      </div>

      {/* Notes */}
      {notes && (
        <div
          className="text-[10px] text-muted-foreground text-center line-clamp-2 pt-2 border-t"
          style={{ borderColor: `${elementColor}15` }}
        >
          {notes}
        </div>
      )}
    </div>
  );

  if (iconUrl) {
    return (
      <Link to={`/weapons`} className="block h-full">
        {content}
      </Link>
    );
  }

  return content;
};
