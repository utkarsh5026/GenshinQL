import { Bomb, RotateCcw, X, Zap } from 'lucide-react';
import React, { memo, useCallback, useEffect, useMemo, useState } from 'react';

import { Button } from '@/components/ui/button';

import { useGameTimer } from '../hooks/useGameTimer';
import {
  useMemoryGameCombo,
  useMemoryGameMode,
  useMemoryGameStats,
  useMemoryGameStore,
  useMemoryGameTiles,
  useMemoryGameTimeLimit,
} from '../stores';
import styles from './MemoryGame.module.css';

interface StatBoxProps {
  label: string;
  value: string | number;
  colorClass: string;
  pulse?: boolean;
}

const StatBox = memo(function StatBox({
  label,
  value,
  colorClass,
  pulse = false,
}: StatBoxProps) {
  return (
    <div
      className={`flex flex-col items-center p-3 rounded-lg bg-midnight-800/30 border border-${colorClass}-400/30 ${pulse ? 'animate-pulse' : ''}`}
    >
      <span className="text-xs uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      <span className={`text-xl font-bold text-${colorClass}-500`}>
        {value}
      </span>
    </div>
  );
});

interface GameHeaderProps {
  onRestart: () => void;
}

export const GameHeader: React.FC<GameHeaderProps> = ({ onRestart }) => {
  const stats = useMemoryGameStats();
  const gameMode = useMemoryGameMode();
  const timeLimit = useMemoryGameTimeLimit();
  const currentCombo = useMemoryGameCombo();
  const tiles = useMemoryGameTiles();
  const resetGame = useMemoryGameStore((state) => state.resetGame);
  const setGameLost = useMemoryGameStore((state) => state.setGameLost);

  const { formattedTime, formattedTimeRemaining, timeRemaining, isExpired } =
    useGameTimer(stats.startTime, stats.endTime, timeLimit);

  const [showQuitConfirm, setShowQuitConfirm] = useState(false);

  // Handle time expiry
  useEffect(() => {
    if (isExpired && gameMode === 'time_attack' && !stats.endTime) {
      setGameLost();
    }
  }, [isExpired, gameMode, stats.endTime, setGameLost]);

  const handleQuit = useCallback(() => {
    resetGame();
  }, [resetGame]);

  // Calculate bomb info for bomb mode
  const bombInfo = useMemo(() => {
    if (gameMode !== 'bomb_mode') return null;
    const bombTiles = tiles.filter((t) => t.isBomb);
    const matchedBombs = bombTiles.filter((t) => t.isMatched).length / 2;
    const totalBombs = bombTiles.length / 2;
    return { matched: matchedBombs, total: totalBombs };
  }, [gameMode, tiles]);

  // Timer urgency levels
  const timerUrgency = useMemo(() => {
    if (timeRemaining === null) return null;
    if (timeRemaining <= 10000) return 'critical';
    if (timeRemaining <= 30000) return 'urgent';
    return null;
  }, [timeRemaining]);

  const getTimerColorClass = () => {
    if (timerUrgency === 'critical') return 'pyro';
    if (timerUrgency === 'urgent') return 'warning';
    return 'cryo';
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3">
        <StatBox label="Score" value={stats.score} colorClass="legendary" />
        <StatBox label="Moves" value={stats.moves} colorClass="electro" />
        <StatBox
          label="Matches"
          value={stats.matchesFound}
          colorClass="success"
        />

        {/* Time Attack: Show countdown */}
        {gameMode === 'time_attack' && formattedTimeRemaining ? (
          <div
            className={`flex flex-col items-center p-3 rounded-lg bg-midnight-800/30 relative ${
              timerUrgency === 'critical'
                ? styles.timerCritical
                : timerUrgency === 'urgent'
                  ? styles.timerUrgent
                  : ''
            }`}
          >
            <span className="text-xs uppercase tracking-wide text-muted-foreground">
              Time Left
            </span>
            <span
              className={`text-xl font-bold text-${getTimerColorClass()}-500 ${styles.timerValue}`}
            >
              {formattedTimeRemaining}
            </span>
            {timerUrgency === 'critical' && (
              <span className={styles.timerRing} />
            )}
          </div>
        ) : (
          <StatBox label="Time" value={formattedTime} colorClass="cryo" />
        )}
      </div>

      {/* Combo Display */}
      {currentCombo > 1 && (
        <div className="flex items-center justify-center gap-2 p-2 rounded-lg bg-legendary-500/10 border border-legendary-500/30">
          <Zap className="w-5 h-5 text-legendary-500" />
          <span className="text-lg font-bold text-legendary-500">
            {currentCombo}x Combo!
          </span>
        </div>
      )}

      {/* Bomb Mode Info */}
      {bombInfo && (
        <div className="flex items-center justify-center gap-2 p-2 rounded-lg bg-pyro-500/10 border border-pyro-500/30">
          <Bomb className="w-4 h-4 text-pyro-500" />
          <span className="text-sm text-pyro-400">
            Bombs: {bombInfo.matched}/{bombInfo.total}
            {bombInfo.matched < bombInfo.total && (
              <span className="text-muted-foreground ml-1">
                (save for last!)
              </span>
            )}
          </span>
        </div>
      )}

      <div className="flex flex-col gap-2 mt-2">
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
};
