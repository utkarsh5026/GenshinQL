import React from "react";
import TierLevel from "../base/TierLevel";
import type { Character } from "@/graphql/types";
import DraggableComponent from "../base/DraggableComponent";
import AvatarWithSkeleton from "@/components/utils/AvatarWithSkeleton";

interface CharacterTierLevelProps {
  initialName: string;
  isValidName: (name: string) => boolean;
  onNameChange: (oldName: string, newName: string) => void;
  characters: Character[];
}

const CharacterTierLevel: React.FC<CharacterTierLevelProps> = ({
  initialName,
  isValidName,
  onNameChange,
  characters,
}) => {
  return (
    <TierLevel
      name={initialName}
      isValidName={isValidName}
      onNameChange={onNameChange}
    >
      {characters.map((character) => (
        <DraggableComponent id={character.name}>
          <AvatarWithSkeleton
            name={character.name}
            url={character.iconUrl}
            avatarClassName={`h-16 w-16 p-1 cursor-grab`}
          />
        </DraggableComponent>
      ))}
    </TierLevel>
  );
};

export default CharacterTierLevel;
