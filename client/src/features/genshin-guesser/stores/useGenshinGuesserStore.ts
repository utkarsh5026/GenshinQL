import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

import type { Character } from '@/types';

const MAX_GUESSES = 5;

interface GenshinGuesserState {
  // State
  guessedChars: string[];
  currentChar: string | null;
  gameOver: boolean;
  gameWon: boolean;
  streak: number;

  // Actions
  setVictory: () => void;
  setDefeat: () => void;
  setCurrentChar: (charName: string) => void;
  addGuessedChar: (charName: string) => void;
  selectCurrentCharacter: (characters: Character[]) => void;
  resetGame: () => void;
}

const initialState = {
  guessedChars: [],
  currentChar: null,
  gameOver: false,
  gameWon: false,
  streak: 0,
};

export const useGenshinGuesserStore = create<GenshinGuesserState>()(
  devtools(
    (set, get) => ({
      ...initialState,

      setVictory: () => {
        set((state) => ({
          gameWon: true,
          gameOver: true,
          streak: state.streak + 1,
        }));
      },

      setDefeat: () => {
        set({
          gameOver: true,
          gameWon: false,
          streak: 0,
        });
      },

      setCurrentChar: (charName) => {
        set({ currentChar: charName });
      },

      addGuessedChar: (charName) => {
        const { guessedChars, currentChar } = get();
        if (guessedChars.includes(charName)) return;

        const newGuessedChars = [...guessedChars, charName];

        if (charName === currentChar) {
          set((state) => ({
            guessedChars: newGuessedChars,
            gameWon: true,
            gameOver: true,
            streak: state.streak + 1,
          }));
        } else if (newGuessedChars.length === MAX_GUESSES) {
          set({
            guessedChars: newGuessedChars,
            gameOver: true,
            gameWon: false,
            streak: 0,
          });
        } else {
          set({
            guessedChars: newGuessedChars,
          });
        }
      },

      selectCurrentCharacter: (characters) => {
        if (characters.length === 0) return;
        const randIdx = Math.floor(Math.random() * characters.length);
        set({ currentChar: characters[randIdx].name });
      },

      resetGame: () => {
        const { streak } = get();
        set({
          guessedChars: [],
          currentChar: null,
          gameOver: false,
          gameWon: false,
          streak, // Preserve streak across resets
        });
      },
    }),
    { name: 'GenshinGuesserStore' }
  )
);

export const useGenshinGuesserGuessedChars = () =>
  useGenshinGuesserStore((state) => state.guessedChars);
export const useGenshinGuesserCurrentChar = () =>
  useGenshinGuesserStore((state) => state.currentChar);
export const useGenshinGuesserGameOver = () =>
  useGenshinGuesserStore((state) => state.gameOver);
export const useGenshinGuesserGameWon = () =>
  useGenshinGuesserStore((state) => state.gameWon);
export const useGenshinGuesserStreak = () =>
  useGenshinGuesserStore((state) => state.streak);
