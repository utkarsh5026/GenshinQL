import { Heart } from 'lucide-react';
import { memo } from 'react';

import styles from './LinkerGame.module.css';

interface LivesDisplayProps {
  current: number;
  max: number;
  recentlyLost?: boolean;
}

export const LivesDisplay = memo(function LivesDisplay({
  current,
  max,
  recentlyLost = false,
}: LivesDisplayProps) {
  return (
    <div className={styles.livesContainer}>
      {Array.from({ length: max }).map((_, index) => {
        const isFilled = index < current;
        const isLostHeart = !isFilled && index === current && recentlyLost;

        return (
          <Heart
            key={index}
            className={`${styles.heart} ${
              isFilled
                ? styles.heartFilled
                : isLostHeart
                  ? styles.heartLost
                  : styles.heartEmpty
            }`}
            fill={isFilled ? 'currentColor' : 'none'}
          />
        );
      })}
    </div>
  );
});
