import React from "react";
import DraggableCharacter from "./DraggableCharacter";
import { Character } from "@/graphql/types";

interface CharactersListProps {
  characters: Character[];
}

const CharactersList: React.FC<CharactersListProps> = ({ characters }) => {
  return (
    <div className="flex flex-wrap gap-4">
      {characters.map((char) => (
        <DraggableCharacter key={char.name} character={char} />
      ))}
    </div>
  );
};

export default CharactersList;
