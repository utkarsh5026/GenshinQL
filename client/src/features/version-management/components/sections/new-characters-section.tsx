import { Users } from 'lucide-react';

import { useNewCharacters } from '../../stores';
import CharacterCard from '../cards/character-card';
import SectionContainer from '../section-container';

export default function NewCharactersSection() {
  const characters = useNewCharacters();

  if (characters.length === 0) return null;

  return (
    <SectionContainer id="characters" title="New Characters" icon={Users}>
      <div className="grid grid-cols-1 gap-4 md:gap-6 lg:grid-cols-3 md:grid-cols-2">
        {characters.map((character) => (
          <CharacterCard key={character.name} character={character} />
        ))}
      </div>
    </SectionContainer>
  );
}
