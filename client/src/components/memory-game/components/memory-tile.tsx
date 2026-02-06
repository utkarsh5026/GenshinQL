import React, { useMemo } from 'react';

import type { MemoryTile as MemoryTileType } from '@/types';

import styles from './MemoryGame.module.css';

interface MemoryTileProps {
  tile: MemoryTileType;
  onClick: () => void;
  matchType?: 'exact' | 'character' | null;
}

export const MemoryTile: React.FC<MemoryTileProps> = ({
  tile,
  onClick,
  matchType,
}) => {
  const className = useMemo(() => {
    const classes = [styles.tile];

    if (tile.isFlipped || tile.isMatched) {
      classes.push(styles.tileFlipped);
    }

    if (tile.isMatched) {
      classes.push(styles.tileDisabled);
      if (matchType === 'exact') {
        classes.push(styles.tileExactMatch);
      } else if (matchType === 'character') {
        classes.push(styles.tileCharacterMatch);
      }
    }

    return classes.join(' ');
  }, [tile.isFlipped, tile.isMatched, matchType]);

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
