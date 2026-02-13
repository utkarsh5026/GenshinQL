import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

import type {
  GameDifficulty,
  GameMode,
  GameStatus,
  GameSticker,
  MemoryGameStats,
  MemoryTile,
  ScoreEvent,
} from '@/types';

import {
  COMBO_CONFIG,
  getDifficultyConfig,
  getRandomStickersForGame,
  PEEK_CONFIG,
  TIME_ATTACK_LIMITS,
} from '../services';

interface MemoryGameState {
  tiles: MemoryTile[];
  selectedTiles: number[];
  stats: MemoryGameStats;
  gameStatus: GameStatus;
  difficulty: GameDifficulty;
  isProcessing: boolean;

  // New game mode features
  gameMode: GameMode;
  isPeeking: boolean;
  currentCombo: number;
  timeLimit: number | null;
  timeRemaining: number;
  scoreEvents: ScoreEvent[];

  // Actions
  initializeGame: (stickers: GameSticker[], difficulty: GameDifficulty) => void;
  flipTile: (tileIndex: number) => void;
  resetGame: () => void;
  setDifficulty: (difficulty: GameDifficulty) => void;
  setGameMode: (mode: GameMode) => void;
  endPeek: () => void;
  addScoreEvent: (event: ScoreEvent) => void;
  removeScoreEvent: (id: string) => void;
  updateTimeRemaining: (time: number) => void;
  setGameLost: () => void;
}

const initialStats: MemoryGameStats = {
  score: 0,
  moves: 0,
  matchesFound: 0,
  exactMatches: 0,
  characterMatches: 0,
  startTime: null,
  endTime: null,
  comboBonus: 0,
  timeBonus: 0,
  bombPenalty: 0,
  maxCombo: 0,
  lastMatchTime: null,
};

