import { memo, useCallback, useMemo } from 'react';

import { Button } from '@/components/ui/button';

import { DIFFICULTY_CONFIG } from '../store/useLinkerGameStore';
import type { LinkerDifficulty } from '../types';
import styles from './LinkerGame.module.css';

interface GameSetupProps {
  difficulty: LinkerDifficulty;
  onDifficultyChange: (difficulty: LinkerDifficulty) => void;
  onStart: () => void;
  isLoading: boolean;
}

const DIFFICULTY_OPTIONS: {
  value: LinkerDifficulty;
  label: string;
  description: string;
}[] = [
  { value: 'easy', label: 'Easy', description: '15 seconds per turn' },
  { value: 'medium', label: 'Medium', description: '10 seconds per turn' },
  { value: 'hard', label: 'Hard', description: '5 seconds per turn' },
];

export const GameSetup = memo(function GameSetup({
  difficulty,
  onDifficultyChange,
  onStart,
  isLoading,
}: GameSetupProps) {
  const handleDifficultyClick = useCallback(
    (value: LinkerDifficulty) => {
      onDifficultyChange(value);
    },
    [onDifficultyChange]
  );

  const config = useMemo(() => DIFFICULTY_CONFIG[difficulty], [difficulty]);

  return (
    <div className={styles.gameSetup}>
      <div className={styles.setupHeader}>
        <h2 className={styles.setupTitle}>How to Play</h2>
        <p className={styles.setupDescription}>
          Find a character that shares the same attribute (Element, Weapon, or
          Region) with the target character before time runs out!
        </p>
      </div>

      <div className={styles.rulesSection}>
        <div className={styles.ruleItem}>
          <span className={styles.ruleIcon}>❤️</span>
          <span>You have 3 lives</span>
        </div>
        <div className={styles.ruleItem}>
          <span className={styles.ruleIcon}>⭐</span>
          <span>+{config.basePoints} points per correct answer</span>
        </div>
        <div className={styles.ruleItem}>
          <span className={styles.ruleIcon}>⚡</span>
          <span>Time bonus: {config.timeMultiplier} pts/sec remaining</span>
        </div>
      </div>

      <div className={styles.difficultySection}>
        <h3 className={styles.sectionTitle}>Select Difficulty</h3>
        <div className={styles.difficultyButtons}>
          {DIFFICULTY_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => handleDifficultyClick(option.value)}
              className={`${styles.difficultyButton} ${
                difficulty === option.value ? styles.difficultyButtonActive : ''
              }`}
            >
              <span className={styles.difficultyLabel}>{option.label}</span>
              <span className={styles.difficultyDesc}>
                {option.description}
              </span>
            </button>
          ))}
        </div>
      </div>

      <Button
        className={styles.startButton}
        onClick={onStart}
        disabled={isLoading}
      >
        {isLoading ? (
          <span className="flex items-center gap-2">
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Loading...
          </span>
        ) : (
          'Start Game'
        )}
      </Button>
    </div>
  );
});
