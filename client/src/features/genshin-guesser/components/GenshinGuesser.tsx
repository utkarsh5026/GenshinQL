import React from 'react';

import { useCharactersStore } from '@/stores';

import CharacterGuesser from './CharacterGuesser';

const GenshinGuesser: React.FC = () => {
  const { characters } = useCharactersStore();

  if (characters.length === 0) return null;
  return <CharacterGuesser />;
};

export default GenshinGuesser;
