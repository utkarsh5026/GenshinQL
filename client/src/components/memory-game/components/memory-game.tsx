import { useCallback, useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import type { GameSticker } from '@/types';

import {
  fetchStickers,
  flattenStickers,
  getDifficultyConfig,
  getRandomStickersForGame,
  preloadStickers,
} from '../services/stickerService';
import {
  useMemoryGameDifficulty,
  useMemoryGameMode,
  useMemoryGameStatus,
  useMemoryGameStore,
} from '../store/useMemoryGameStore';
import { DifficultySelector } from './difficulty-selector';
import { GameBoard } from './game-board';
import { GameBoardPreview } from './game-board-preview';
import { GameHeader } from './game-header';
import { GameModeSelector } from './game-mode-selector';
import { GameOverModal } from './game-over-modal';
import styles from './MemoryGame.module.css';

export const MemoryGame = () => {
  const [stickers, setStickers] = useState<GameSticker[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPreloading, setIsPreloading] = useState(false);
  const [preloadProgress, setPreloadProgress] = useState({
    loaded: 0,
    total: 0,
  });

  const gameStatus = useMemoryGameStatus();
  const difficulty = useMemoryGameDifficulty();
  const gameMode = useMemoryGameMode();
  const initializeGame = useMemoryGameStore((state) => state.initializeGame);
  const resetGame = useMemoryGameStore((state) => state.resetGame);
  const setGameMode = useMemoryGameStore((state) => state.setGameMode);

  useEffect(() => {
    fetchStickers()
      .then((data) => {
        const flattened = flattenStickers(data);
        setStickers(flattened);
        setLoading(false);
      })
      .catch((err) => {
        setError('Failed to load stickers');
        setLoading(false);
        console.error(err);
      });
  }, []);

  const handleStartGame = useCallback(async () => {
    if (stickers.length > 0) {
      const config = getDifficultyConfig(difficulty);
      const gameStickers = getRandomStickersForGame(stickers, config.pairs);

      setIsPreloading(true);
      setPreloadProgress({ loaded: 0, total: gameStickers.length });

      await preloadStickers(gameStickers, (loaded, total) => {
        setPreloadProgress({ loaded, total });
      });

      setIsPreloading(false);
      initializeGame(stickers, difficulty);
    }
  }, [stickers, difficulty, initializeGame]);

  const handlePlayAgain = useCallback(async () => {
    resetGame();
    if (stickers.length > 0) {
      const config = getDifficultyConfig(difficulty);
      const gameStickers = getRandomStickersForGame(stickers, config.pairs);

      setIsPreloading(true);
      setPreloadProgress({ loaded: 0, total: gameStickers.length });

      await preloadStickers(gameStickers, (loaded, total) => {
        setPreloadProgress({ loaded, total });
      });

      setIsPreloading(false);
      initializeGame(stickers, difficulty);
    }
  }, [stickers, difficulty, initializeGame, resetGame]);

  if (loading) {
    return (
      <div className={styles.container}>
        <h1 className={styles.title}>Sticker Memory Game</h1>
        <p className="text-center text-muted-foreground">Loading stickers...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <h1 className={styles.title}>Sticker Memory Game</h1>
        <p className="text-center text-destructive">{error}</p>
      </div>
    );
  }

  const isGameOver = gameStatus === 'won' || gameStatus === 'lost';

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Sticker Memory Game</h1>

      <div className={styles.gameLayout}>
        {/* Left side: Game board or preview */}
        {gameStatus === 'idle' ? (
          <GameBoardPreview
            isLoading={isPreloading}
            loadingProgress={isPreloading ? preloadProgress : undefined}
          />
        ) : (
          <GameBoard />
        )}

        {/* Right side: Sidebar with controls */}
        <div className={styles.gameSidebar}>
          {gameStatus === 'idle' ? (
            <div className="flex flex-col gap-6">
              <div className="text-center">
                <p className="text-muted-foreground text-sm mb-3">
                  Match character stickers to score points!
                </p>
                <div className="flex flex-col gap-1 text-sm">
                  <span>
                    Exact match:{' '}
                    <strong className="text-success-500">5 points</strong>
                  </span>
                  <span>
                    Same character:{' '}
                    <strong className="text-hydro-500">3 points</strong>
                  </span>
                </div>
              </div>

              {/* Game Mode Selector */}
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2 text-center">
                  Game Mode
                </h3>
                <GameModeSelector mode={gameMode} onModeChange={setGameMode} />
              </div>

              {/* Mode-specific tips */}
              {gameMode === 'time_attack' && (
                <div className="text-xs text-center text-cryo-400 bg-cryo-500/10 rounded-lg p-2">
                  Beat the clock! Faster = more points.
                </div>
              )}
              {gameMode === 'bomb_mode' && (
                <div className="text-xs text-center text-pyro-400 bg-pyro-500/10 rounded-lg p-2">
                  Save bomb tiles for last or lose 10 points!
                </div>
              )}

              <DifficultySelector variant="vertical" />

              <Button
                className="w-full py-4 text-base font-semibold rounded-xl bg-linear-to-r from-legendary-400 to-legendary-600 text-white shadow-lg shadow-legendary-500/30 hover:shadow-xl hover:shadow-legendary-500/40 hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleStartGame}
                disabled={isPreloading}
              >
                {isPreloading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Loading...
                  </span>
                ) : (
                  'Start Game'
                )}
              </Button>
            </div>
          ) : (
            <GameHeader onRestart={handlePlayAgain} />
          )}
        </div>
      </div>

      {isGameOver && <GameOverModal onPlayAgain={handlePlayAgain} />}
    </div>
  );
};
