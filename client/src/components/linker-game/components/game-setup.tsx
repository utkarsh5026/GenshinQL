import { Check } from 'lucide-react';
import { memo, useCallback, useMemo, useState } from 'react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

import { DIFFICULTY_CONFIG } from '../store/useLinkerGameStore';
import type { LinkerDifficulty, SelectionMode } from '../types';
import styles from './LinkerGame.module.css';

interface GameSetupProps {
  difficulty: LinkerDifficulty;
  onDifficultyChange: (difficulty: LinkerDifficulty) => void;
  selectionMode: SelectionMode;
  onSelectionModeChange: (mode: SelectionMode) => void;
  onStart: () => void;
  isLoading: boolean;
  gridSize?: number;
  onGridSizeChange?: (gridSize: number) => void;
}

interface DifficultyConfig {
  value: LinkerDifficulty;
  label: string;
  description: string;
  emoji: string;
  activeClasses: string;
  hoverClasses: string;
}

const DIFFICULTY_OPTIONS: DifficultyConfig[] = [
  {
    value: 'easy',
    label: 'Easy',
    description: '15 seconds per turn',
    emoji: '🌱',
    activeClasses:
      'border-success-500 text-success-400 shadow-[0_0_12px_rgba(34,197,94,0.3)]',
    hoverClasses: 'hover:border-success-500/50 hover:text-success-400',
  },
  {
    value: 'medium',
    label: 'Medium',
    description: '10 seconds per turn',
    emoji: '⚡',
    activeClasses:
      'border-warning-500 text-warning-400 shadow-[0_0_12px_rgba(234,179,8,0.3)]',
    hoverClasses: 'hover:border-warning-500/50 hover:text-warning-400',
  },
  {
    value: 'hard',
    label: 'Hard',
    description: '5 seconds per turn',
    emoji: '🔥',
    activeClasses:
      'border-error-500 text-error-400 shadow-[0_0_12px_rgba(239,68,68,0.3)]',
    hoverClasses: 'hover:border-error-500/50 hover:text-error-400',
  },
];

interface GridSizeOption {
  value: number;
  label: string;
  description: string;
  emoji: string;
}

const GRID_SIZE_OPTIONS: GridSizeOption[] = [
  { value: 6, label: '2×3', description: '6 tiles', emoji: '🔲' },
  { value: 9, label: '3×3', description: '9 tiles', emoji: '🔳' },
  { value: 12, label: '3×4', description: '12 tiles', emoji: '⬛' },
  { value: 16, label: '4×4', description: '16 tiles', emoji: '◼' },
  { value: 20, label: '4×5', description: '20 tiles', emoji: '◾' },
  { value: 24, label: '4×6', description: '24 tiles', emoji: '🟦' },
];

interface SelectionModeOption {
  value: SelectionMode;
  label: string;
  description: string;
  emoji: string;
  activeClasses: string;
  hoverClasses: string;
}

const SELECTION_MODE_OPTIONS: SelectionModeOption[] = [
  {
    value: 'single',
    label: 'Select One',
    description: 'Find 1 correct match',
    emoji: '👆',
    activeClasses:
      'border-electro-500 text-electro-400 shadow-[0_0_12px_rgba(168,85,247,0.3)]',
    hoverClasses: 'hover:border-electro-500/50 hover:text-electro-400',
  },
  {
    value: 'multi',
    label: 'Select Many',
    description: 'Combo for bonus!',
    emoji: '🎯',
    activeClasses:
      'border-hydro-500 text-hydro-400 shadow-[0_0_12px_rgba(59,130,246,0.3)]',
    hoverClasses: 'hover:border-hydro-500/50 hover:text-hydro-400',
  },
];

