import { memo } from 'react';

import type { GameMode } from '@/types';

import styles from './MemoryGame.module.css';

interface GameModeSelectorProps {
  mode: GameMode;
  onModeChange: (mode: GameMode) => void;
}

const modes: { value: GameMode; label: string; description: string }[] = [
  { value: 'classic', label: 'Classic', description: 'Standard memory game' },
  {
    value: 'time_attack',
    label: 'Time Attack',
    description: 'Beat the clock',
  },
  {
    value: 'bomb_mode',
    label: 'Bomb Mode',
    description: 'Save bombs for last',
  },
];

export const GameModeSelector = memo(function GameModeSelector({
  mode,
  onModeChange,
}: GameModeSelectorProps) {
  const getModeButtonClass = (modeValue: GameMode) => {
    const isActive = mode === modeValue;
    const baseClass = styles.modeBtn;
    const activeClass = isActive ? styles.modeBtnActive : '';

    let modeSpecificClass = '';
    if (isActive) {
      switch (modeValue) {
        case 'classic':
          modeSpecificClass = styles.modeBtnClassic;
          break;
        case 'time_attack':
          modeSpecificClass = styles.modeBtnTimeAttack;
          break;
        case 'bomb_mode':
          modeSpecificClass = styles.modeBtnBomb;
          break;
      }
    }

    return `${baseClass} ${activeClass} ${modeSpecificClass}`.trim();
  };

  return (
    <div className={styles.modeSelector}>
      {modes.map((m) => (
        <button
          key={m.value}
          className={getModeButtonClass(m.value)}
          onClick={() => onModeChange(m.value)}
          title={m.description}
        >
          {m.label}
        </button>
      ))}
    </div>
  );
});
