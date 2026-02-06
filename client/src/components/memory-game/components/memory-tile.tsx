import React, { useMemo } from 'react';

import type { MemoryTile as MemoryTileType } from '@/types';

import styles from './MemoryGame.module.css';

interface MemoryTileProps {
  tile: MemoryTileType;
  onClick: () => void;
  matchType?: 'exact' | 'character' | null;
  isPeeking?: boolean;
}

export const MemoryTile: React.FC<MemoryTileProps> = ({
  tile,
  onClick,
  matchType,
  isPeeking = false,
}) => {
  const className = useMemo(() => {
    const classes = [styles.tile];

    // Show flipped during peek or when actually flipped/matched
    if (isPeeking || tile.isFlipped || tile.isMatched) {
      classes.push(styles.tileFlipped);
    }

    // Peek-specific styling
    if (isPeeking) {
      classes.push(styles.tilePeeking);
    }

    if (tile.isMatched) {
      classes.push(styles.tileDisabled);
      if (matchType === 'exact') {
        classes.push(styles.tileExactMatch);
      } else if (matchType === 'character') {
        classes.push(styles.tileCharacterMatch);
      }
    }

    // Bomb tile styling
    if (tile.isBomb) {
      classes.push(styles.tileBomb);
      if (tile.bombTriggered) {
        classes.push(styles.tileBombTriggered);
      }
    }

    return classes.join(' ');
  }, [
    tile.isFlipped,
    tile.isMatched,
    tile.isBomb,
    tile.bombTriggered,
    matchType,
    isPeeking,
  ]);

  return (
    <div className={className} onClick={onClick}>
      <div className={styles.tileInner}>
        <div className={styles.tileFront} />
        <div className={styles.tileBack}>
          <img
            src={tile.sticker.url}
            alt={tile.sticker.characterName}
            loading="lazy"
            draggable={false}
          />
        </div>
      </div>
    </div>
  );
};
