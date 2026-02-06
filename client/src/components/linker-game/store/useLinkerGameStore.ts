import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { useShallow } from 'zustand/react/shallow';

import type { Character } from '@/types';

import {
  generateGrid,
  getRandomCharacter,
  getRandomLinkType,
} from '../services/gridGeneratorService';
import type {
  LinkerDifficulty,
  LinkerDifficultyConfig,
  LinkerGameStats,
  LinkerGameStatus,
  LinkerTurn,
} from '../types';

const DIFFICULTY_CONFIG: Record<LinkerDifficulty, LinkerDifficultyConfig> = {
  easy: {
    timePerTurn: 15000,
    gridSize: 6,
    basePoints: 100,
    timeMultiplier: 5,
    minCorrect: 2,
    maxCorrect: 3,
  },
  medium: {
    timePerTurn: 10000,
    gridSize: 6,
    basePoints: 150,
    timeMultiplier: 10,
    minCorrect: 1,
    maxCorrect: 2,
  },
  hard: {
    timePerTurn: 5000,
    gridSize: 9,
    basePoints: 200,
    timeMultiplier: 20,
    minCorrect: 1,
    maxCorrect: 2,
  },
};

interface LinkerGameState {
  // Game state
  gameStatus: LinkerGameStatus;
  difficulty: LinkerDifficulty;
  lives: number;
  maxLives: number;

  // Current turn
  currentTurn: LinkerTurn | null;
  isProcessingAnswer: boolean;

  // Stats
  stats: LinkerGameStats;

  // Feedback
  lastAnswerCorrect: boolean | null;
  selectedCharacterName: string | null;
  showingResult: boolean;

  // All characters (stored for generating new turns)
  allCharacters: Character[];

  // Actions
  initializeGame: (
    characters: Character[],
    difficulty: LinkerDifficulty
  ) => void;
  selectCharacter: (characterName: string) => void;
  handleTimeout: () => void;
  resetGame: () => void;
  setDifficulty: (difficulty: LinkerDifficulty) => void;
  clearResult: () => void;
}

const initialStats: LinkerGameStats = {
  score: 0,
  correctAnswers: 0,
  wrongAnswers: 0,
  totalRounds: 0,
  longestStreak: 0,
  currentStreak: 0,
  startTime: null,
  endTime: null,
};

function generateNewTurn(
  characters: Character[],
  difficulty: LinkerDifficulty
): LinkerTurn {
  const config = DIFFICULTY_CONFIG[difficulty];
  const targetCharacter = getRandomCharacter(characters);
  const linkType = getRandomLinkType();
  const linkValue = targetCharacter[linkType];

  const { characters: gridCharacters, correctNames } = generateGrid(
    characters,
    targetCharacter,
    linkType,
    linkValue,
    {
      gridSize: config.gridSize,
      minCorrect: config.minCorrect,
      maxCorrect: config.maxCorrect,
    }
  );

  return {
    targetCharacter,
    linkType,
    linkValue,
    gridCharacters,
    correctCharacterNames: correctNames,
    turnStartTime: Date.now(),
  };
}

