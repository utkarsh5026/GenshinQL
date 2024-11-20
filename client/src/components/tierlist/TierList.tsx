import React, { useState } from "react";
import CharactersList from "./CharactersList";
import { DndContext, DragEndEvent } from "@dnd-kit/core";
import { useCharacters } from "@/redux/hook/characters";
import { Character } from "@/graphql/types";
import TierLevel from "./TierLevel";

const tierLevels = ["S", "A", "B", "C", "D"];

const TierList: React.FC = () => {
  const { characters, characterMap } = useCharacters();
  const [charactersToJudge, setCharactersToJudge] =
    useState<Character[]>(characters);
  const [tierListMap, setTierListMap] = useState<Record<string, Character[]>>(
    tierLevels.reduce(
      (acc: Record<string, Character[]>, level) => {
        acc[level] = [];
        return acc;
      },
      {} as Record<string, Character[]>
    )
  );

  console.log(tierListMap);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    console.log(active, over);
    if (over && active.id !== over.id) {
      setCharactersToJudge((prev) =>
        prev.filter((char) => char.name !== active.id)
      );
      setTierListMap((prev) => {
        const overLevel = [...prev[over.id]];
        overLevel.push(characterMap[active.id]);
        return { ...prev, [over.id]: overLevel };
      });
    }
  };

  return (
    <div>
      <DndContext onDragEnd={handleDragEnd}>
        <div className="flex flex-col gap-8">
          <div className="">
            {tierLevels.map((level) => (
              <TierLevel
                key={level}
                name={level}
                characters={tierListMap[level]}
              />
            ))}
          </div>
          <CharactersList characters={charactersToJudge} />
        </div>
      </DndContext>
    </div>
  );
};

export default TierList;
