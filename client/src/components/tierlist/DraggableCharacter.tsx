import type { Character } from "@/graphql/types";
import { useDraggable } from "@dnd-kit/core";
import React from "react";
import AvatarWithSkeleton from "../utils/AvatarWithSkeleton";

interface DraggableCharacterProps {
  character: Character;
}

const DraggableCharacter: React.FC<DraggableCharacterProps> = ({
  character,
}) => {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: character.name,
    data: character,
  });

  const style = {
    transform: transform
      ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
      : undefined,
  };

  return (
    <div ref={setNodeRef} {...listeners} {...attributes} style={style}>
      <AvatarWithSkeleton
        url={character.iconUrl}
        name={character.name}
        avatarClassName={`h-16 w-16 p-1`}
      />
    </div>
  );
};

export default DraggableCharacter;