export const useMemoryGameStore = create<MemoryGameState>()(
  devtools(
    (set, get) => ({
      tiles: [],
      selectedTiles: [],
      stats: { ...initialStats },
      gameStatus: 'idle',
      difficulty: 'medium',
      isProcessing: false,
      gameMode: 'classic',
      isPeeking: false,
      currentCombo: 0,
      timeLimit: null,
      timeRemaining: 0,
      scoreEvents: [],

      initializeGame: (stickers, difficulty) => {
        const config = getDifficultyConfig(difficulty);
        const { gameMode } = get();
        const gameStickers = getRandomStickersForGame(stickers, config.pairs);

        // Determine which tile indices will be bombs (for bomb_mode)
        const bombIndices = new Set<number>();
        if (gameMode === 'bomb_mode' && config.bombCount > 0) {
          // Select random pairs to be bombs
          const pairIndices: number[] = [];
          for (let i = 0; i < config.pairs; i++) {
            pairIndices.push(i);
          }
          // Shuffle and pick first bombCount
          for (let i = pairIndices.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [pairIndices[i], pairIndices[j]] = [pairIndices[j], pairIndices[i]];
          }
          const bombPairIndices = pairIndices.slice(0, config.bombCount);

          // Map pair indices to tile indices (each pair appears twice)
          gameStickers.forEach((sticker, tileIndex) => {
            const stickerUrl = sticker.url;
            // Find which pair this belongs to
            const pairIndex = gameStickers
              .slice(0, config.pairs)
              .findIndex((s) => s.url === stickerUrl);
            if (bombPairIndices.includes(pairIndex)) {
              bombIndices.add(tileIndex);
            }
          });
        }

        const tiles: MemoryTile[] = gameStickers.map((sticker, index) => ({
          id: index,
          sticker,
          isFlipped: false,
          isMatched: false,
          isBomb: bombIndices.has(index),
        }));

        // Set up time attack
        const timeLimit =
          gameMode === 'time_attack' ? TIME_ATTACK_LIMITS[difficulty] : null;

        // Peek mode: start with peeking state
        const peekConfig = PEEK_CONFIG[difficulty];

        set({
          tiles,
          selectedTiles: [],
          stats: { ...initialStats, startTime: Date.now() },
          gameStatus: 'peeking',
          difficulty,
          isProcessing: false,
          isPeeking: true,
          currentCombo: 0,
          timeLimit,
          timeRemaining: timeLimit ?? 0,
          scoreEvents: [],
        });

        // Auto-end peek after duration
        setTimeout(() => {
          const { gameStatus } = get();
          if (gameStatus === 'peeking') {
            get().endPeek();
          }
        }, peekConfig.duration);
      },

      endPeek: () => {
        set({
          isPeeking: false,
          gameStatus: 'playing',
        });
      },

      flipTile: (tileIndex) => {
        const { tiles, selectedTiles, isProcessing, gameStatus, gameMode } =
          get();

        if (gameStatus !== 'playing' || isProcessing) return;

        const tile = tiles[tileIndex];
        if (!tile || tile.isFlipped || tile.isMatched) return;
        if (selectedTiles.includes(tileIndex)) return;

        const newTiles = tiles.map((t, i) =>
          i === tileIndex ? { ...t, isFlipped: true } : t
        );

        const newSelectedTiles = [...selectedTiles, tileIndex];

        if (newSelectedTiles.length === 2) {
          set({
            tiles: newTiles,
            selectedTiles: newSelectedTiles,
            isProcessing: true,
          });

          const [firstIdx, secondIdx] = newSelectedTiles;
          const firstTile = newTiles[firstIdx];
          const secondTile = newTiles[secondIdx];

          const isExactMatch = firstTile.sticker.url === secondTile.sticker.url;
          const isCharacterMatch =
            !isExactMatch &&
            firstTile.sticker.characterName ===
              secondTile.sticker.characterName;

          setTimeout(() => {
            const {
              tiles: currentTiles,
              stats: currentStats,
              currentCombo,
            } = get();

            if (isExactMatch || isCharacterMatch) {
              const now = Date.now();

              // Calculate combo
              const isWithinComboWindow =
                currentStats.lastMatchTime &&
                now - currentStats.lastMatchTime < COMBO_CONFIG.windowMs;
              const newCombo = isWithinComboWindow ? currentCombo + 1 : 1;
              const comboMultiplierIndex = Math.min(
                newCombo - 1,
                COMBO_CONFIG.multipliers.length - 1
              );
              const comboMultiplier =
                COMBO_CONFIG.multipliers[comboMultiplierIndex];

              // Calculate points
              const basePoints = isExactMatch ? 5 : 3;
              const comboPoints = Math.floor(basePoints * comboMultiplier);
              const comboBonusEarned = comboPoints - basePoints;

              // Check bomb penalty
              const isBombMatch = firstTile.isBomb || secondTile.isBomb;
              const unmatchedNonBombs = currentTiles.filter(
                (t) =>
                  !t.isMatched &&
                  !t.isBomb &&
                  t.id !== firstIdx &&
                  t.id !== secondIdx
              ).length;
              // Penalty if matching bomb while non-bombs remain
              const bombPenalty =
                gameMode === 'bomb_mode' && isBombMatch && unmatchedNonBombs > 0
                  ? 10
                  : 0;

              const updatedTiles = currentTiles.map((t, i) =>
                i === firstIdx || i === secondIdx
                  ? {
                      ...t,
                      isMatched: true,
                      bombTriggered: isBombMatch && bombPenalty > 0,
                    }
                  : t
              );

              const newMaxCombo = Math.max(currentStats.maxCombo, newCombo);

              const newStats: MemoryGameStats = {
                ...currentStats,
                score: currentStats.score + comboPoints - bombPenalty,
                moves: currentStats.moves + 1,
                matchesFound: currentStats.matchesFound + 1,
                exactMatches:
                  currentStats.exactMatches + (isExactMatch ? 1 : 0),
                characterMatches:
                  currentStats.characterMatches + (isCharacterMatch ? 1 : 0),
                comboBonus: currentStats.comboBonus + comboBonusEarned,
                bombPenalty: currentStats.bombPenalty + bombPenalty,
                maxCombo: newMaxCombo,
                lastMatchTime: now,
              };

              const allMatched = updatedTiles.every((t) => t.isMatched);
              const newStatus: GameStatus = allMatched ? 'won' : 'playing';

              // Create score events
              const newScoreEvents: ScoreEvent[] = [];
              const eventId = `${now}-${tileIndex}`;

              if (comboPoints > 0) {
                newScoreEvents.push({
                  id: eventId,
                  type: newCombo > 1 ? 'combo' : 'match',
                  points: comboPoints,
                  position: { x: 0, y: 0 }, // Will be set by component
                  timestamp: now,
                  comboLevel: newCombo > 1 ? newCombo : undefined,
                  characterName: firstTile.sticker.characterName,
                });
              }

              if (bombPenalty > 0) {
                newScoreEvents.push({
                  id: `${eventId}-bomb`,
                  type: 'bomb',
                  points: -bombPenalty,
                  position: { x: 0, y: 0 },
                  timestamp: now,
                });
              }

              set((state) => ({
                tiles: updatedTiles,
                selectedTiles: [],
                stats: allMatched
                  ? { ...newStats, endTime: Date.now() }
                  : newStats,
                gameStatus: newStatus,
                isProcessing: false,
                currentCombo: newCombo,
                scoreEvents: [...state.scoreEvents, ...newScoreEvents],
              }));
            } else {
              // No match - reset combo
              set({
                tiles: currentTiles.map((t, i) =>
                  i === firstIdx || i === secondIdx
                    ? { ...t, isFlipped: false }
                    : t
                ),
                selectedTiles: [],
                stats: { ...currentStats, moves: currentStats.moves + 1 },
                isProcessing: false,
                currentCombo: 0,
              });
            }
          }, 1000);
        } else {
          set({ tiles: newTiles, selectedTiles: newSelectedTiles });
        }
      },

      resetGame: () => {
        set({
          tiles: [],
          selectedTiles: [],
          stats: { ...initialStats },
          gameStatus: 'idle',
          isProcessing: false,
          isPeeking: false,
          currentCombo: 0,
          timeLimit: null,
          timeRemaining: 0,
          scoreEvents: [],
        });
      },

      setDifficulty: (difficulty) => {
        set({ difficulty });
      },

      setGameMode: (mode) => {
        set({ gameMode: mode });
      },

      addScoreEvent: (event) => {
        set((state) => ({
          scoreEvents: [...state.scoreEvents, event],
        }));
      },

      removeScoreEvent: (id) => {
        set((state) => ({
          scoreEvents: state.scoreEvents.filter((e) => e.id !== id),
        }));
      },

      updateTimeRemaining: (time) => {
        set({ timeRemaining: time });
      },

      setGameLost: () => {
        const { stats } = get();

        set({
          gameStatus: 'lost',
          stats: {
            ...stats,
            endTime: Date.now(),
            timeBonus: 0,
          },
        });
      },
    }),
    { name: 'MemoryGameStore' }
  )
);

// Selectors
export const useMemoryGameTiles = () =>
  useMemoryGameStore((state) => state.tiles);

export const useMemoryGameStats = () =>
  useMemoryGameStore((state) => state.stats);

export const useMemoryGameStatus = () =>
  useMemoryGameStore((state) => state.gameStatus);

export const useMemoryGameDifficulty = () =>
  useMemoryGameStore((state) => state.difficulty);

export const useMemoryGameIsProcessing = () =>
  useMemoryGameStore((state) => state.isProcessing);

export const useMemoryGameMode = () =>
  useMemoryGameStore((state) => state.gameMode);

export const useMemoryGameIsPeeking = () =>
  useMemoryGameStore((state) => state.isPeeking);

export const useMemoryGameCombo = () =>
  useMemoryGameStore((state) => state.currentCombo);

export const useMemoryGameTimeLimit = () =>
  useMemoryGameStore((state) => state.timeLimit);

export const useMemoryGameTimeRemaining = () =>
  useMemoryGameStore((state) => state.timeRemaining);

export const useMemoryGameScoreEvents = () =>
  useMemoryGameStore((state) => state.scoreEvents);
