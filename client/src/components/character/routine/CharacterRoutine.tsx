import React, { useState, useEffect } from "react";
import { useCharacters } from "@/redux/hook/characters";
import RoutineTable from "./RoutineTable";
import ChipSearchBar from "@/components/utils/ChipSearchBar";

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
  const { characters, fetchCharacters, characterMap } = useCharacters();

  useEffect(() => {
    fetchCharacters();
  }, [fetchCharacters]);

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
        </div>
      </div>
    </div>
  );
};

export default CharacterRoutine;
