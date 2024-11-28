import React from "react";
import SearchBar from "@/components/utils/SearchBar";
import GuessTable from "./GuessTable";
import type { Character } from "@/graphql/types";
import Confetti from "react-confetti";
import { Card, CardContent } from "@/components/ui/card";
import { useCharacters } from "@/redux/hook/characters";
import useGenshinGuesser from "@/redux/hook/genshin-guesser";

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
  const { characters, characterMap } = useCharacters();
  const { guessedChars, gameWon, gameOver } = useGenshinGuesser();

  const guessedCharacters = guessedChars.map((char) => characterMap[char]);

  return (
    <Card className="border-none">
      <CardContent className="p-6">
        {gameWon && (
          <Confetti
            width={window.innerWidth}
            height={window.innerHeight}
            numberOfPieces={200}
            recycle={true}
          />
        )}
        <div className="flex flex-col gap-4">
          {gameOver || gameWon ? (
            <div
              className={`text-center text-xl font-bold ${
                gameWon ? "text-green-700" : "text-red-700"
              }`}
            >
              {gameWon ? "You guessed it correctly! 🎉" : "You lost! 🥺"}
            </div>
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
        </div>
      </CardContent>
    </Card>
  );
};

export default GuessSearchTable;
