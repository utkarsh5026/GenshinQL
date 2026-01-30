import React from 'react';

import { useCharactersStore } from '@/stores';

import CharacterGuesser from '../characters/CharacterGuesser';

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
