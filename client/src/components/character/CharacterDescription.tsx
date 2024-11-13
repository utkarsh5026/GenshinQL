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

  console.log(character.screenAnimation);

  return (
    <div className="relative flex flex-col w-full h-[calc(100%-8rem)] overflow-auto border-2 border-white rounded-lg scrollbar-hide">
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `url(${character.imageUrls.nameCard})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          opacity: 0.1,
        }}
      />

      <div className="relative z-10 flex gap-4 p-4 h-full">
        <div className="w-1/4 min-w-[250px]">
          <ProfileHeader
            name={character.name}
            avatarUrl={character.iconUrl}
            idleOne={character.screenAnimation?.idleOne}
            idleTwo={character.screenAnimation?.idleTwo}
            fallbackCoverUrl={character.imageUrls.nameCard}
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

        <div className="flex overflow-auto h-[calc(100%-2rem)] scrollbar-hide">
          {selectedMenuItem === "Talents" && (
            <Card className="p-4 h-full w-full overflow-auto scrollbar-hide">
              <CharacterTalentTable talents={character.talents} />
            </Card>
          )}
          {selectedMenuItem === "Constellations" && (
            <Card className="p-4 h-full w-full overflow-auto scrollbar-hide">
              <CharacterConstellations
                constellations={character.constellations}
              />
            </Card>
          )}
          {selectedMenuItem === "Passives" && (
            <Card className="p-4 h-full w-full overflow-auto scrollbar-hide">
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
