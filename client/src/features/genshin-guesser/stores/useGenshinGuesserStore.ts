import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

import type { Character } from '@/types';

const MAX_GUESSES = 5;
const STORAGE_KEY = 'genshindle-stats';

interface GameStats {
  gamesPlayed: number;
  gamesWon: number;
  currentStreak: number;
  maxStreak: number;
  guessDistribution: Record<number, number>; // { 1: 5, 2: 10, 3: 8, 4: 3, 5: 2 }
  lastPlayedDate: string | null;
}

interface GenshinGuesserState {
  // State
  guessedChars: string[];
  currentChar: string | null;
  gameOver: boolean;
  gameWon: boolean;
  streak: number;
  stats: GameStats;

  // Actions
  setVictory: () => void;
  setDefeat: () => void;
  setCurrentChar: (charName: string) => void;
  addGuessedChar: (charName: string) => void;
  selectCurrentCharacter: (characters: Character[]) => void;
  resetGame: () => void;
  updateStats: (guessCount: number, won: boolean) => void;
  resetStats: () => void;
}

// Helper to load stats from localStorage
const loadStats = (): GameStats => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Failed to load stats:', e);
  }

  return {
    gamesPlayed: 0,
    gamesWon: 0,
    currentStreak: 0,
    maxStreak: 0,
    guessDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
    lastPlayedDate: null,
  };
};

const saveStats = (stats: GameStats) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
  } catch (e) {
    console.error('Failed to save stats:', e);
  }
};

const initialState = {
  guessedChars: [],
  currentChar: null,
  gameOver: false,
  gameWon: false,
  streak: 0,
  stats: loadStats(),
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
        const { guessedChars, currentChar, updateStats } = get();
        if (guessedChars.includes(charName)) return;

        const newGuessedChars = [...guessedChars, charName];
        const guessCount = newGuessedChars.length;

        if (charName === currentChar) {
          updateStats(guessCount, true);
          set((state) => ({
            guessedChars: newGuessedChars,
            gameWon: true,
            gameOver: true,
            streak: state.streak + 1,
          }));
        } else if (newGuessedChars.length === MAX_GUESSES) {
          updateStats(guessCount, false);
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

      updateStats: (guessCount: number, won: boolean) => {
        set((state) => {
          const newStats = { ...state.stats };

          newStats.gamesPlayed += 1;

          if (won) {
            newStats.gamesWon += 1;
            newStats.currentStreak += 1;
            newStats.maxStreak = Math.max(
              newStats.maxStreak,
              newStats.currentStreak
            );
            newStats.guessDistribution[guessCount] =
              (newStats.guessDistribution[guessCount] || 0) + 1;
          } else {
            newStats.currentStreak = 0;
          }

          newStats.lastPlayedDate = new Date().toISOString();

          saveStats(newStats);

          return { stats: newStats };
        });
      },

      resetStats: () => {
        const freshStats: GameStats = {
          gamesPlayed: 0,
          gamesWon: 0,
          currentStreak: 0,
          maxStreak: 0,
          guessDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
          lastPlayedDate: null,
        };

        saveStats(freshStats);

        set({ stats: freshStats });
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
