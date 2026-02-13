import { useCallback, useEffect, useState } from 'react';

import type { GameSticker } from '@/types';

import {
  fetchStickers,
  flattenStickers,
  getDifficultyConfig,
  getRandomStickersForGame,
  preloadStickers,
} from '../services';
import {
  useMemoryGameDifficulty,
  useMemoryGameStatus,
  useMemoryGameStore,
} from '../stores';
import { GameBoard } from './game-board';
import { GameHeader } from './game-header';
import { GameOverModal } from './game-over-modal';
import { GameSetup } from './game-setup';
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
  const initializeGame = useMemoryGameStore((state) => state.initializeGame);
  const resetGame = useMemoryGameStore((state) => state.resetGame);

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

  const handleBackToMenu = useCallback(() => {
    resetGame();
  }, [resetGame]);

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

      {gameStatus === 'idle' ? (
        /* Setup Phase - Centered wizard */
        <GameSetup
          onStart={handleStartGame}
          isLoading={isPreloading}
          loadingProgress={isPreloading ? preloadProgress : undefined}
        />
      ) : (
        /* Playing Phase - Board + Sidebar layout */
        <div className={styles.gameLayout}>
          <GameBoard />
          <div className={styles.gameSidebar}>
            <GameHeader onRestart={handlePlayAgain} />
          </div>
        </div>
      )}

      {isGameOver && (
        <GameOverModal
          onPlayAgain={handlePlayAgain}
          onBackToMenu={handleBackToMenu}
        />
      )}
    </div>
  );
};
