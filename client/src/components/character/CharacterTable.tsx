import React, { useMemo } from "react";
import { useQuery } from "@apollo/client";
import { GET_CHARACTERS } from "@/graphql/queries";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Character } from "@/graphql/types";

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
      <TableCaption>A list of characters.</TableCaption>
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
          <TableRow key={character.name}>
            <TableCell>
              <CharacterIcon
                iconUrl={character.iconUrl}
                name={character.name}
              />
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

const CharacterIcon: React.FC<{ iconUrl: string; name: string }> = ({
  iconUrl,
  name,
}) => {
  return (
    <img
      loading="lazy"
      src={iconUrl}
      alt={name}
      style={{ width: "50px", height: "50px" }}
      onError={(e) => {
        console.error(`Failed to load image: ${iconUrl}`);
        e.currentTarget.style.display = "none";
      }}
    />
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
