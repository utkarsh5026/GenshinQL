import React from 'react';

import CharacterAvatar from './character-avatar';

interface CharacterGridProps {
  characterNames: string[];
}

/**
 * CharacterGrid component displays a grid of character avatars with interactive functionality.
 * Uses CharacterAvatar which provides hover cards (desktop) or drawers (mobile) for character details.
 */
const CharacterGrid: React.FC<CharacterGridProps> = ({ characterNames }) => {
  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-4 lg:grid-cols-6 gap-2">
      {characterNames.map((name) => (
        <CharacterAvatar key={name} characterName={name} />
      ))}
    </div>
  );
};

export default CharacterGrid;
