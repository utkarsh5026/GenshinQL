import { memo, useEffect, useMemo, useState } from 'react';

import { useMemoryGameDifficulty } from '../store/useMemoryGameStore';
import styles from './MemoryGame.module.css';

// Grid configurations for each difficulty
const GRID_CONFIG = {
  easy: { cols: 3, rows: 4, pairs: 6 },
  medium: { cols: 4, rows: 4, pairs: 8 },
  hard: { cols: 6, rows: 4, pairs: 12 },
} as const;

interface GameBoardPreviewProps {
  isLoading?: boolean;
  loadingProgress?: { loaded: number; total: number };
}

export const GameBoardPreview = memo(function GameBoardPreview({
  isLoading = false,
  loadingProgress,
}: GameBoardPreviewProps) {
  const difficulty = useMemoryGameDifficulty();
  const [tileSize, setTileSize] = useState(80);

  const config = useMemo(() => GRID_CONFIG[difficulty], [difficulty]);
  const totalTiles = config.pairs * 2;

  // Calculate tile size based on available height
  useEffect(() => {
    const calculateTileSize = () => {
      const availableHeight = window.innerHeight - 220;
      const padding = 32;
      const gaps = (config.rows - 1) * 8;
      const maxTileHeight = (availableHeight - padding - gaps) / config.rows;

      const availableWidth = Math.min(800, window.innerWidth - 400);
      const widthGaps = (config.cols - 1) * 8;
      const maxTileWidth = (availableWidth - padding - widthGaps) / config.cols;

      const newTileSize = Math.floor(
        Math.min(maxTileHeight, maxTileWidth, 120)
      );
      setTileSize(Math.max(newTileSize, 60));
    };

    calculateTileSize();
    window.addEventListener('resize', calculateTileSize);
    return () => window.removeEventListener('resize', calculateTileSize);
  }, [config]);

  const gridClass = {
    easy: styles.gameBoardEasy,
    medium: styles.gameBoardMedium,
    hard: styles.gameBoardHard,
  }[difficulty];

  return (
    <div className={styles.gameBoardArea}>
      <div className="text-center mb-3">
        <span className="text-muted-foreground">
          {isLoading ? 'Loading stickers...' : `${totalTiles} tiles ready`}
        </span>
        {isLoading && loadingProgress && (
          <span className="text-legendary-500 font-bold ml-2">
            {loadingProgress.loaded}/{loadingProgress.total}
          </span>
        )}
      </div>
      <div
        className={`${styles.gameBoard} ${gridClass} ${isLoading ? styles.gameBoardLoading : ''}`}
        style={{ '--tile-size': `${tileSize}px` } as React.CSSProperties}
      >
        {Array.from({ length: totalTiles }).map((_, index) => (
          <div
            key={index}
            className={`${styles.tile} ${styles.tilePreview}`}
            style={{
              animationDelay: `${index * 30}ms`,
            }}
          >
            <div className={styles.tileInner}>
              <div className={styles.tileFront} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});
