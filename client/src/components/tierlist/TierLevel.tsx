import React from "react";
import { useDroppable } from "@dnd-kit/core";
import CharactersList from "./CharactersList";
import type { Character } from "@/graphql/types";

interface TierLevelProps {
  name: string;
  characters: Character[];
  tierTextBg: string;
  onNameChange: (name: string) => void;
  isValidName: (name: string) => boolean;
}

const TierLevel: React.FC<TierLevelProps> = ({
  name,
  characters,
  tierTextBg,
  onNameChange,
  isValidName,
}) => {
  const { isOver, setNodeRef } = useDroppable({
    id: name,
  });

  const [isEditing, setIsEditing] = React.useState(false);
  const [editableName, setEditableName] = React.useState(name);

  const handleNameClick = () => {
    setIsEditing(true);
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditableName(e.target.value);
  };

  const handleBlur = () => {
    setIsEditing(false);
    if (isValidName(editableName)) {
      onNameChange(editableName);
    } else {
      setEditableName(name);
    }
  };

  return (
    <div className="w-full border-2 border-gray-300 flex min-h-[100px]">
      <div
        className={`w-32 min-w-32 flex items-center justify-center text-lg font-bold ${tierTextBg} p-2 break-words`}
      >
        {isEditing ? (
          <input
            title={editableName}
            type="text"
            value={editableName}
            onChange={handleNameChange}
            onBlur={handleBlur}
            autoFocus
            className="w-full bg-transparent text-center border-none overflow-hidden text-ellipsis"
          />
        ) : (
          <span
            onClick={handleNameClick}
            className="cursor-pointer break-words w-full text-center"
          >
            {editableName}
          </span>
        )}
      </div>
      <div
        ref={setNodeRef}
        className={`flex-1 border-2 border-gray-300 ${isOver ? "bg-slate-900" : "bg-transparent"} p-2`}
      >
        <CharactersList characters={characters} />
      </div>
    </div>
  );
};

export default TierLevel;
