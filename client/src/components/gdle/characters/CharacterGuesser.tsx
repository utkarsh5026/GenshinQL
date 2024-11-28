import { Character } from "@/graphql/types";
import React, { useMemo, useEffect, useRef } from "react";
import GuessSearchTable from "./GuessSearchTable";
import { useCharacters } from "@/redux/hook/characters";
import useGenshinGuesser from "@/redux/hook/genshin-guesser";
import GameOverDisplay from "./GameOverDisplay";

/**
 * CharacterGuesser component implements the main game logic for the Genshin character guessing game.
 * It manages the game state, handles character selection, guessing, and displays the game interface.
 *
 * The component features:
 * - A search interface for making character guesses
 * - A table showing previous guesses with visual feedback
 * - A counter showing remaining guesses
 * - Game over states (win/lose) with animations
 * - Character reveal with optional party join animation
 * - Reset functionality to start a new game
 *
 * The game allows players MAX_GUESSES attempts to correctly identify a randomly selected character
 * by comparing region, weapon type, and element attributes.
 *
 * @returns A React component containing the complete game interface
 */
const CharacterGuesser: React.FC = () => {
  const { characters, characterMap } = useCharacters();
  const {
    addGuessedChar,
    resetGame,
    currentChar,
    gameWon,
    selectCurrentCharacter,
  } = useGenshinGuesser();

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
      const video = document.createElement("video");
      video.src = selectedCharacter.partyJoin.videoUrl;
      video.preload = "auto";
      video.style.display = "none";
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

  if (!selectedCharacter) return null;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-4">
        <div className="w-2/3">
          <GuessSearchTable
            selectedCharacter={selectedCharacter}
            onGuess={handleGuess}
          />
        </div>
        <div className="w-1/3">
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

export default CharacterGuesser;
