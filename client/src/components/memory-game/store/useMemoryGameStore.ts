import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

import type {
  GameDifficulty,
  GameStatus,
  GameSticker,
  MemoryGameStats,
  MemoryTile,
} from '@/types';

import {
  getDifficultyConfig,
  getRandomStickersForGame,
} from '../services/stickerService';

interface MemoryGameState {
  tiles: MemoryTile[];
  selectedTiles: number[];
  stats: MemoryGameStats;
  gameStatus: GameStatus;
  difficulty: GameDifficulty;
  isProcessing: boolean;

  initializeGame: (stickers: GameSticker[], difficulty: GameDifficulty) => void;
  flipTile: (tileIndex: number) => void;
  resetGame: () => void;
  setDifficulty: (difficulty: GameDifficulty) => void;
}

const initialStats: MemoryGameStats = {
  score: 0,
  moves: 0,
  matchesFound: 0,
  exactMatches: 0,
  characterMatches: 0,
  startTime: null,
  endTime: null,
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

      initializeGame: (stickers, difficulty) => {
        const config = getDifficultyConfig(difficulty);
        const gameStickers = getRandomStickersForGame(stickers, config.pairs);

        const tiles: MemoryTile[] = gameStickers.map((sticker, index) => ({
          id: index,
          sticker,
          isFlipped: false,
          isMatched: false,
        }));

        set({
          tiles,
          selectedTiles: [],
          stats: { ...initialStats, startTime: Date.now() },
          gameStatus: 'playing',
          difficulty,
          isProcessing: false,
        });
      },

      flipTile: (tileIndex) => {
        const { tiles, selectedTiles, isProcessing, gameStatus } = get();

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
            const { tiles: currentTiles, stats: currentStats } = get();

            if (isExactMatch || isCharacterMatch) {
              const updatedTiles = currentTiles.map((t, i) =>
                i === firstIdx || i === secondIdx
                  ? { ...t, isMatched: true }
                  : t
              );

              const points = isExactMatch ? 5 : 3;
              const newStats: MemoryGameStats = {
                ...currentStats,
                score: currentStats.score + points,
                moves: currentStats.moves + 1,
                matchesFound: currentStats.matchesFound + 1,
                exactMatches:
                  currentStats.exactMatches + (isExactMatch ? 1 : 0),
                characterMatches:
                  currentStats.characterMatches + (isCharacterMatch ? 1 : 0),
              };

              const allMatched = updatedTiles.every((t) => t.isMatched);
              const newStatus: GameStatus = allMatched ? 'won' : 'playing';

              set({
                tiles: updatedTiles,
                selectedTiles: [],
                stats: allMatched
                  ? { ...newStats, endTime: Date.now() }
                  : newStats,
                gameStatus: newStatus,
                isProcessing: false,
              });
            } else {
              const updatedTiles = currentTiles.map((t, i) =>
                i === firstIdx || i === secondIdx
                  ? { ...t, isFlipped: false }
                  : t
              );

              set({
                tiles: updatedTiles,
                selectedTiles: [],
                stats: { ...currentStats, moves: currentStats.moves + 1 },
                isProcessing: false,
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
        });
      },

      setDifficulty: (difficulty) => {
        set({ difficulty });
      },
    }),
    { name: 'MemoryGameStore' }
  )
);

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
