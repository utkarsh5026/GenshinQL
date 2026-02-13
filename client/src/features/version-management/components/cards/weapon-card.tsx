import { useMemo } from 'react';

import type { VersionWeapon } from '../../types';
import { stripSoftHyphens } from '../../utils';

interface WeaponCardProps {
  weapon: VersionWeapon;
}

export default function WeaponCard({ weapon }: WeaponCardProps) {
  const name = useMemo(() => stripSoftHyphens(weapon.name), [weapon.name]);

  return (
    <div className="group relative overflow-hidden rounded-xl border border-starlight-700/30 bg-midnight-900/40 transition-all duration-300 hover:border-celestial-500/30 hover:shadow-lg hover:shadow-midnight-950/50">
      {/* Showcase Image */}
      <div className="relative aspect-video overflow-hidden">
        <img
          src={weapon.showcaseImage}
          alt={name}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />
        {/* Name overlay */}
        <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-midnight-950 via-midnight-950/80 to-transparent p-4 pt-12">
          <h3 className="text-lg font-bold text-celestial-200">{name}</h3>
        </div>
      </div>
    </div>
  );
}
