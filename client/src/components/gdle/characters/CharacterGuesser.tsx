import { Character } from "@/graphql/types";
import React, { useMemo, useEffect, useRef } from "react";
import GuessSearchTable from "./GuessSearchTable";
import { useCharacters } from "@/redux/hook/characters";
import { Card, CardContent } from "@/components/ui/card";
import AnimatedCover from "@/components/utils/AnimatedCover";
import { Avatar } from "@/components/ui/avatar";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { RefreshCcw } from "lucide-react";
import useGenshinGuesser from "@/redux/hook/genshin-guesser";
const MAX_GUESSES = 5;

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
    guessedChars,
    addGuessedChar,
    resetGame,
    currentChar,
    gameOver,
    gameWon,
    selectCurrentCharacter,
  } = useGenshinGuesser();

  const selectedCharacter = useMemo(() => {
    if (!currentChar) return null;
    return characterMap[currentChar];
  }, [currentChar, characterMap]);

  const guessCount = guessedChars.length;

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
    <div className="flex gap-4">
      <div className="w-2/3">
        <GuessSearchTable
          selectedCharacter={selectedCharacter}
          onGuess={handleGuess}
        />
      </div>
      <div className="w-1/3">
        <Card>
          <CardContent className="p-4 flex flex-col gap-8">
            <div className="text-lg">
              <span>Guess: </span>
              <span className="font-bold text-yellow-700">{`${guessCount}/${MAX_GUESSES}`}</span>
            </div>
            {gameOver && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <div className="text-sm text-gray-500 flex flex-col items-center gap-4">
                  <Avatar className="w-36 h-36">
                    <AnimatedCover
                      animation={selectedCharacter.partyJoin}
                      fallbackUrl={selectedCharacter.iconUrl}
                    />
                  </Avatar>
                  <div className="font-bold">
                    <span
                      className={`${gameWon ? "text-green-700" : "text-red-700"}`}
                    >
                      {gameWon
                        ? `Congrats! You correctly guessed ${selectedCharacter.name} 🎉`
                        : `The correct answer is ${selectedCharacter.name} 🥺`}
                    </span>
                    <img
                      src={selectedCharacter.iconUrl}
                      alt={selectedCharacter.name}
                      className="w-6 h-6 inline-block ml-2 align-text-bottom"
                    />
                  </div>
                  <Button
                    variant="outline"
                    onClick={handleReset}
                    className="flex items-center bg-gray-900"
                  >
                    <RefreshCcw className="w-4 h-4 mr-2" /> Play again
                  </Button>
                </div>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CharacterGuesser;
