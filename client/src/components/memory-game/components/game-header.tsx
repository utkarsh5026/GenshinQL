import { RotateCcw, X } from 'lucide-react';
import React, { memo, useCallback, useState } from 'react';

import { Button } from '@/components/ui/button';

import { useGameTimer } from '../hooks/useGameTimer';
import {
  useMemoryGameStats,
  useMemoryGameStore,
} from '../store/useMemoryGameStore';

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
    <div
      className={`flex flex-col items-center p-3 rounded-lg bg-midnight-800/30 border border-${colorClass}-400/30`}
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
  const resetGame = useMemoryGameStore((state) => state.resetGame);
  const { formattedTime } = useGameTimer(stats.startTime, stats.endTime);
  const [showQuitConfirm, setShowQuitConfirm] = useState(false);

  const handleQuit = useCallback(() => {
    resetGame();
  }, [resetGame]);

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
        <StatBox label="Time" value={formattedTime} colorClass="cryo" />
      </div>

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
