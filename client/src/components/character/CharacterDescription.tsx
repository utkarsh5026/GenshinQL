import React, { useState } from "react";
import { CharacterDetailed } from "@/graphql/types";
import { Card } from "../ui/card";
import ProfileHeader from "./ProfileHeader";
import CharacterTalentTable from "./CharacterTalentTable";
import CharacterConstellations from "./CharacterConstellations";
import CharacterPassives from "./CharacterPassives";

interface CharacterDetailedProps {
  character: CharacterDetailed | null;
}

type CharacterMenuItem =
  | "Profile"
  | "Talents"
  | "Constellations"
  | "Passives"
  | "Attacks";

const menuItems: CharacterMenuItem[] = [
  "Profile",
  "Talents",
  "Constellations",
  "Passives",
  "Attacks",
];

const CharacterDescription: React.FC<CharacterDetailedProps> = ({
  character,
}) => {
  const [selectedMenuItem, setSelectedMenuItem] =
    useState<CharacterMenuItem>("Profile");

  if (!character) return <div>Character not found</div>;

  return (
    <div className="flex flex-col w-full border-2 border-white rounded-lg">
      <div className="w-full mb-4"></div>

      <div className="flex gap-4 p-4">
        <div className="w-1/4 min-w-[250px]">
          <ProfileHeader
            name={character.name}
            avatarUrl={character.iconUrl}
            coverUrl={character.imageUrls.nameCard}
          />

          <div className="flex flex-col gap-2 mt-4">
            {menuItems.map((item) => (
              <button
                onClick={() => setSelectedMenuItem(item)}
                key={item}
                className={`w-full text-left text-sm text-gray-500 border-2 border-white rounded-lg p-2 hover:bg-white hover:text-black cursor-pointer transition-all duration-300 ${
                  selectedMenuItem === item ? "bg-white text-black" : ""
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1">
          {selectedMenuItem === "Talents" && (
            <Card className="p-4">
              <CharacterTalentTable talents={character.talents} />
            </Card>
          )}
          {selectedMenuItem === "Constellations" && (
            <Card className="p-4">
              <CharacterConstellations
                constellations={character.constellations}
              />
            </Card>
          )}
          {selectedMenuItem === "Passives" && (
            <Card className="p-4">
              <CharacterPassives
                passives={character.talents.filter((talent) => {
                  return ![
                    "Normal Attack",
                    "Elemental Skill",
                    "Elemental Burst",
                  ].includes(talent.talentType);
                })}
              />
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default CharacterDescription;
