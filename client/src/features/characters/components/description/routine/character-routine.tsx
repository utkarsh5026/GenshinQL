import React, { useEffect, useMemo, useState } from 'react';

import ChipSearchBar from '@/components/utils/ChipSearchBar';
import { WeaponSummary } from '@/features/weapons';
import { useWeaponsStore } from '@/stores';

import type { Character } from '../../../types';
import RoutineTable from './routine-table';

interface CharacterRoutineDetailedProps {
  character: Character;
}

export const CharacterRoutine: React.FC<CharacterRoutineDetailedProps> = ({
  character,
}) => {
  const { fetchWeapons, weapons, weaponMap } = useWeaponsStore();

  const weaponsOfType = useMemo(() => {
    return weapons.filter(
      (weapon) => weapon.weaponType === character.weaponType
    );
  }, [weapons, character.weaponType]);

  const [selectedWeapons, setSelectedWeapons] = useState<WeaponSummary[]>([]);

  useEffect(() => {
    if (weapons.length === 0) {
      fetchWeapons();
    }
  }, [weapons.length, fetchWeapons]);

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
