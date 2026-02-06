import { Trophy, X } from 'lucide-react';
import { memo, useCallback, useMemo } from 'react';

import { Button } from '@/components/ui/button';

import {
  useLinkerGameStats,
  useLinkerGameStore,
} from '../store/useLinkerGameStore';
import styles from './LinkerGame.module.css';

interface GameOverModalProps {
  onPlayAgain: () => void;
}

export const GameOverModal = memo(function GameOverModal({
  onPlayAgain,
}: GameOverModalProps) {
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

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <button
          type="button"
          className={styles.modalClose}
          onClick={handleClose}
        >
          <X className="w-5 h-5" />
        </button>

        <div className={styles.modalHeader}>
          <Trophy className={styles.trophyIcon} />
          <h2 className={styles.modalTitle}>Game Over!</h2>
        </div>

        <div className={styles.finalScore}>
          <span className={styles.finalScoreLabel}>Final Score</span>
          <span className={styles.finalScoreValue}>{stats.score}</span>
        </div>

        <div className={styles.statsGrid}>
          <div className={styles.statItem}>
            <span className={styles.statItemLabel}>Correct</span>
            <span className={styles.statItemValue}>{stats.correctAnswers}</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statItemLabel}>Wrong</span>
            <span className={styles.statItemValue}>{stats.wrongAnswers}</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statItemLabel}>Accuracy</span>
            <span className={styles.statItemValue}>{accuracy}%</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statItemLabel}>Best Streak</span>
            <span className={styles.statItemValue}>{stats.longestStreak}</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statItemLabel}>Rounds</span>
            <span className={styles.statItemValue}>{stats.totalRounds}</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statItemLabel}>Time</span>
            <span className={styles.statItemValue}>{timePlayed}</span>
          </div>
        </div>

        <div className={styles.modalActions}>
          <Button className={styles.playAgainButton} onClick={onPlayAgain}>
            Play Again
          </Button>
          <Button
            variant="ghost"
            className={styles.quitButton}
            onClick={handleClose}
          >
            Back to Menu
          </Button>
        </div>
      </div>
    </div>
  );
});
