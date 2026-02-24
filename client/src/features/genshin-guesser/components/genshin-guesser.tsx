import React, { useEffect, useMemo, useRef } from 'react';

import { type Character, useCharactersStore } from '@/features/characters';

import { useGenshinGuesserStore } from '../stores/useGenshinGuesserStore';
import GameOverDisplay from './game-over';
import GuessSearchTable from './guess-search-table';

const GenshinGuesser: React.FC = () => {
  const { characters, characterMap } = useCharactersStore();
  const {
    addGuessedChar,
    resetGame,
    currentChar,
    gameWon,
    selectCurrentCharacter,
  } = useGenshinGuesserStore();

  const selectedCharacter = useMemo(() => {
    if (!currentChar) return null;
    return characterMap[currentChar];
  }, [currentChar, characterMap]);

  useEffect(() => {
    if (!currentChar && characters.length > 0)
      selectCurrentCharacter(characters);
  }, [currentChar, characters, selectCurrentCharacter]);

  const handleGuess = (character: Character) => {
    addGuessedChar(character.name);
  };

  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (selectedCharacter?.partyJoin) {
      const video = document.createElement('video');
      video.src = selectedCharacter.partyJoin.videoUrl;
      video.preload = 'auto';
      video.style.display = 'none';
      videoRef.current = video;
      document.body.appendChild(video);

      return () => {
        if (videoRef.current) {
          document.body.removeChild(videoRef.current);
          videoRef.current = null;
        }
      };
    }
  }, [selectedCharacter]);

  const handleReset = () => {
    resetGame();
    selectCurrentCharacter(characters);
  };

  if (characters.length === 0 || !selectedCharacter) return null;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="w-full md:w-2/3">
          <GuessSearchTable
            selectedCharacter={selectedCharacter}
            onGuess={handleGuess}
          />
        </div>
        <div className="w-full md:w-1/3">
          <GameOverDisplay
            selectedCharacter={selectedCharacter}
            gameWon={gameWon}
            onReset={handleReset}
          />
        </div>
      </div>
    </div>
  );
};

export default GenshinGuesser;
