import React from "react";
import DraggableCharacter from "./DraggableCharacter";
import { Character } from "@/graphql/types";
import { useDroppable } from "@dnd-kit/core";
interface CharactersListProps {
  characters: Character[];
}

const CharactersList: React.FC<CharactersListProps> = ({ characters }) => {
  const { setNodeRef } = useDroppable({
    id: "characters",
  });
  return (
    <div className="flex flex-wrap gap-4" ref={setNodeRef}>
      {characters.map((char) => (
        <DraggableCharacter key={char.name} character={char} />
      ))}
    </div>
  );
};

export default CharactersList;