export const useLinkerGameStore = create<LinkerGameState>()(
  devtools(
    (set, get) => ({
      gameStatus: 'idle',
      difficulty: 'medium',
      lives: 3,
      maxLives: 3,
      currentTurn: null,
      isProcessingAnswer: false,
      stats: { ...initialStats },
      lastAnswerCorrect: null,
      selectedCharacterName: null,
      showingResult: false,
      allCharacters: [],

      initializeGame: (characters, difficulty) => {
        const turn = generateNewTurn(characters, difficulty);

        set({
          allCharacters: characters,
          difficulty,
          lives: 3,
          maxLives: 3,
          currentTurn: turn,
          gameStatus: 'playing',
          isProcessingAnswer: false,
          stats: { ...initialStats, startTime: Date.now() },
          lastAnswerCorrect: null,
          selectedCharacterName: null,
          showingResult: false,
        });
      },

      selectCharacter: (characterName) => {
        const {
          currentTurn,
          isProcessingAnswer,
          gameStatus,
          stats,
          lives,
          difficulty,
        } = get();

        if (gameStatus !== 'playing' || isProcessingAnswer || !currentTurn)
          return;

        set({ isProcessingAnswer: true, selectedCharacterName: characterName });

        const isCorrect =
          currentTurn.correctCharacterNames.includes(characterName);
        const config = DIFFICULTY_CONFIG[difficulty];

        if (isCorrect) {
          // Calculate time bonus
          const elapsed = Date.now() - currentTurn.turnStartTime;
          const remainingMs = Math.max(0, config.timePerTurn - elapsed);
          const remainingSeconds = Math.floor(remainingMs / 1000);
          const timeBonus = remainingSeconds * config.timeMultiplier;
          const totalPoints = config.basePoints + timeBonus;

          const newStreak = stats.currentStreak + 1;
          const newLongestStreak = Math.max(stats.longestStreak, newStreak);

          set({
            lastAnswerCorrect: true,
            showingResult: true,
            stats: {
              ...stats,
              score: stats.score + totalPoints,
              correctAnswers: stats.correctAnswers + 1,
              totalRounds: stats.totalRounds + 1,
              currentStreak: newStreak,
              longestStreak: newLongestStreak,
            },
          });

          // Generate next turn after delay
          setTimeout(() => {
            const { gameStatus: currentStatus, allCharacters: chars } = get();
            if (currentStatus !== 'playing') return;

            const newTurn = generateNewTurn(chars, difficulty);
            set({
              currentTurn: newTurn,
              isProcessingAnswer: false,
              lastAnswerCorrect: null,
              selectedCharacterName: null,
              showingResult: false,
            });
          }, 800);
        } else {
          // Wrong answer
          const newLives = lives - 1;

          set({
            lastAnswerCorrect: false,
            showingResult: true,
            lives: newLives,
            stats: {
              ...stats,
              wrongAnswers: stats.wrongAnswers + 1,
              totalRounds: stats.totalRounds + 1,
              currentStreak: 0,
            },
          });

          if (newLives <= 0) {
            // Game over
            setTimeout(() => {
              set({
                gameStatus: 'game_over',
                isProcessingAnswer: false,
                stats: {
                  ...get().stats,
                  endTime: Date.now(),
                },
              });
            }, 1000);
          } else {
            // Continue with next turn
            setTimeout(() => {
              const { gameStatus: currentStatus, allCharacters: chars } = get();
              if (currentStatus !== 'playing') return;

              const newTurn = generateNewTurn(chars, difficulty);
              set({
                currentTurn: newTurn,
                isProcessingAnswer: false,
                lastAnswerCorrect: null,
                selectedCharacterName: null,
                showingResult: false,
              });
            }, 1200);
          }
        }
      },

      handleTimeout: () => {
        const { lives, stats, difficulty, gameStatus, isProcessingAnswer } =
          get();

        if (gameStatus !== 'playing' || isProcessingAnswer) return;

        set({
          isProcessingAnswer: true,
          showingResult: true,
          lastAnswerCorrect: false,
        });

        const newLives = lives - 1;

        set({
          lives: newLives,
          stats: {
            ...stats,
            wrongAnswers: stats.wrongAnswers + 1,
            totalRounds: stats.totalRounds + 1,
            currentStreak: 0,
          },
        });

        if (newLives <= 0) {
          setTimeout(() => {
            set({
              gameStatus: 'game_over',
              isProcessingAnswer: false,
              stats: {
                ...get().stats,
                endTime: Date.now(),
              },
            });
          }, 1000);
        } else {
          setTimeout(() => {
            const { gameStatus: currentStatus, allCharacters: chars } = get();
            if (currentStatus !== 'playing') return;

            const newTurn = generateNewTurn(chars, difficulty);
            set({
              currentTurn: newTurn,
              isProcessingAnswer: false,
              lastAnswerCorrect: null,
              selectedCharacterName: null,
              showingResult: false,
            });
          }, 1200);
        }
      },

      resetGame: () => {
        set({
          gameStatus: 'idle',
          lives: 3,
          maxLives: 3,
          currentTurn: null,
          isProcessingAnswer: false,
          stats: { ...initialStats },
          lastAnswerCorrect: null,
          selectedCharacterName: null,
          showingResult: false,
          allCharacters: [],
        });
      },

      setDifficulty: (difficulty) => {
        set({ difficulty });
      },

      clearResult: () => {
        set({
          lastAnswerCorrect: null,
          selectedCharacterName: null,
          showingResult: false,
        });
      },
    }),
    { name: 'LinkerGameStore' }
  )
);

// Selectors
export const useLinkerGameStatus = () =>
  useLinkerGameStore((state) => state.gameStatus);

export const useLinkerGameDifficulty = () =>
  useLinkerGameStore((state) => state.difficulty);

export const useLinkerGameLives = () =>
  useLinkerGameStore((state) => state.lives);

export const useLinkerGameMaxLives = () =>
  useLinkerGameStore((state) => state.maxLives);

export const useLinkerGameCurrentTurn = () =>
  useLinkerGameStore((state) => state.currentTurn);

export const useLinkerGameStats = () =>
  useLinkerGameStore(useShallow((state) => state.stats));

export const useLinkerGameIsProcessing = () =>
  useLinkerGameStore((state) => state.isProcessingAnswer);

export const useLinkerGameLastAnswer = () =>
  useLinkerGameStore(
    useShallow((state) => ({
      correct: state.lastAnswerCorrect,
      selectedName: state.selectedCharacterName,
      showingResult: state.showingResult,
    }))
  );

export const useLinkerGameAllCharacters = () =>
  useLinkerGameStore((state) => state.allCharacters);

export { DIFFICULTY_CONFIG };
