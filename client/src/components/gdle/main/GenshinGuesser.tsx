import React from "react";
import CharacterGuesser from "../characters/CharacterGuesser";
import { useCharacters } from "@/redux/hook/characters";

const GenshinGuesser: React.FC = () => {
  const { characters } = useCharacters();

  if (characters.length === 0) return null;
  return (
    <CharacterGuesser
      selectedCharacter={characters[0]}
      characters={characters}
    />
  );
};

export default GenshinGuesser;
