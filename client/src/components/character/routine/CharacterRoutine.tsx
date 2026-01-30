import React, { useEffect, useState } from 'react';

import ChipSearchBar from '@/components/utils/ChipSearchBar';
import { useCharactersStore, useWeaponsStore } from '@/stores';
import type { Weapon } from '@/types';

import RoutineTable from './RoutineTable';
/**
 * CharacterRoutine component manages the character farming routine interface.
 * It allows users to select characters and displays their talent book farming days
 * in a weekly schedule format.
 *
 * The component handles:
 * - Character selection and removal
 * - Fetching character data and talent book information
 * - Organizing talent book farming days for selected characters
 * - Displaying the routine in a table format with character icons
 *
 * @component
 * @returns {JSX.Element} Rendered component showing character routine interface
 */
const CharacterRoutine: React.FC = () => {
  const [selectedCharacters, setSelectedCharacters] = useState<string[]>([]);
  const [selectedWeapons, setSelectedWeapons] = useState<Weapon[]>([]);
  const { characters, fetchCharacters, characterMap } = useCharactersStore();
  const { weapons, fetchWeapons, weaponMap } = useWeaponsStore();

  console.log(weapons);

  useEffect(() => {
    fetchCharacters();
    fetchWeapons();
  }, [fetchCharacters, fetchWeapons]);

  return (
    <div className="grid grid-cols-4 gap-4">
      <div className="col-span-3">
        <RoutineTable
          characters={selectedCharacters.map((name) => characterMap[name])}
          weapons={[]}
        />
      </div>
      <div className="col-span-1 flex flex-col">
        <div className="flex-none mb-1">
          <ChipSearchBar
            items={characters}
            selectedItems={selectedCharacters.map((name) => characterMap[name])}
            onItemSelect={(character) => {
              setSelectedCharacters([...selectedCharacters, character.name]);
            }}
            onItemRemove={(character) => {
              setSelectedCharacters(
                selectedCharacters.filter((c) => c !== character.name)
              );
            }}
          />

          <ChipSearchBar
            items={weapons.map((weapon) => {
              return {
                name: weapon.name,
                iconUrl: weapon.iconUrl,
              };
            })}
            selectedItems={selectedWeapons.map((weapon) => {
              return {
                name: weapon.name,
                iconUrl: weapon.iconUrl,
              };
            })}
            onItemSelect={(weapon) => {
              setSelectedWeapons([
                ...selectedWeapons,
                weapons[weaponMap[weapon.name]],
              ]);
            }}
            onItemRemove={(weapon) => {
              setSelectedWeapons(
                selectedWeapons.filter((w) => w.name !== weapon.name)
              );
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default CharacterRoutine;
