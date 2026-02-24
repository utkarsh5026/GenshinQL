import React from 'react';

import type { Character } from '../../types';
import CharacterCard from './character-card';

interface CharacterCardGridProps {
  characters: Character[];
}

const CharacterCardGrid: React.FC<CharacterCardGridProps> = ({
  characters,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4">
      {characters.map((character) => (
        <CharacterCard key={character.name} character={character} />
      ))}
    </div>
  );
};

export default CharacterCardGrid;
