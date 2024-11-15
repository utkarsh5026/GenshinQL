import React from "react";
import type { Character } from "@/graphql/types";
import SearchBar from "@/components/utils/SearchBar";

interface CharacterSearchBarProps {
  characters: Character[];
  onCharacterSelect: (character: Character) => void;
}

const CharacterSearchBar: React.FC<CharacterSearchBarProps> = ({
  characters = [],
  onCharacterSelect,
}) => {
  const charactersSearchBarItems = characters.map((character) => ({
    name: character.name,
    iconUrl: character.iconUrl,
    key: character.name,
  }));

  return (
    <SearchBar
      items={charactersSearchBarItems}
      onItemSelect={(item) => {
        const character = characters.find((c) => c.name === item.name);
        if (character) onCharacterSelect(character);
      }}
    />
  );
};

export default CharacterSearchBar;
