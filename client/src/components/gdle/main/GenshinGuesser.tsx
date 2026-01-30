import React from "react";
import CharacterGuesser from "../characters/CharacterGuesser";
import { useCharactersStore } from "@/stores";

const GenshinGuesser: React.FC = () => {
  const { characters } = useCharactersStore();

  if (characters.length === 0) return null;
  return (
    <CharacterGuesser
      selectedCharacter={characters[0]}
      characters={characters}
    />
  );
};

export default GenshinGuesser;
