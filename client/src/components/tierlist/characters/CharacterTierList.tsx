import React, { useState } from "react";
import { DndContext, DragEndEvent } from "@dnd-kit/core";
import { useCharacters } from "@/redux/hook/characters";
import { Character } from "@/graphql/types";
import TierLevel from "./TierLevel";
import DroppableArea from "../base/DroppableArea";
import DraggableCharacter from "./DraggableCharacter";

const tierLevels = ["S", "A", "B", "C", "D"];
const tierLevelsBg = [
  "bg-red-800",
  "bg-orange-800",
  "bg-yellow-800",
  "bg-green-800",
  "bg-blue-800",
];

/**
 * Updates the tier list mapping when a character is dragged between tiers
 * @param activeId - The name/ID of the character being dragged
 * @param overId - The ID of the tier the character is being dropped into
 * @param prevMap - The previous tier list mapping of characters
 * @param characterMap - Map of character names to Character objects
 * @param onlyRemove - If true, only removes character from previous tier without adding to new tier
 * @returns Updated tier list mapping with character moved to new tier
 */
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

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    console.log(active, over);
    if (over && active.id !== over.id) {
      let onlyRemove = false;
      if (over.id === "characters") {
        setCharactersToJudge((prev) => {
          const alreadyInTier = prev.find((char) => char.name === active.id);
          if (alreadyInTier) return prev;
          return [...prev, characterMap[active.id]];
        });
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

  const handleTierNameChange = (prevName: string, newName: string) => {
    const tierCharacters = tierListMap[prevName];
    setTierListMap((prev) => {
      // Create new object maintaining order of keys
      const updatedMap: Record<string, Character[]> = {};
      Object.keys(prev).forEach((key) => {
        if (key === prevName) {
          updatedMap[newName] = tierCharacters;
        } else {
          updatedMap[key] = prev[key];
        }
      });
      return updatedMap;
    });
  };

  const isValidTierName = (name: string) => {
    return name.length > 0 && !Object.keys(tierListMap).includes(name);
  };

  return (
    <div>
      <DndContext onDragEnd={handleDragEnd}>
        <div className="flex flex-col gap-8">
          <div className="">
            {Object.keys(tierListMap).map((level, index) => (
              <TierLevel
                key={level}
                name={level}
                tierTextBg={tierLevelsBg[index]}
                characters={tierListMap[level]}
                onNameChange={handleTierNameChange}
                isValidName={isValidTierName}
              />
            ))}
          </div>
          <DroppableArea id="characters" className="flex flex-wrap gap-4">
            {charactersToJudge.map((char) => (
              <DraggableCharacter key={char.name} character={char} />
            ))}
          </DroppableArea>
        </div>
      </DndContext>
    </div>
  );
};

export default CharacterTierList;
