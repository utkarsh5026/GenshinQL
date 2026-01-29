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
        set(
          (state) => ({
            gameWon: true,
            gameOver: true,
            streak: state.streak + 1,
          }),
          false,
          'guesser/setVictory'
        );
      },

      setDefeat: () => {
        set(
          {
            gameOver: true,
            gameWon: false,
            streak: 0,
          },
          false,
          'guesser/setDefeat'
        );
      },

      setCurrentChar: (charName) => {
        set({ currentChar: charName }, false, 'guesser/setCurrentChar');
      },

      addGuessedChar: (charName) => {
        const { guessedChars, currentChar } = get();

        // Prevent duplicate guesses
        if (guessedChars.includes(charName)) return;

        const newGuessedChars = [...guessedChars, charName];

        if (charName === currentChar) {
          set(
            (state) => ({
              guessedChars: newGuessedChars,
              gameWon: true,
              gameOver: true,
              streak: state.streak + 1,
            }),
            false,
            'guesser/addGuess/victory'
          );
        } else if (newGuessedChars.length === MAX_GUESSES) {
          set(
            {
              guessedChars: newGuessedChars,
              gameOver: true,
              gameWon: false,
              streak: 0,
            },
            false,
            'guesser/addGuess/defeat'
          );
        } else {
          set(
            {
              guessedChars: newGuessedChars,
            },
            false,
            'guesser/addGuess'
          );
        }
      },

      selectCurrentCharacter: (characters) => {
        if (characters.length === 0) return;
        const randIdx = Math.floor(Math.random() * characters.length);
        set({ currentChar: characters[randIdx].name }, false, 'guesser/selectChar');
      },

      resetGame: () => {
        const { streak } = get();
        set(
          {
            guessedChars: [],
            currentChar: null,
            gameOver: false,
            gameWon: false,
            streak, // Preserve streak across resets
          },
          false,
          'guesser/reset'
        );
      },
    }),
    { name: 'GenshinGuesserStore' }
  )
);

// Selector hooks for optimized subscriptions
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