export const GameSetup = memo(function GameSetup({
  difficulty,
  onDifficultyChange,
  selectionMode,
  onSelectionModeChange,
  onStart,
  isLoading,
  gridSize: externalGridSize,
  onGridSizeChange,
}: GameSetupProps) {
  const [internalGridSize, setInternalGridSize] = useState(6);
  const gridSize = externalGridSize ?? internalGridSize;

  const handleDifficultyClick = useCallback(
    (value: LinkerDifficulty) => {
      onDifficultyChange(value);
    },
    [onDifficultyChange]
  );

  const handleGridSizeClick = useCallback(
    (value: number) => {
      if (onGridSizeChange) {
        onGridSizeChange(value);
      } else {
        setInternalGridSize(value);
      }
    },
    [onGridSizeChange]
  );

  const handleSelectionModeClick = useCallback(
    (value: SelectionMode) => {
      onSelectionModeChange(value);
    },
    [onSelectionModeChange]
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
          {DIFFICULTY_OPTIONS.map((option) => {
            const isActive = difficulty === option.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => handleDifficultyClick(option.value)}
                className={cn(
                  'relative flex-1 flex flex-col items-center gap-1 px-3 py-3',
                  'rounded-xl font-semibold transition-all duration-300',
                  'border-2 text-sm backdrop-blur-sm',
                  'transform hover:scale-105 active:scale-95',
                  isActive
                    ? option.activeClasses
                    : cn(
                        'bg-midnight-800/60 border-midnight-600 text-starlight-400',
                        option.hoverClasses,
                        'hover:bg-midnight-700/70'
                      )
                )}
              >
                <span className="flex items-center gap-2">
                  <span
                    className={cn(
                      'text-lg transition-transform duration-300',
                      isActive && 'animate-bounce'
                    )}
                    style={{ animationDuration: '1s' }}
                  >
                    {option.emoji}
                  </span>
                  <span>{option.label}</span>
                  {isActive && <Check className="w-4 h-4" />}
                </span>
                <span className="text-xs opacity-70">{option.description}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className={styles.difficultySection}>
        <h3 className={styles.sectionTitle}>Select Grid Size</h3>
        <div className="grid grid-cols-3 gap-2">
          {GRID_SIZE_OPTIONS.map((option) => {
            const isActive = gridSize === option.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => handleGridSizeClick(option.value)}
                className={cn(
                  'relative flex flex-col items-center gap-1 px-3 py-2',
                  'rounded-xl font-semibold transition-all duration-300',
                  'border-2 text-sm backdrop-blur-sm',
                  'transform hover:scale-105 active:scale-95',
                  isActive
                    ? 'border-epic-500 text-epic-400 shadow-[0_0_12px_rgba(168,85,247,0.3)]'
                    : cn(
                        'bg-midnight-800/60 border-midnight-600 text-starlight-400',
                        'hover:border-epic-500/50 hover:text-epic-400',
                        'hover:bg-midnight-700/70'
                      )
                )}
              >
                <span className="flex items-center gap-1.5">
                  <span
                    className={cn(
                      'text-base transition-transform duration-300',
                      isActive && 'animate-bounce'
                    )}
                    style={{ animationDuration: '1s' }}
                  >
                    {option.emoji}
                  </span>
                  <span>{option.label}</span>
                  {isActive && <Check className="w-3.5 h-3.5" />}
                </span>
                <span className="text-xs opacity-70">{option.description}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className={styles.difficultySection}>
        <h3 className={styles.sectionTitle}>Game Mode</h3>
        <div className="grid grid-cols-2 gap-2">
          {SELECTION_MODE_OPTIONS.map((option) => {
            const isActive = selectionMode === option.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => handleSelectionModeClick(option.value)}
                className={cn(
                  'relative flex flex-col items-center gap-1 px-3 py-3',
                  'rounded-xl font-semibold transition-all duration-300',
                  'border-2 text-sm backdrop-blur-sm',
                  'transform hover:scale-105 active:scale-95',
                  isActive
                    ? option.activeClasses
                    : cn(
                        'bg-midnight-800/60 border-midnight-600 text-starlight-400',
                        option.hoverClasses,
                        'hover:bg-midnight-700/70'
                      )
                )}
              >
                <span className="flex items-center gap-2">
                  <span
                    className={cn(
                      'text-lg transition-transform duration-300',
                      isActive && 'animate-bounce'
                    )}
                    style={{ animationDuration: '1s' }}
                  >
                    {option.emoji}
                  </span>
                  <span>{option.label}</span>
                  {isActive && <Check className="w-4 h-4" />}
                </span>
                <span className="text-xs opacity-70">{option.description}</span>
                {option.value === 'multi' && (
                  <span className="text-[10px] opacity-50 mt-1">
                    ⚠️ Wrong = -1 life
                  </span>
                )}
              </button>
            );
          })}
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
