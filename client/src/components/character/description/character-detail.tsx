import { useEffect, useState } from 'react';
import { Navigate, useParams } from 'react-router-dom';

import { useFetchCharacter } from '@/stores/useCharactersStore';
import type { CharacterDetailed as CharacterDetailedType } from '@/types';

import CharacterDescription from './character-description';

const CharacterDetail = () => {
  const { characterName } = useParams<{ characterName: string }>();
  const fetchCharacter = useFetchCharacter();
  const [character, setCharacter] = useState<CharacterDetailedType | null>(
    null
  );
  const [loading, setLoading] = useState(!!characterName);
  const [error, setError] = useState(!characterName);

  useEffect(() => {
    if (!characterName) {
      return;
    }

    const loadCharacter = async () => {
      setLoading(true);
      setError(false);

      const charData = await fetchCharacter(characterName);

      if (charData) {
        setCharacter(charData);
      } else {
        setError(true);
      }
      setLoading(false);
    };

    loadCharacter();
  }, [characterName, fetchCharacter]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-lg">Loading character...</div>
      </div>
    );
  }

  if (error || !character) {
    return <Navigate to="/talents" replace />;
  }

  return <CharacterDescription character={character} />;
};

export default CharacterDetail;
