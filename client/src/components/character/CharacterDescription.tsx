import React from "react";
import { CharacterDetailed } from "@/graphql/types";
import { Card } from "../ui/card";
import ProfileHeader from "./ProfileHeader";
import CharacterTalentTable from "./CharacterTalentTable";

interface CharacterDetailedProps {
  character: CharacterDetailed | null;
}

const CharacterDescription: React.FC<CharacterDetailedProps> = ({
  character,
}) => {
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
        </div>

        <div className="flex-1">
          <Card className="p-4">
            <CharacterTalentTable talents={character.talents} />
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CharacterDescription;
