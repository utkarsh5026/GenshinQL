import React, { useState } from 'react';

import ChipSearchBar from '@/components/utils/ChipSearchBar';
import { useWeaponMap, useWeaponType, WeaponSummary } from '@/features/weapons';
import { WeaponType } from '@/types';

import type { Character } from '../../../types';
import RoutineTable from './routine-table';

interface CharacterRoutineDetailedProps {
  character: Character;
}

export const CharacterRoutine: React.FC<CharacterRoutineDetailedProps> = ({
  character,
}) => {
  const { weapons: weaponsOfType } = useWeaponType(
    character.weaponType as WeaponType
  );
  const weaponMap = useWeaponMap();

  const [selectedWeapons, setSelectedWeapons] = useState<WeaponSummary[]>([]);

  return (
    <div>
      <ChipSearchBar
        items={weaponsOfType}
        selectedItems={selectedWeapons}
        onItemSelect={(weapon) => {
          const selectedWeapon = weaponMap[weapon.name];

          if (selectedWeapon) {
            setSelectedWeapons([...selectedWeapons, selectedWeapon]);
          }
        }}
        onItemRemove={(weapon) => {
          setSelectedWeapons(
            selectedWeapons.filter((w) => w.name !== weapon.name)
          );
        }}
        placeholder={`Search weapons for ${character.name} 😊`}
      />
      <RoutineTable character={character} selectedWeapons={selectedWeapons} />
    </div>
  );
};
