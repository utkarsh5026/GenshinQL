import React from "react";
import SearchBar from "@/components/utils/SearchBar";
import GuessTable from "./GuessTable";
import type { Character } from "@/types";
import Confetti from "react-confetti";
import { Card, CardContent } from "@/components/ui/card";
import { useCharactersStore, useGenshinGuesserStore } from "@/stores";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface GuessSearchTableProps {
  selectedCharacter: Character;
  onGuess: (character: Character) => void;
}

/**
 * GuessSearchTable component displays the main game interface for the Genshin character guessing game.
 * It includes a search bar for making guesses, a table showing previous guesses, and win/lose states.
 *
 * @param selectedCharacter - The target character that players need to guess
 * @param onGuess - Callback function triggered when a player makes a guess
 * @returns A card containing the game interface with search functionality and guess history
 */
const GuessSearchTable: React.FC<GuessSearchTableProps> = ({
  selectedCharacter,
  onGuess,
}) => {
  const { characters, characterMap } = useCharactersStore();
  const { guessedChars, gameWon, gameOver } = useGenshinGuesserStore();

  const guessedCharacters = guessedChars.map((char) => characterMap[char]);

  return (
    <Card className="border-none bg-card/95 backdrop-blur-sm">
      <CardContent className="p-8 space-y-6">
        {gameWon && (
          <Confetti
            width={window.innerWidth}
            height={window.innerHeight}
            numberOfPieces={300}
            recycle={false}
            gravity={0.3}
            colors={["#fbbf24", "#a855f7", "#22c55e"]}
          />
        )}

        {gameOver || gameWon ? (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className={cn(
              "text-center py-4 px-6 rounded-xl text-xl font-bold border-2",
              gameWon
                ? "text-game-correct border-game-correct bg-game-correct/10"
                : "text-game-wrong border-game-wrong bg-game-wrong/10"
            )}
          >
            {gameWon ? "Perfect! You guessed it! 🎉" : "Game Over! 🥺"}
          </motion.div>
        ) : (
          <SearchBar
            items={characters.map((character) => ({
              name: character.name,
              iconUrl: character.iconUrl,
            }))}
            onItemSelect={(item) => {
              onGuess(characterMap[item.name]);
            }}
          />
        )}

        <GuessTable
          characters={guessedCharacters}
          correctCharacter={selectedCharacter}
        />
      </CardContent>
    </Card>
  );
};

export default GuessSearchTable;
