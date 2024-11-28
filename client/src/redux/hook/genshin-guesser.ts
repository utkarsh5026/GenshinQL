import { useCallback } from "react";
import { useAppDispatch, useAppSelector } from "../hooks";
import {
  addGuessedChar as addGuessedCharAction,
  setCurrentChar as setCurrentCharAction,
  resetGame as resetGameAction,
  setVictory as setVictoryAction,
  setDefeat as setDefeatAction,
} from "../slices/genshin-guesser";
import type { Character } from "@/graphql/types";

interface UseGenshinGuesser {
  guessedChars: string[];
  currentChar: string | null;
  gameOver: boolean;
  gameWon: boolean;
  streak: number;
  addGuessedChar: (char: string) => void;
  selectCurrentCharacter: (characters: Character[]) => void;
  resetGame: () => void;
  handleDefeat: () => void;
  handleVictory: () => void;
}

/**
 * Hook for managing the Genshin Guesser game state
 * @returns {Object} Game state and functions
 * @returns {string[]} guessedChars - Array of characters that have been guessed
 * @returns {string | null} currentChar - The current character to guess
 * @returns {boolean} gameOver - Whether the game is over
 * @returns {boolean} gameWon - Whether the player won the game
 * @returns {(char: string) => void} addGuessedChar - Function to add a guessed character
 * @returns {(characters: Character[]) => void} selectCurrentCharacter - Function to randomly select a new character
 * @returns {() => void} resetGame - Function to reset the game state
 * @returns {() => void} handleDefeat - Function to handle defeat
 * @returns {() => void} handleVictory - Function to handle victory
 */
const useGenshinGuesser = (): UseGenshinGuesser => {
  const { guessedChars, currentChar, gameOver, gameWon, streak } =
    useAppSelector((state) => state.genshinGuesser);
  const dispatch = useAppDispatch();

  const addGuessedChar = useCallback(
    (char: string) => {
      if (guessedChars.includes(char)) return;
      dispatch(addGuessedCharAction(char));
    },
    [dispatch, guessedChars]
  );

  const selectCurrentCharacter = useCallback(
    (characters: Character[]) => {
      if (characters.length === 0) return;
      const randIdx = Math.floor(Math.random() * characters.length);
      dispatch(setCurrentCharAction(characters[randIdx].name));
    },
    [dispatch]
  );

  const resetGame = useCallback(() => {
    dispatch(resetGameAction());
  }, [dispatch]);

  const handleDefeat = useCallback(() => {
    dispatch(setDefeatAction());
  }, [dispatch]);

  const handleVictory = useCallback(() => {
    dispatch(setVictoryAction());
  }, [dispatch]);

  return {
    guessedChars,
    addGuessedChar,
    selectCurrentCharacter,
    resetGame,
    currentChar,
    gameOver,
    gameWon,
    streak,
    handleDefeat,
    handleVictory,
  };
};

export default useGenshinGuesser;
