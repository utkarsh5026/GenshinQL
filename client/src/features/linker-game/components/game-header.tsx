import { RotateCcw, X, Zap } from 'lucide-react';
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { Button } from '@/components/ui/button';

import { DIFFICULTY_CONFIG } from '../constants';
import { useTurnTimer } from '../hooks/useTurnTimer';
import {
  useLinkerGameCurrentTurn,
  useLinkerGameIsProcessing,
  useLinkerGameLives,
  useLinkerGameMaxLives,
  useLinkerGameStats,
  useLinkerGameStore,
} from '../stores/useLinkerGameStore';
import type { LinkerDifficulty } from '../types';
import styles from './LinkerGame.module.css';
import { LivesDisplay } from './lives-display';

interface StatBoxProps {
  label: string;
  value: string | number;
  colorClass: string;
}

const StatBox = memo(function StatBox({
  label,
  value,
  colorClass,
}: StatBoxProps) {
  return (
    <div className={styles.statBox}>
      <span className={styles.statLabel}>{label}</span>
      <span className={`${styles.statValue} text-${colorClass}-500`}>
        {value}
      </span>
    </div>
  );
});

interface GameHeaderProps {
  difficulty: LinkerDifficulty;
  onRestart: () => void;
}

export const GameHeader = memo(function GameHeader({
  difficulty,
  onRestart,
}: GameHeaderProps) {
  const stats = useLinkerGameStats();
  const lives = useLinkerGameLives();
  const maxLives = useLinkerGameMaxLives();
  const currentTurn = useLinkerGameCurrentTurn();
  const isProcessing = useLinkerGameIsProcessing();
  const handleTimeout = useLinkerGameStore((state) => state.handleTimeout);
  const resetGame = useLinkerGameStore((state) => state.resetGame);

  const [showQuitConfirm, setShowQuitConfirm] = useState(false);
  const [recentlyLostLife, setRecentlyLostLife] = useState(false);
  const prevLivesRef = useRef(lives);

  // Track when a life is lost
  useEffect(() => {
    if (lives < prevLivesRef.current) {
      // Use setTimeout to avoid synchronous setState in effect
      const showTimer = setTimeout(() => setRecentlyLostLife(true), 0);
      const hideTimer = setTimeout(() => setRecentlyLostLife(false), 500);
      prevLivesRef.current = lives;
      return () => {
        clearTimeout(showTimer);
        clearTimeout(hideTimer);
      };
    }
    prevLivesRef.current = lives;
  }, [lives]);

  const config = DIFFICULTY_CONFIG[difficulty];

  const onExpire = useCallback(() => {
    handleTimeout();
  }, [handleTimeout]);

  const { formattedTime, progress, isUrgent, isCritical } = useTurnTimer(
    currentTurn?.turnStartTime ?? null,
    config.timePerTurn,
    onExpire,
    isProcessing
  );

  const handleQuit = useCallback(() => {
    resetGame();
  }, [resetGame]);

  const timerClass = useMemo(() => {
    const classes = [styles.timerContainer];
    if (isCritical) classes.push(styles.timerCritical);
    else if (isUrgent) classes.push(styles.timerUrgent);
    return classes.join(' ');
  }, [isUrgent, isCritical]);

  // SVG circle properties
  const radius = 26;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progress);

  return (
    <div className={styles.gameHeader}>
      {/* Timer */}
      <div className={timerClass}>
        <svg className={styles.timerRingSvg} width="60" height="60">
          <circle className={styles.timerRingBg} cx="30" cy="30" r={radius} />
          <circle
            className={styles.timerRingProgress}
            cx="30"
            cy="30"
            r={radius}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
          />
        </svg>
        <span className={styles.timerValue}>{formattedTime}</span>
      </div>

      {/* Lives */}
      <div className={styles.livesSection}>
        <span className={styles.livesLabel}>Lives</span>
        <LivesDisplay
          current={lives}
          max={maxLives}
          recentlyLost={recentlyLostLife}
        />
      </div>

      {/* Stats */}
      <div className={styles.statsGrid}>
        <StatBox label="Score" value={stats.score} colorClass="legendary" />
        <StatBox
          label="Correct"
          value={stats.correctAnswers}
          colorClass="success"
        />
      </div>

      {/* Streak */}
      {stats.currentStreak > 1 && (
        <div className={styles.streakBadge}>
          <Zap className="w-4 h-4" />
          <span>{stats.currentStreak}x Streak!</span>
        </div>
      )}

      {/* Actions */}
      <div className={styles.headerActions}>
        <Button
          variant="ghost"
          size="sm"
          onClick={onRestart}
          className="w-full text-warning-500 hover:text-warning-400 hover:bg-warning-500/10"
        >
          <RotateCcw className="w-4 h-4 mr-1" />
          Restart
        </Button>

        {showQuitConfirm ? (
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleQuit}
              className="flex-1 text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              Confirm
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowQuitConfirm(false)}
              className="flex-1 text-muted-foreground"
            >
              Cancel
            </Button>
          </div>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowQuitConfirm(true)}
            className="w-full text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4 mr-1" />
            Quit
          </Button>
        )}
      </div>
    </div>
  );
});
