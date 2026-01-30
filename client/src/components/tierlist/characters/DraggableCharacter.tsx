import React from 'react';

import type { Character } from '@/types';

import AvatarWithSkeleton from '../../utils/AvatarWithSkeleton';
import DraggableComponent from '../base/DraggableComponent';

interface DraggableCharacterProps {
  character: Character;
}

const DraggableCharacter: React.FC<DraggableCharacterProps> = ({
  character,
}) => {
  return (
    <DraggableComponent id={character.name}>
      <AvatarWithSkeleton
        url={character.iconUrl}
        name={character.name}
        avatarClassName={`h-16 w-16 p-1 cursor-grab`}
      />
    </DraggableComponent>
  );
};

export default DraggableCharacter;
