import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

import type { Character } from '@/types';

const MAX_GUESSES = 5;
const BEST_STREAK_KEY = 'genshin-guesser-best-streak';

function loadBestStreak(): number {
  try {
    const saved = localStorage.getItem(BEST_STREAK_KEY);
    const parsed = parseInt(saved ?? '0', 10);
    return isNaN(parsed) ? 0 : parsed;
  } catch {
    return 0;
  }
}

function saveBestStreak(value: number) {
  try {
    localStorage.setItem(BEST_STREAK_KEY, String(value));
  } catch {
    // ignore storage errors
  }
}

interface GenshinGuesserState {
  // State
  guessedChars: string[];
  currentChar: string | null;
  gameOver: boolean;
  gameWon: boolean;
  streak: number;
  bestStreak: number;

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
  bestStreak: loadBestStreak(),
};

export const useGenshinGuesserStore = create<GenshinGuesserState>()(
  devtools(
    (set, get) => ({
      ...initialState,

      setVictory: () => {
        set((state) => {
          const newStreak = state.streak + 1;
          const newBest = Math.max(state.bestStreak, newStreak);
          if (newBest > state.bestStreak) saveBestStreak(newBest);
          return {
            gameWon: true,
            gameOver: true,
            streak: newStreak,
            bestStreak: newBest,
          };
        });
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
          set((state) => {
            const newStreak = state.streak + 1;
            const newBest = Math.max(state.bestStreak, newStreak);
            if (newBest > state.bestStreak) saveBestStreak(newBest);
            return {
              guessedChars: newGuessedChars,
              gameWon: true,
              gameOver: true,
              streak: newStreak,
              bestStreak: newBest,
            };
          });
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
        const { streak, bestStreak } = get();
        set({
          guessedChars: [],
          currentChar: null,
          gameOver: false,
          gameWon: false,
          streak, // Preserve streak across resets
          bestStreak,
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
export const useGenshinGuesserBestStreak = () =>
  useGenshinGuesserStore((state) => state.bestStreak);
