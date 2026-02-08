import { memo, type ReactNode } from 'react';
import Confetti from 'react-confetti';
import useWindowSize from 'react-use/lib/useWindowSize';

import { Button } from '@/components/ui/button';

import { useGameTimer } from '../hooks/useGameTimer';
import {
  useMemoryGameMode,
  useMemoryGameStats,
  useMemoryGameStatus,
} from '../store/useMemoryGameStore';
import styles from './MemoryGame.module.css';

type ColorScheme =
  | 'legendary'
  | 'cryo'
  | 'electro'
  | 'success'
  | 'dendro'
  | 'hydro'
  | 'celestial'
  | 'pyro';

const colorClasses: Record<ColorScheme, { border: string; text: string }> = {
  legendary: { border: 'border-legendary-400/30', text: 'text-legendary-500' },
  cryo: { border: 'border-cryo-400/30', text: 'text-cryo-500' },
  electro: { border: 'border-electro-400/30', text: 'text-electro-500' },
  success: { border: 'border-success-400/30', text: 'text-success-500' },
  dendro: { border: 'border-dendro-400/30', text: 'text-dendro-500' },
  hydro: { border: 'border-hydro-400/30', text: 'text-hydro-500' },
  celestial: { border: 'border-celestial-400/30', text: 'text-celestial-500' },
  pyro: { border: 'border-pyro-400/30', text: 'text-pyro-500' },
};

interface StatBoxProps {
  label: string;
  value: ReactNode;
  color: ColorScheme;
  large?: boolean;
  suffix?: ReactNode;
}

const StatBox: React.FC<StatBoxProps> = ({
  label,
  value,
  color,
  large = false,
  suffix,
}) => {
  const { border, text } = colorClasses[color];
  return (
    <div className={`p-4 rounded-lg bg-midnight-800/50 border ${border}`}>
      <div className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
        {label}
      </div>
      <div className={`${large ? 'text-2xl' : 'text-lg'} font-bold ${text}`}>
        {value}
        {suffix && (
          <span className="text-sm text-muted-foreground"> {suffix}</span>
        )}
      </div>
    </div>
  );
};

interface GameOverModalProps {
  onPlayAgain: () => void;
  onBackToMenu: () => void;
}

export const GameOverModal = memo(function GameOverModal({
  onPlayAgain,
  onBackToMenu,
}: GameOverModalProps) {
  const stats = useMemoryGameStats();
  const gameStatus = useMemoryGameStatus();
  const gameMode = useMemoryGameMode();
  const { formattedTime } = useGameTimer(stats.startTime, stats.endTime);
  const { width, height } = useWindowSize();

  const isWin = gameStatus === 'won';
  const isLoss = gameStatus === 'lost';

  const hasComboBonus = stats.comboBonus > 0;
  const hasTimeBonus = stats.timeBonus > 0;
  const hasBombPenalty = stats.bombPenalty > 0;
  const hasMaxCombo = stats.maxCombo > 1;

  return (
    <div className={styles.gameOverOverlay}>
      {isWin && (
        <Confetti
          width={width}
          height={height}
          recycle={false}
          numberOfPieces={200}
          gravity={0.3}
        />
      )}

      {isLoss && (
        <Confetti
          width={width}
          height={height}
          recycle={false}
          numberOfPieces={100}
          gravity={0.4}
          colors={['#444', '#555', '#666', '#777', '#888']}
        />
      )}

      <div className={styles.gameOverModal}>
        <h2
          className={`text-3xl font-bold mb-6 ${
            isWin ? 'text-legendary-400' : styles.gameOverTitleLost
          }`}
        >
          {isWin ? 'Victory!' : "Time's Up!"}
        </h2>

        <div className="grid grid-cols-2 gap-3 mb-6">
          <StatBox
            label="Final Score"
            value={stats.score}
            color="legendary"
            large
          />
          <StatBox label="Time" value={formattedTime} color="cryo" large />
          <StatBox
            label="Total Moves"
            value={stats.moves}
            color="electro"
            large
          />
          <StatBox
            label="Matches Found"
            value={stats.matchesFound}
            color="success"
            large
          />
          <StatBox
            label="Exact Matches"
            value={stats.exactMatches}
            color="dendro"
            suffix={`(+${stats.exactMatches * 5} pts)`}
          />
          <StatBox
            label="Character Matches"
            value={stats.characterMatches}
            color="hydro"
            suffix={`(+${stats.characterMatches * 3} pts)`}
          />
          {hasMaxCombo && (
            <StatBox
              label="Best Combo"
              value={`${stats.maxCombo}x`}
              color="legendary"
            />
          )}
          {hasComboBonus && (
            <StatBox
              label="Combo Bonus"
              value={`+${stats.comboBonus} pts`}
              color="celestial"
            />
          )}
          {gameMode === 'time_attack' && hasTimeBonus && isWin && (
            <StatBox
              label="Time Bonus"
              value={`+${stats.timeBonus} pts`}
              color="cryo"
            />
          )}
          {hasBombPenalty && (
            <StatBox
              label="Bomb Penalty"
              value={`-${stats.bombPenalty} pts`}
              color="pyro"
            />
          )}
        </div>

        <div className={styles.gameOverButtons}>
          <Button
            size="lg"
            onClick={onPlayAgain}
            className={`w-full py-6 text-lg font-semibold rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 ${
              isWin
                ? 'bg-linear-to-r from-legendary-400 to-legendary-600 text-white shadow-legendary-500/30 hover:shadow-legendary-500/40'
                : 'bg-linear-to-r from-pyro-400 to-pyro-600 text-white shadow-pyro-500/30 hover:shadow-pyro-500/40'
            }`}
          >
            {isWin ? 'Play Again' : 'Try Again'}
          </Button>
          <button onClick={onBackToMenu} className={styles.backToMenuButton}>
            Back to Menu
          </button>
        </div>
      </div>
    </div>
  );
});
