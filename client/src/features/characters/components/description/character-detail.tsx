import { useEffect } from 'react';
import { Navigate, useParams } from 'react-router-dom';

import { Avatar, AvatarImage } from '@/components/ui/avatar';
import { ItemNavigation } from '@/components/utils';
import { decideColor } from '@/utils/color';

import {
  useCharacterMap,
  useCharacterProfile,
  useCharacterProfileError,
  useCharacterProfileLoading,
  useCharacters,
  useFetchCharacterProfile,
} from '../../stores';
import CharacterDescription from './character-description';

const CharacterDetail = () => {
  const { characterName } = useParams<{ characterName: string }>();
  const characters = useCharacters();
  const profile = useCharacterProfile(characterName || '');
  const loading = useCharacterProfileLoading(characterName || '');
  const error = useCharacterProfileError(characterName || '');
  const fetchProfile = useFetchCharacterProfile();

  useEffect(() => {
    if (!characterName) return;
    fetchProfile(characterName);
  }, [characterName, fetchProfile]);

  if (loading || !profile) {
    return <CharacterLoadingState characterName={characterName!} />;
  }

  if (error || (!loading && !profile)) {
    return <Navigate to="/talents" replace />;
  }

  const elementColor = decideColor(profile.element);

  return (
    <div className="flex flex-col h-full gap-3">
      <ItemNavigation
        items={characters}
        currentItemName={profile.name}
        routePrefix="/characters"
        accentColor={elementColor}
        labelSingular="character"
      />
      <CharacterDescription character={profile} />
    </div>
  );
};

interface CharacterLoadingStateProps {
  characterName: string;
}

const CharacterLoadingState: React.FC<CharacterLoadingStateProps> = ({
  characterName,
}) => {
  const characterMap = useCharacterMap();
  const character = characterMap[characterName];

  if (!character) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-lg">Loading character...</div>
      </div>
    );
  }

  const elementColor = decideColor(character.element);

  return (
    <div
      className="flex items-center justify-center h-full"
      aria-label="Loading character details"
    >
      <div className={`flex flex-col items-center gap-6 p-8 max-w-md`}>
        <div className="relative flex items-center justify-center">
          <div
            className="absolute w-40 h-40 rounded-full glow-pulse"
            style={{
              background: `radial-gradient(circle, ${elementColor}60 0%, ${elementColor}30 30%, transparent 70%)`,
              filter: 'blur(20px)',
              transform: 'translate3d(0, 0, 0)',
              willChange: 'transform, opacity',
            }}
          />
          {/* Pulsing Ring */}
          <div
            className="absolute w-36 h-36 rounded-full animate-ping"
            style={{
              border: `2px solid ${elementColor}40`,
            }}
          />
          <Avatar
            className="h-32 w-32 border-4 relative z-10"
            style={{
              borderColor: elementColor,
              boxShadow: `0 0 20px ${elementColor}60`,
            }}
          >
            <AvatarImage src={character.iconUrl} alt={character.name} />
          </Avatar>
          <div
            className="absolute -bottom-2 -right-2 w-12 h-12 rounded-full flex items-center justify-center border-2 border-background z-20 animate-bounce"
            style={{
              backgroundColor: `${elementColor}40`,
              borderColor: elementColor,
              boxShadow: `0 0 12px ${elementColor}60`,
            }}
          >
            <img
              src={character.elementUrl}
              alt={character.element}
              className="w-8 h-8"
              style={{
                filter: `drop-shadow(0 2px 8px ${elementColor})`,
              }}
            />
          </div>
        </div>

        {/* Character Name */}
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold" style={{ color: elementColor }}>
            {character.name}
          </h2>
        </div>

        <span className="sr-only">
          Loading detailed information for {character.name}, a{' '}
          {character.rarity} {character.element} character from{' '}
          {character.region}
        </span>
      </div>
    </div>
  );
};

export default CharacterDetail;
