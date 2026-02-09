import { useCallback, useMemo } from 'react';

import { useLinkerGameStats, useLinkerGameStore } from '../stores';

/**
 * Custom hook for managing game over statistics and actions.
 * Computes derived stats like accuracy percentage and formatted play time.
 *
 * Used by the GameOverModal to display final game statistics and provide
 * a reset function to return to the main menu.
 *
 * @returns Game over state and actions
 * @returns resetGame - Function to reset the game and return to menu
 * @returns timePlayed - Formatted time played (MM:SS format)
 * @returns accuracy - Accuracy percentage (0-100)
 * @returns stats - Raw game statistics object
 */
export function useGameOver() {
  const stats = useLinkerGameStats();
  const resetGame = useLinkerGameStore((state) => state.resetGame);

  const handleClose = useCallback(() => {
    resetGame();
  }, [resetGame]);

  const timePlayed = useMemo(() => {
    if (!stats.startTime || !stats.endTime) return '0:00';
    const elapsed = stats.endTime - stats.startTime;
    const minutes = Math.floor(elapsed / 60000);
    const seconds = Math.floor((elapsed % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }, [stats.startTime, stats.endTime]);

  const accuracy = useMemo(() => {
    if (stats.totalRounds === 0) return 0;
    return Math.round((stats.correctAnswers / stats.totalRounds) * 100);
  }, [stats.correctAnswers, stats.totalRounds]);

  return {
    resetGame: handleClose,
    timePlayed,
    accuracy,
    stats,
  };
}
