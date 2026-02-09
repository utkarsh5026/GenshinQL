import { useEffect, useState } from 'react';

import styles from './MemoryGame.module.css';

interface ComboIndicatorProps {
  comboLevel: number;
}

export const ComboIndicator = ({ comboLevel }: ComboIndicatorProps) => {
  const [dismissedAt, setDismissedAt] = useState<number | null>(null);
  useEffect(() => {
    if (comboLevel >= 2) {
      const timer = setTimeout(() => {
        setDismissedAt(comboLevel);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [comboLevel]);

  const visible = comboLevel >= 2 && dismissedAt !== comboLevel;
  if (!visible) return null;

  const getSizeClass = () => {
    if (comboLevel >= 5) return styles.comboHuge;
    if (comboLevel >= 3) return styles.comboLarge;
    return styles.comboMedium;
  };

  return (
    <div className={`${styles.comboIndicator} ${getSizeClass()}`}>
      <span className={styles.comboNumber}>{comboLevel}x</span>
      <span className={styles.comboText}>Combo!</span>
    </div>
  );
};
