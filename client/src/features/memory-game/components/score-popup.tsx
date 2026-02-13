import React, { useEffect } from 'react';

import type { ScoreEvent } from '@/types';

import styles from './MemoryGame.module.css';

interface ScorePopupProps {
  event: ScoreEvent;
  onComplete: () => void;
}

export const ScorePopup: React.FC<ScorePopupProps> = ({
  event,
  onComplete,
}: ScorePopupProps) => {
  useEffect(() => {
    const timer = setTimeout(onComplete, 1000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  const getColorClass = () => {
    switch (event.type) {
      case 'match':
        return styles.scorePopupMatch;
      case 'combo':
        return styles.scorePopupCombo;
      case 'bomb':
        return styles.scorePopupBomb;
      case 'time_bonus':
        return styles.scorePopupTimeBonus;
      default:
        return styles.scorePopupMatch;
    }
  };

  const formatPoints = () => {
    const sign = event.points >= 0 ? '+' : '';
    if (event.type === 'combo' && event.comboLevel) {
      return `${event.comboLevel}x ${sign}${event.points}`;
    }
    return `${sign}${event.points}`;
  };

  return (
    <div
      className={`${styles.scorePopup} ${getColorClass()}`}
      style={{
        left: event.position.x,
        top: event.position.y,
      }}
    >
      {formatPoints()}
    </div>
  );
};
