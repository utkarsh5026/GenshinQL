import React, { useState } from "react";
import { CharacterDetailed } from "@/graphql/types";
import { Card } from "../ui/card";
import ProfileHeader from "./ProfileHeader";
import CharacterTalentTable from "./talents/CharacterTalentTable";
import CharacterConstellations from "./CharacterConstellations";
import CharacterPassives from "./CharacterPassives";
import { decideColor } from "@/utils/color";
import CharacterAttackAnimations from "./CharacterAttackAnimations";

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
    <div
      className={`relative flex flex-col h-[90vh] overflow-auto border-2 rounded-lg scrollbar-hide`}
      style={{ borderColor: decideColor(character.element) }}
    >
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `url(${character.imageUrls.nameCard})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          opacity: 0.03,
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

        <div className="flex flex-grow overflow-auto h-[calc(100%-2rem)] scrollbar-hide">
          {selectedMenuItem === "Talents" && (
            <CharacterCard>
              <CharacterTalentTable talents={character.talents} />
            </CharacterCard>
          )}
          {selectedMenuItem === "Constellations" && (
            <CharacterCard>
              <CharacterConstellations
                constellations={character.constellations}
              />
            </CharacterCard>
          )}
          {selectedMenuItem === "Passives" && (
            <CharacterCard>
              <CharacterPassives
                passives={character.talents.filter((talent) => {
                  return ![
                    "Normal Attack",
                    "Elemental Skill",
                    "Elemental Burst",
                  ].includes(talent.talentType);
                })}
              />
            </CharacterCard>
          )}
          {selectedMenuItem === "Attacks" && (
            <CharacterCard>
              <CharacterAttackAnimations character={character} />
            </CharacterCard>
          )}
        </div>
      </div>
    </div>
  );
};

interface CharacterCardProps {
  children: React.ReactNode;
}

const CharacterCard: React.FC<CharacterCardProps> = ({ children }) => {
  return (
    <Card className="p-4 h-full w-full overflow-auto scrollbar-hide bg-transparent">
      {children}
    </Card>
  );
};

export default CharacterDescription;
