import React, { useState } from 'react';

import { useWeaponMap, WeaponSummary } from '@/features/weapons';
import { WeaponType } from '@/types';

import type { Character } from '../../../types';
import RoutineTable from './routine-table';
import { WeaponSelector } from './weapon-selector';

interface CharacterRoutineDetailedProps {
  character: Character;
}

export const CharacterRoutine: React.FC<CharacterRoutineDetailedProps> = ({
  character,
}) => {
  const weaponMap = useWeaponMap();
  const [selectedWeapons, setSelectedWeapons] = useState<WeaponSummary[]>([]);

  return (
    <div className="space-y-4">
      {/* Header row: title on left, selector on right */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <h2 className="text-lg font-semibold">Farming Routine</h2>
        <WeaponSelector
          weaponType={character.weaponType as WeaponType}
          selectedWeapons={selectedWeapons}
          onWeaponSelect={(weapon) => {
            const selectedWeapon = weaponMap[weapon.name];
            if (selectedWeapon) {
              setSelectedWeapons([...selectedWeapons, selectedWeapon]);
            }
          }}
          onWeaponRemove={(weapon) => {
            setSelectedWeapons(
              selectedWeapons.filter((w) => w.name !== weapon.name)
            );
          }}
          characterName={character.name}
        />
      </div>

      {/* Results table - always visible */}
      <RoutineTable character={character} selectedWeapons={selectedWeapons} />
    </div>
  );
};
