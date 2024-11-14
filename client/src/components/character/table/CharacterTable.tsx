import React, { useEffect, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table.tsx";
import { AnimationMedia, Character } from "@/graphql/types";

import CharacterMediaAvatar from "./CharacterMediaAvatar.tsx";
import { useCharacters } from "@/redux/hook/characters.ts";

type CharacterWithMedia = Character & {
  media: AnimationMedia;
};

const CharactersTable: React.FC = () => {
  const { characters, loading, error, fetchCharacters } = useCharacters();
  const columnNames = [
    "Icon",
    "Name",
    "Element",
    "Rarity",
    "Weapon Type",
    "Region",
  ];

  useEffect(() => {
    if (characters.length === 0) fetchCharacters();
  }, [fetchCharacters, characters]);

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
      elementUrl: character.elementUrl.split("/revision/")[0],
    }));
  }, [characters]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

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
            <TableCell className="text-left">{character.rarity}</TableCell>
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
      <img
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

export default CharactersTable;