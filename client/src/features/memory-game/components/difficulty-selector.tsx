import { Check } from 'lucide-react';
import { memo } from 'react';

import { cn } from '@/lib/utils';
import type { GameDifficulty } from '@/types';

import { useMemoryGameDifficulty, useMemoryGameStore } from '../stores';

interface DifficultyConfig {
  value: GameDifficulty;
  label: string;
  shortLabel: string;
  emoji: string;
  activeClasses: string;
  hoverClasses: string;
}

const difficulties: DifficultyConfig[] = [
  {
    value: 'easy',
    label: 'Easy (3×4)',
    shortLabel: 'Easy',
    emoji: '🌱',
    activeClasses:
      'border-success-500 text-success-400 shadow-[0_0_12px_rgba(34,197,94,0.3)]',
    hoverClasses: 'hover:border-success-500/50 hover:text-success-400',
  },
  {
    value: 'medium',
    label: 'Medium (4×4)',
    shortLabel: 'Medium',
    emoji: '⚡',
    activeClasses:
      'border-warning-500 text-warning-400 shadow-[0_0_12px_rgba(234,179,8,0.3)]',
    hoverClasses: 'hover:border-warning-500/50 hover:text-warning-400',
  },
  {
    value: 'hard',
    label: 'Hard (6×4)',
    shortLabel: 'Hard',
    emoji: '🔥',
    activeClasses:
      'border-error-500 text-error-400 shadow-[0_0_12px_rgba(239,68,68,0.3)]',
    hoverClasses: 'hover:border-error-500/50 hover:text-error-400',
  },
  {
    value: 'expert_wide',
    label: 'Expert (8×4)',
    shortLabel: 'Expert',
    emoji: '💎',
    activeClasses:
      'border-epic-500 text-epic-400 shadow-[0_0_12px_rgba(168,85,247,0.3)]',
    hoverClasses: 'hover:border-epic-500/50 hover:text-epic-400',
  },
  {
    value: 'expert_square',
    label: 'Master (6×6)',
    shortLabel: 'Master',
    emoji: '👑',
    activeClasses:
      'border-legendary-500 text-legendary-400 shadow-[0_0_12px_rgba(234,179,8,0.4)]',
    hoverClasses: 'hover:border-legendary-500/50 hover:text-legendary-400',
  },
];

interface DifficultySelectorProps {
  variant?: 'horizontal' | 'vertical';
}

export const DifficultySelector = memo(function DifficultySelector({
  variant = 'horizontal',
}: DifficultySelectorProps) {
  const currentDifficulty = useMemoryGameDifficulty();
  const setDifficulty = useMemoryGameStore((state) => state.setDifficulty);

  const isVertical = variant === 'vertical';

  return (
    <div
      className={cn(
        'flex gap-3',
        isVertical ? 'flex-col' : 'justify-center mb-6'
      )}
    >
      {difficulties.map(
        ({ value, label, shortLabel, emoji, activeClasses, hoverClasses }) => {
          const isActive = currentDifficulty === value;
          return (
            <button
              key={value}
              className={cn(
                'relative px-5 py-2.5 rounded-xl font-semibold transition-all duration-300',
                'border-2 text-sm backdrop-blur-sm',
                'transform hover:scale-105 active:scale-95',
                isVertical && 'w-full',
                isActive
                  ? activeClasses
                  : cn(
                      'bg-midnight-800/60 border-midnight-600 text-starlight-400',
                      hoverClasses,
                      'hover:bg-midnight-700/70'
                    )
              )}
              onClick={() => setDifficulty(value)}
            >
              <span className="flex items-center justify-center gap-2">
                <span
                  className={cn(
                    'text-lg transition-transform duration-300',
                    isActive && 'animate-bounce'
                  )}
                  style={{ animationDuration: '1s' }}
                >
                  {emoji}
                </span>
                <span>{isVertical ? label : shortLabel}</span>
                {isActive && <Check className="w-4 h-4" />}
              </span>
            </button>
          );
        }
      )}
    </div>
  );
});
