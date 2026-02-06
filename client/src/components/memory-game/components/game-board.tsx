import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';

import {
  useMemoryGameDifficulty,
  useMemoryGameStore,
  useMemoryGameTiles,
} from '../store/useMemoryGameStore';
import { MemoryTile } from './memory-tile';
import styles from './MemoryGame.module.css';

const GRID_CONFIG = {
  easy: { cols: 3, rows: 4 },
  medium: { cols: 4, rows: 4 },
  hard: { cols: 6, rows: 4 },
} as const;

export const GameBoard = memo(function GameBoard() {
  const tiles = useMemoryGameTiles();
  const difficulty = useMemoryGameDifficulty();
  const flipTile = useMemoryGameStore((state) => state.flipTile);
  const containerRef = useRef<HTMLDivElement>(null);
  const [tileSize, setTileSize] = useState(80);

  useEffect(() => {
    const calculateTileSize = () => {
      const config = GRID_CONFIG[difficulty];
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
  }, [difficulty]);

  const handleTileClick = useCallback(
    (index: number) => {
      flipTile(index);
    },
    [flipTile]
  );

  const progress = useMemo(() => {
    const matched = tiles.filter((t) => t.isMatched).length / 2;
    const total = tiles.length / 2;
    return { matched, total };
  }, [tiles]);

  const gridClass = {
    easy: styles.gameBoardEasy,
    medium: styles.gameBoardMedium,
    hard: styles.gameBoardHard,
  }[difficulty];

  return (
    <div ref={containerRef} className={styles.gameBoardArea}>
      <div className="text-center mb-3">
        <span className="text-muted-foreground">Matched: </span>
        <span className="text-success-500 font-bold">{progress.matched}</span>
        <span className="text-muted-foreground">/{progress.total} pairs</span>
      </div>
      <div
        className={`${styles.gameBoard} ${gridClass}`}
        style={{ '--tile-size': `${tileSize}px` } as React.CSSProperties}
      >
        {tiles.map((tile, index) => (
          <MemoryTile
            key={tile.id}
            tile={tile}
            onClick={() => handleTileClick(index)}
            matchType={
              tile.isMatched
                ? tiles.some(
                    (t) =>
                      t.id !== tile.id &&
                      t.isMatched &&
                      t.sticker.url === tile.sticker.url
                  )
                  ? 'exact'
                  : 'character'
                : null
            }
          />
        ))}
      </div>
    </div>
  );
});
