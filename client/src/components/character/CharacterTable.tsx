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

    return characters.map((character) => ({
      ...character,
      iconUrl: character.iconUrl.split("/revision/")[0],
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
            <TableHead className="font-bold" key={columnName}>
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
                <Avatar className="bg-blue-500">
                  <AvatarImage
                    src={character.iconUrl}
                    alt={character.name}
                    loading="lazy"
                  />
                </Avatar>
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
