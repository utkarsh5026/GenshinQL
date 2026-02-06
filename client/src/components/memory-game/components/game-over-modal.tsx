import { memo } from 'react';
import Confetti from 'react-confetti';
import useWindowSize from 'react-use/lib/useWindowSize';

import { Button } from '@/components/ui/button';

import { useGameTimer } from '../hooks/useGameTimer';
import { useMemoryGameStats } from '../store/useMemoryGameStore';
import styles from './MemoryGame.module.css';

interface GameOverModalProps {
  onPlayAgain: () => void;
}

export const GameOverModal = memo(function GameOverModal({
  onPlayAgain,
}: GameOverModalProps) {
  const stats = useMemoryGameStats();
  const { formattedTime } = useGameTimer(stats.startTime, stats.endTime);
  const { width, height } = useWindowSize();

  return (
    <div className={styles.gameOverOverlay}>
      <Confetti
        width={width}
        height={height}
        recycle={false}
        numberOfPieces={200}
        gravity={0.3}
      />

      <div className={styles.gameOverModal}>
        <h2 className="text-3xl font-bold mb-6 text-legendary-400">Victory!</h2>

        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="p-4 rounded-lg bg-midnight-800/50 border border-legendary-400/30">
            <div className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
              Final Score
            </div>
            <div className="text-2xl font-bold text-legendary-500">
              {stats.score}
            </div>
          </div>

          <div className="p-4 rounded-lg bg-midnight-800/50 border border-cryo-400/30">
            <div className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
              Time
            </div>
            <div className="text-2xl font-bold text-cryo-500">
              {formattedTime}
            </div>
          </div>

          <div className="p-4 rounded-lg bg-midnight-800/50 border border-electro-400/30">
            <div className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
              Total Moves
            </div>
            <div className="text-2xl font-bold text-electro-500">
              {stats.moves}
            </div>
          </div>

          <div className="p-4 rounded-lg bg-midnight-800/50 border border-success-400/30">
            <div className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
              Matches Found
            </div>
            <div className="text-2xl font-bold text-success-500">
              {stats.matchesFound}
            </div>
          </div>

          <div className="p-4 rounded-lg bg-midnight-800/50 border border-dendro-400/30">
            <div className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
              Exact Matches
            </div>
            <div className="text-lg font-bold text-dendro-500">
              {stats.exactMatches}{' '}
              <span className="text-sm text-muted-foreground">
                (+{stats.exactMatches * 5} pts)
              </span>
            </div>
          </div>

          <div className="p-4 rounded-lg bg-midnight-800/50 border border-hydro-400/30">
            <div className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
              Character Matches
            </div>
            <div className="text-lg font-bold text-hydro-500">
              {stats.characterMatches}{' '}
              <span className="text-sm text-muted-foreground">
                (+{stats.characterMatches * 3} pts)
              </span>
            </div>
          </div>
        </div>

        <Button
          size="lg"
          onClick={onPlayAgain}
          className="w-full py-6 text-lg font-semibold rounded-full bg-linear-to-r from-legendary-400 to-legendary-600 text-white shadow-lg shadow-legendary-500/30 hover:shadow-xl hover:shadow-legendary-500/40 hover:scale-105 transition-all duration-200"
        >
          Play Again
        </Button>
      </div>
    </div>
  );
});
