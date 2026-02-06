import { memo, useEffect, useMemo, useState } from 'react';

import type { GameDifficulty } from '@/types';

import { useMemoryGameDifficulty } from '../store/useMemoryGameStore';
import styles from './MemoryGame.module.css';

const GRID_CONFIG: Record<
  GameDifficulty,
  { cols: number; rows: number; pairs: number }
> = {
  easy: { cols: 3, rows: 4, pairs: 6 },
  medium: { cols: 4, rows: 4, pairs: 8 },
  hard: { cols: 6, rows: 4, pairs: 12 },
  expert_wide: { cols: 8, rows: 4, pairs: 16 },
  expert_square: { cols: 6, rows: 6, pairs: 18 },
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

  const gridClass: Record<GameDifficulty, string> = {
    easy: styles.gameBoardEasy,
    medium: styles.gameBoardMedium,
    hard: styles.gameBoardHard,
    expert_wide: styles.gameBoardExpertWide,
    expert_square: styles.gameBoardExpertSquare,
  };
  const currentGridClass = gridClass[difficulty];

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
        className={`${styles.gameBoard} ${currentGridClass} ${isLoading ? styles.gameBoardLoading : ''}`}
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
