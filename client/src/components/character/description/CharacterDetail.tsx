import { useEffect, useState } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { fetchCharacterDetailed } from '@/services/dataService';
import type { CharacterDetailed as CharacterDetailedType } from '@/types';
import CharacterDescription from './CharacterDescription';

const CharacterDetail = () => {
  const { characterName } = useParams<{ characterName: string }>();
  const [character, setCharacter] = useState<CharacterDetailedType | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!characterName) {
      setError(true);
      setLoading(false);
      return;
    }

    const loadCharacter = async () => {
      setLoading(true);
      setError(false);

      const fileName = characterName.split(' ').join('_');
      const charData = await fetchCharacterDetailed(fileName);

      if (charData) {
        setCharacter(charData);
      } else {
        setError(true);
      }
      setLoading(false);
    };

    loadCharacter();
  }, [characterName]);

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
