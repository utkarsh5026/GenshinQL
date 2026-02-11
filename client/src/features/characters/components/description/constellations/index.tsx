import React from 'react';

import { Constellation } from '@/features/characters/types';
import { getElementClasses } from '@/features/characters/utils/constellation-utils';

import { ConstellationItem } from './constellation-item';

interface CharacterConstellationsProps {
  constellations: Constellation[];
  element?: string;
  characterName: string;
}

export const CharacterConstellations: React.FC<
  CharacterConstellationsProps
> = ({ constellations, element, characterName }) => {
  const elementClasses = getElementClasses(element);

  return (
    <div className="flex flex-col gap-2">
      {constellations.map((constellation) => (
        <ConstellationItem
          key={constellation.name}
          constellation={constellation}
          elementClasses={elementClasses}
          characterName={characterName}
        />
      ))}
    </div>
  );
};
