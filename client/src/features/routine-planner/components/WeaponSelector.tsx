import React, { useMemo } from 'react';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CachedImage } from '@/features/cache';
import { cn } from '@/lib/utils';
import { useWeapons } from '@/stores';

interface WeaponSelectorProps {
  weaponType: string; // "Sword", "Catalyst", etc.
  selectedWeapon: string | null;
  onSelect: (weaponName: string | null) => void;
  className?: string;
}

export const WeaponSelector: React.FC<WeaponSelectorProps> = ({
  weaponType,
  selectedWeapon,
  onSelect,
  className,
}) => {
  const weapons = useWeapons();

  const compatibleWeapons = useMemo(
    () =>
      weapons
        .filter((w) => w.weaponType === weaponType)
        .sort((a, b) => b.rarity - a.rarity),
    [weapons, weaponType]
  );

  return (
    <Select
      value={selectedWeapon || 'none'}
      onValueChange={(value) => onSelect(value === 'none' ? null : value)}
    >
      <SelectTrigger className={cn('w-full', className)}>
        <SelectValue placeholder="Select weapon..." />
      </SelectTrigger>
      <SelectContent className="max-h-75">
        <SelectItem value="none">
          <span className="text-muted-foreground">No weapon</span>
        </SelectItem>
        {compatibleWeapons.map((weapon) => (
          <SelectItem key={weapon.name} value={weapon.name}>
            <div className="flex items-center gap-2">
              <CachedImage
                src={weapon.iconUrl}
                alt={weapon.name}
                width={24}
                height={24}
                className="w-6 h-6 rounded"
              />
              <span>{weapon.name}</span>
              <span
                className={cn(
                  'ml-auto text-xs',
                  weapon.rarity === 5 ? 'text-amber-400' : 'text-purple-400'
                )}
              >
                {'★'.repeat(weapon.rarity)}
              </span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
