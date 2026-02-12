import React from 'react';

import CharacterAvatar from '@/features/characters/components/utils/character-avatar';
import type { Character } from '@/types';

import DraggableComponent from '../base/draggable-component';

interface DraggableCharacterProps {
  character: Character;
}

const DraggableCharacter: React.FC<DraggableCharacterProps> = ({
  character,
}) => {
  return (
    <DraggableComponent id={character.name}>
      <CharacterAvatar
        characterName={character.name}
        avatarClassName={`h-16 w-16 p-1 cursor-grab`}
      />
    </DraggableComponent>
  );
};

export default DraggableCharacter;
