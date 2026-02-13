import React from 'react';

import WeaponAvatar from '@/features/weapons/components/shared/card/weapon-avatar';
import type { Weapon } from '@/types';

import TierLevel from '../base/TierLevel';

interface WeaponTierLevelProps {
  initialName: string;
  isValidName: (name: string) => boolean;
  onNameChange: (name: string) => void;
  weapons: Weapon[];
}

const WeaponTierLevel: React.FC<WeaponTierLevelProps> = ({
  initialName,
  isValidName,
  onNameChange,
  weapons,
}) => {
  return (
    <TierLevel
      name={initialName}
      isValidName={isValidName}
      onNameChange={onNameChange}
    >
      {weapons.map((weapon) => (
        <WeaponAvatar key={weapon.name} weaponName={weapon.name} />
      ))}
    </TierLevel>
  );
};

export default WeaponTierLevel;
