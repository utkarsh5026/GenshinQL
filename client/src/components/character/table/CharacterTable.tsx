import React, { useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table.tsx";
import { AnimationMedia, Character } from "@/types";

import CharacterMediaAvatar from "./CharacterMediaAvatar.tsx";
import { CachedImage } from "@/components/utils/CachedImage";

type CharacterWithMedia = Character & {
  media: AnimationMedia;
};

interface CharactersTableProps {
  characters: Character[];
}

const CharactersTable: React.FC<CharactersTableProps> = ({ characters }) => {
  const columnNames = [
    "Icon",
    "Name",
    "Element",
    "Rarity",
    "Weapon Type",
    "Region",
  ];

  const charactersWithMedia: CharacterWithMedia[] = useMemo(() => {
    if (!characters) return [];

    const getCharMedia = (character: Character) => {
      if (character.partyJoin) return character.partyJoin;
      if (character.idleOne) return character.idleOne;
      if (character.idleTwo) return character.idleTwo;
      return {
        imageUrl: character.iconUrl,
        videoUrl: "",
        caption: character.name,
        videoType: "",
      };
    };

    return characters.map((character) => ({
      ...character,
      media: getCharMedia(character),
    }));
  }, [characters]);

  return (
    <Table>
      <TableHeader>
        <TableRow>
          {columnNames.map((columnName) => (
            <TableHead className="font-bold cursor-pointer" key={columnName}>
              {columnName}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {charactersWithMedia.map((character) => (
          <TableRow key={character.name}>
            <TableCell>
              <div className="relative h-12 w-12">
                <CharacterMediaAvatar media={character.media} />
              </div>
            </TableCell>
            <TableCell className="text-left font-bold">
              {character.name}
            </TableCell>
            <TableCell className="text-left">
              <ElementDisplay
                element={character.element}
                elementUrl={character.elementUrl}
              />
            </TableCell>
            <TableCell className="text-left">
              <RarityDisplay rarity={character.rarity} />
            </TableCell>
            <TableCell className="text-left">
              <ElementDisplay
                element={character.weaponType}
                elementUrl={character.weaponUrl}
              />
            </TableCell>
            <TableCell className="text-left">
              <ElementDisplay
                element={character.region}
                elementUrl={character.regionUrl}
              />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

const ElementDisplay: React.FC<{ element: string; elementUrl: string }> = ({
  element,
  elementUrl,
}) => {
  return (
    <div className="flex items-center space-x-2">
      <CachedImage
        src={elementUrl}
        alt={element}
        width={24}
        height={24}
        className="rounded-full w-6 h-6"
      />
      <span>{element}</span>
    </div>
  );
};

const RarityDisplay: React.FC<{ rarity: string }> = ({ rarity }) => {
  const rarityNum = Number.parseInt(rarity, 10);
  const starColor = rarityNum === 5 ? "text-yellow-500" : "text-violet-500";

  return (
    <div className="flex items-center">
      {Array.from({ length: rarityNum }).map((_, index) => (
        <span key={index} className={`${starColor} text-lg`}>
          ★
        </span>
      ))}
    </div>
  );
};

export default CharactersTable;