import React, { useState } from "react";
import CharactersList from "./CharactersList";
import { DndContext, DragEndEvent } from "@dnd-kit/core";
import { useCharacters } from "@/redux/hook/characters";
import { Character } from "@/graphql/types";
import TierLevel from "./TierLevel";

const tierLevels = ["S", "A", "B", "C", "D"];
const tierLevelsBg = [
  "bg-red-800",
  "bg-orange-800",
  "bg-yellow-800",
  "bg-green-800",
  "bg-blue-800",
];

const updateTierListMap = (
  activeId: string,
  overId: string,
  prevMap: Record<string, Character[]>,
  characterMap: Record<string, Character>,
  onlyRemove: boolean = false
) => {
  const updatedMap = Object.keys(prevMap).reduce(
    (acc, level) => {
      acc[level] = prevMap[level].filter((char) => char.name !== activeId);
      return acc;
    },
    {} as Record<string, Character[]>
  );

  if (onlyRemove) return updatedMap;

  const overLevel = [...updatedMap[overId], characterMap[activeId]];
  return { ...updatedMap, [overId]: overLevel };
};

const CharacterTierList: React.FC = () => {
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
      let onlyRemove = false;
      if (over.id === "characters") {
        setCharactersToJudge([...charactersToJudge, characterMap[active.id]]);
        onlyRemove = true;
      } else
        setCharactersToJudge((prev) =>
          prev.filter((char) => char.name !== active.id)
        );

      setTierListMap((prev) => {
        return updateTierListMap(
          active.id as string,
          over.id as string,
          prev,
          characterMap,
          onlyRemove
        );
      });
    }
  };

  return (
    <div>
      <DndContext onDragEnd={handleDragEnd}>
        <div className="flex flex-col gap-8">
          <div className="">
            {tierLevels.map((level, index) => (
              <TierLevel
                key={level}
                name={level}
                tierTextBg={tierLevelsBg[index]}
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

export default CharacterTierList;
