import React from "react";
import { useDroppable } from "@dnd-kit/core";
import CharactersList from "./CharactersList";
import type { Character } from "@/graphql/types";

interface TierLevelProps {
  name: string;
  characters: Character[];
  tierTextBg: string;
}

const TierLevel: React.FC<TierLevelProps> = ({
  name,
  characters,
  tierTextBg,
}) => {
  const { isOver, setNodeRef } = useDroppable({
    id: name,
  });

  return (
    <div className="w-full border-2 border-gray-300 flex min-h-[100px]">
      <div
        className={`w-1/6 flex items-center justify-center text-xl font-bold ${tierTextBg}`}
      >
        {name}
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
