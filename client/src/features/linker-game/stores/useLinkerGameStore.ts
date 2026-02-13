import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { useShallow } from 'zustand/react/shallow';

import type { Character } from '@/types';

import { DIFFICULTY_CONFIG } from '../constants';
import { generateNewTurn } from '../services';
import type {
  LinkerDifficulty,
  LinkerGameStats,
  LinkerGameStatus,
  LinkerTurn,
  SelectionMode,
} from '../types';

interface LinkerGameState {
  // Game state
  gameStatus: LinkerGameStatus;
  difficulty: LinkerDifficulty;
  selectionMode: SelectionMode;
  gridSize: number;
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
  selectedCharacters: string[]; // For multi-select mode
  comboCount: number; // Track combo in current turn
  showingResult: boolean;

  // All characters (stored for generating new turns)
  allCharacters: Character[];

  // Actions
  initializeGame: (
    characters: Character[],
    difficulty: LinkerDifficulty,
    selectionMode: SelectionMode,
    gridSize: number
  ) => void;
  selectCharacter: (characterName: string) => void;
  confirmSelection: () => void; // For multi-select mode
  handleTimeout: () => void;
  resetGame: () => void;
  setDifficulty: (difficulty: LinkerDifficulty) => void;
  setSelectionMode: (mode: SelectionMode) => void;
  setGridSize: (gridSize: number) => void;
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

export const useLinkerGameStore = create<LinkerGameState>()(
  devtools(
    (set, get) => ({
      gameStatus: 'idle',
      difficulty: 'medium',
      selectionMode: 'single',
      gridSize: 6,
      lives: 3,
      maxLives: 3,
      currentTurn: null,
      isProcessingAnswer: false,
      stats: { ...initialStats },
      lastAnswerCorrect: null,
      selectedCharacterName: null,
      selectedCharacters: [],
      comboCount: 0,
      showingResult: false,
      allCharacters: [],

      initializeGame: (characters, difficulty, selectionMode, gridSize) => {
        const turn = generateNewTurn(characters, difficulty, gridSize);

        set({
          allCharacters: characters,
          difficulty,
          selectionMode,
          gridSize,
          lives: 3,
          maxLives: 3,
          currentTurn: turn,
          gameStatus: 'playing',
          isProcessingAnswer: false,
          stats: { ...initialStats, startTime: Date.now() },
          lastAnswerCorrect: null,
          selectedCharacterName: null,
          selectedCharacters: [],
          comboCount: 0,
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
          selectionMode,
          selectedCharacters,
          comboCount,
        } = get();

        if (gameStatus !== 'playing' || isProcessingAnswer || !currentTurn)
          return;

        // Check if already selected in multi mode
        if (
          selectionMode === 'multi' &&
          selectedCharacters.includes(characterName)
        ) {
          return;
        }

        const isCorrect =
          currentTurn.correctCharacterNames.includes(characterName);
        const config = DIFFICULTY_CONFIG[difficulty];

        if (selectionMode === 'single') {
          // Single selection mode - original behavior
          set({
            isProcessingAnswer: true,
            selectedCharacterName: characterName,
          });

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
              const {
                gameStatus: currentStatus,
                allCharacters: chars,
                gridSize: currentGridSize,
              } = get();
              if (currentStatus !== 'playing') return;

              const newTurn = generateNewTurn(
                chars,
                difficulty,
                currentGridSize
              );
              set({
                currentTurn: newTurn,
                isProcessingAnswer: false,
                lastAnswerCorrect: null,
                selectedCharacterName: null,
                selectedCharacters: [],
                comboCount: 0,
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
                const {
                  gameStatus: currentStatus,
                  allCharacters: chars,
                  gridSize: currentGridSize,
                } = get();
                if (currentStatus !== 'playing') return;

                const newTurn = generateNewTurn(
                  chars,
                  difficulty,
                  currentGridSize
                );
                set({
                  currentTurn: newTurn,
                  isProcessingAnswer: false,
                  lastAnswerCorrect: null,
                  selectedCharacterName: null,
                  selectedCharacters: [],
                  comboCount: 0,
                  showingResult: false,
                });
              }, 1200);
            }
          }
        } else {
          // Multi-select mode
          if (isCorrect) {
            const newSelectedCharacters = [
              ...selectedCharacters,
              characterName,
            ];
            const newComboCount = comboCount + 1;

            // Calculate combo bonus: base points + combo multiplier
            const comboMultiplier = Math.min(newComboCount, 5); // Cap at 5x
            const elapsed = Date.now() - currentTurn.turnStartTime;
            const remainingMs = Math.max(0, config.timePerTurn - elapsed);
            const remainingSeconds = Math.floor(remainingMs / 1000);
            const timeBonus = remainingSeconds * config.timeMultiplier;
            const comboBonus = newComboCount > 1 ? (newComboCount - 1) * 50 : 0;
            const totalPoints =
              config.basePoints * comboMultiplier + timeBonus + comboBonus;

            const newStreak = stats.currentStreak + 1;
            const newLongestStreak = Math.max(stats.longestStreak, newStreak);

            set({
              selectedCharacters: newSelectedCharacters,
              selectedCharacterName: characterName,
              comboCount: newComboCount,
              lastAnswerCorrect: true,
              stats: {
                ...stats,
                score: stats.score + totalPoints,
                correctAnswers: stats.correctAnswers + 1,
                currentStreak: newStreak,
                longestStreak: newLongestStreak,
              },
            });

            // Check if all correct options have been selected
            const allCorrectSelected = currentTurn.correctCharacterNames.every(
              (name) => newSelectedCharacters.includes(name)
            );

            if (allCorrectSelected) {
              // All correct! End turn with success
              set({
                isProcessingAnswer: true,
                showingResult: true,
              });

              setTimeout(() => {
                const {
                  gameStatus: currentStatus,
                  allCharacters: chars,
                  gridSize: currentGridSize,
                } = get();
                if (currentStatus !== 'playing') return;

                const newTurn = generateNewTurn(
                  chars,
                  difficulty,
                  currentGridSize
                );
                set({
                  currentTurn: newTurn,
                  isProcessingAnswer: false,
                  lastAnswerCorrect: null,
                  selectedCharacterName: null,
                  selectedCharacters: [],
                  comboCount: 0,
                  showingResult: false,
                  stats: {
                    ...get().stats,
                    totalRounds: get().stats.totalRounds + 1,
                  },
                });
              }, 1000);
            }
          } else {
            // Wrong answer in multi mode - lose a life and end turn
            const newLives = lives - 1;

            set({
              isProcessingAnswer: true,
              lastAnswerCorrect: false,
              showingResult: true,
              selectedCharacterName: characterName,
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
                const {
                  gameStatus: currentStatus,
                  allCharacters: chars,
                  gridSize: currentGridSize,
                } = get();
                if (currentStatus !== 'playing') return;

                const newTurn = generateNewTurn(
                  chars,
                  difficulty,
                  currentGridSize
                );
                set({
                  currentTurn: newTurn,
                  isProcessingAnswer: false,
                  lastAnswerCorrect: null,
                  selectedCharacterName: null,
                  selectedCharacters: [],
                  comboCount: 0,
                  showingResult: false,
                });
              }, 1200);
            }
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
            const {
              gameStatus: currentStatus,
              allCharacters: chars,
              gridSize: currentGridSize,
            } = get();
            if (currentStatus !== 'playing') return;

            const newTurn = generateNewTurn(chars, difficulty, currentGridSize);
            set({
              currentTurn: newTurn,
              isProcessingAnswer: false,
              lastAnswerCorrect: null,
              selectedCharacterName: null,
              selectedCharacters: [],
              comboCount: 0,
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
          selectedCharacters: [],
          comboCount: 0,
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
          selectedCharacters: [],
          comboCount: 0,
          showingResult: false,
        });
      },

      setSelectionMode: (mode) => {
        set({ selectionMode: mode });
      },

      setGridSize: (gridSize) => {
        set({ gridSize });
      },

      confirmSelection: () => {
        // This is called when player wants to end their multi-select turn early
        const {
          currentTurn,
          selectedCharacters,
          difficulty,
          gameStatus,
          isProcessingAnswer,
        } = get();

        if (gameStatus !== 'playing' || isProcessingAnswer || !currentTurn)
          return;
        if (selectedCharacters.length === 0) return;

        set({
          isProcessingAnswer: true,
          showingResult: true,
        });

        setTimeout(() => {
          const {
            gameStatus: currentStatus,
            allCharacters: chars,
            gridSize: currentGridSize,
          } = get();
          if (currentStatus !== 'playing') return;

          const newTurn = generateNewTurn(chars, difficulty, currentGridSize);
          set({
            currentTurn: newTurn,
            isProcessingAnswer: false,
            lastAnswerCorrect: null,
            selectedCharacterName: null,
            selectedCharacters: [],
            comboCount: 0,
            showingResult: false,
            stats: {
              ...get().stats,
              totalRounds: get().stats.totalRounds + 1,
            },
          });
        }, 800);
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

export const useLinkerGameSelectionMode = () =>
  useLinkerGameStore((state) => state.selectionMode);

export const useLinkerGameSelectedCharacters = () =>
  useLinkerGameStore((state) => state.selectedCharacters);

export const useLinkerGameComboCount = () =>
  useLinkerGameStore((state) => state.comboCount);
