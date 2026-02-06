import { Check } from 'lucide-react';
import { memo } from 'react';

import { cn } from '@/lib/utils';
import type { GameDifficulty } from '@/types';

import {
  useMemoryGameDifficulty,
  useMemoryGameStore,
} from '../store/useMemoryGameStore';

interface DifficultyConfig {
  value: GameDifficulty;
  label: string;
  shortLabel: string;
  activeClasses: string;
}

const difficulties: DifficultyConfig[] = [
  {
    value: 'easy',
    label: 'Easy (3×4)',
    shortLabel: 'Easy',
    activeClasses: 'bg-success-500/15 border-success-500 text-success-400',
  },
  {
    value: 'medium',
    label: 'Medium (4×4)',
    shortLabel: 'Medium',
    activeClasses:
      'bg-celestial-500/15 border-celestial-500 text-celestial-400',
  },
  {
    value: 'hard',
    label: 'Hard (6×4)',
    shortLabel: 'Hard',
    activeClasses: 'bg-error-500/15 border-error-500 text-error-400',
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
        'flex gap-2',
        isVertical ? 'flex-col' : 'justify-center mb-6'
      )}
    >
      {difficulties.map(({ value, label, shortLabel, activeClasses }) => {
        const isActive = currentDifficulty === value;
        return (
          <button
            key={value}
            className={cn(
              'relative px-4 py-2 rounded-lg font-medium transition-all duration-200',
              'border text-sm',
              isVertical && 'w-full',
              isActive
                ? activeClasses
                : 'bg-midnight-800/50 border-midnight-600 text-starlight-400 hover:bg-midnight-700/50 hover:border-starlight-600 hover:text-starlight-300'
            )}
            onClick={() => setDifficulty(value)}
          >
            <span className="flex items-center justify-center gap-2">
              {isActive && <Check className="w-3.5 h-3.5" />}
              {isVertical ? label : shortLabel}
            </span>
          </button>
        );
      })}
    </div>
  );
});
