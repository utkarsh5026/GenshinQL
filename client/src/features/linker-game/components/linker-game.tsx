import { useCallback, useEffect, useMemo, useState } from 'react';

import { useCharactersStore } from '@/stores/useCharactersStore';

import {
  useLinkerGameDifficulty,
  useLinkerGameSelectionMode,
  useLinkerGameStatus,
  useLinkerGameStore,
} from '../stores/useLinkerGameStore';
import type { LinkerDifficulty, SelectionMode } from '../types';
import { GameBoard } from './game-board';
import { GameHeader } from './game-header';
import { GameOverModal } from './game-over-modal';
import { GameSetup } from './game-setup';
import styles from './LinkerGame.module.css';

export const LinkerGame = () => {
  const [isPreloading, setIsPreloading] = useState(false);

  const characters = useCharactersStore((state) => state.characters);
  const loading = useCharactersStore((state) => state.loading);
  const error = useCharactersStore((state) => state.error);
  const fetchCharacters = useCharactersStore((state) => state.fetchCharacters);

  const gameStatus = useLinkerGameStatus();
  const difficulty = useLinkerGameDifficulty();
  const selectionMode = useLinkerGameSelectionMode();
  const gridSize = useLinkerGameStore((state) => state.gridSize);
  const initializeGame = useLinkerGameStore((state) => state.initializeGame);
  const resetGame = useLinkerGameStore((state) => state.resetGame);
  const setDifficulty = useLinkerGameStore((state) => state.setDifficulty);
  const setSelectionMode = useLinkerGameStore(
    (state) => state.setSelectionMode
  );
  const setGridSize = useLinkerGameStore((state) => state.setGridSize);

  // Fetch characters on mount
  useEffect(() => {
    fetchCharacters();
  }, [fetchCharacters]);

  const handleDifficultyChange = useCallback(
    (newDifficulty: LinkerDifficulty) => {
      setDifficulty(newDifficulty);
    },
    [setDifficulty]
  );

  const handleSelectionModeChange = useCallback(
    (newMode: SelectionMode) => {
      setSelectionMode(newMode);
    },
    [setSelectionMode]
  );

  const handleGridSizeChange = useCallback(
    (newGridSize: number) => {
      setGridSize(newGridSize);
    },
    [setGridSize]
  );

  const handleStartGame = useCallback(async () => {
    if (characters.length > 0) {
      setIsPreloading(true);

      // Preload some character icons
      const preloadPromises = characters.slice(0, 20).map(
        (char) =>
          new Promise<void>((resolve) => {
            const img = new Image();
            img.onload = () => resolve();
            img.onerror = () => resolve();
            img.src = char.iconUrl;
          })
      );

      await Promise.all(preloadPromises);
      setIsPreloading(false);
      initializeGame(characters, difficulty, selectionMode, gridSize);
    }
  }, [characters, difficulty, selectionMode, gridSize, initializeGame]);

  const handlePlayAgain = useCallback(async () => {
    resetGame();
    await handleStartGame();
  }, [resetGame, handleStartGame]);

  const isGameOver = useMemo(() => gameStatus === 'game_over', [gameStatus]);

  if (loading) {
    return (
      <div className={styles.container}>
        <h1 className={styles.title}>Linker Game</h1>
        <p className="text-center text-muted-foreground">
          Loading characters...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <h1 className={styles.title}>Linker Game</h1>
        <p className="text-center text-destructive">
          Failed to load characters. Please try again.
        </p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Linker Game</h1>

      <div className={styles.gameLayout}>
        {/* Main game area */}
        <div className={styles.gameMain}>
          {gameStatus === 'idle' ? (
            <GameSetup
              difficulty={difficulty}
              onDifficultyChange={handleDifficultyChange}
              selectionMode={selectionMode}
              onSelectionModeChange={handleSelectionModeChange}
              gridSize={gridSize}
              onGridSizeChange={handleGridSizeChange}
              onStart={handleStartGame}
              isLoading={isPreloading}
            />
          ) : (
            <GameBoard />
          )}
        </div>

        {/* Sidebar */}
        {gameStatus === 'playing' && (
          <div className={styles.gameSidebar}>
            <GameHeader difficulty={difficulty} onRestart={handlePlayAgain} />
          </div>
        )}
      </div>

      {isGameOver && <GameOverModal onPlayAgain={handlePlayAgain} />}
    </div>
  );
};
