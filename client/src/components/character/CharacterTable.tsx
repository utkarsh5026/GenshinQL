import React, { useMemo } from "react";
import { useQuery } from "@apollo/client";
import { GET_CHARACTERS } from "@/graphql/queries";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar } from "@/components/ui/avatar";
import { Character } from "@/graphql/types";
import CharacterSheet from "./CharacterSheet";
import { AvatarImage } from "@radix-ui/react-avatar";

const CharactersTable: React.FC = () => {
  const { loading, error, data } = useQuery(GET_CHARACTERS);
  const columnNames = [
    "Icon",
    "Name",
    "Element",
    "Rarity",
    "Weapon Type",
    "Region",
  ];

  const characters: Character[] = useMemo(() => {
    const characters = data?.characters as Character[];

    if (!characters) return [];

    const getCharUrl = (character: Character) => {
      if (character.partyJoinUrl) return character.partyJoinUrl;
      if (character.idleOneUrl) return character.idleOneUrl;
      if (character.idleTwoUrl) return character.idleTwoUrl;
      return character.iconUrl;
    };

    return characters.map((character) => ({
      ...character,
      iconUrl: getCharUrl(character),
      elementUrl: character.elementUrl.split("/revision/")[0],
    }));
  }, [data]);

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
        {characters.map((character: Character) => (
          <CharacterSheet character={character} key={character.name}>
            <TableRow>
              <TableCell>
                <div className="relative h-12 w-12">
                  <Avatar className="relative h-full w-full cursor-pointer transition duration-300 ease-in-out hover:scale-150">
                    <AvatarImage
                      src={character.iconUrl}
                      alt={character.name}
                      loading="lazy"
                      className="h-full w-full"
                    />
                  </Avatar>
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
          </CharacterSheet>
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
        className="rounded-full"
        style={{ width: "24px", height: "24px" }}
      />
      <span>{element}</span>
    </div>
  );
};

export default CharactersTable;
