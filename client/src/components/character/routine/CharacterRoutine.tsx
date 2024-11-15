import React from "react";
import { useCharacters } from "@/redux/hook/characters";
import CharacterSearchBar from "../search/CharacterSearchBar";
import RoutineTable from "./RoutineTable";

const CharacterRoutine: React.FC = () => {
  const { characters } = useCharacters();
  console.log(characters);

  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="col-span-1">
        <CharacterSearchBar
          characters={characters}
          onCharacterSelect={(character) => {
            alert(character.name);
          }}
        />
      </div>
      <RoutineTable />
    </div>
  );
};

export default CharacterRoutine;
