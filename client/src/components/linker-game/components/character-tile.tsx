import { Check, X } from 'lucide-react';
import { memo, useCallback, useMemo } from 'react';

import type { Character } from '@/types';

import styles from './LinkerGame.module.css';

interface CharacterTileProps {
  character: Character;
  onClick: () => void;
  isSelected: boolean;
  isCorrect: boolean | null;
  isDisabled: boolean;
  showResult: boolean;
}

export const CharacterTile = memo(function CharacterTile({
  character,
  onClick,
  isSelected,
  isCorrect,
  isDisabled,
  showResult,
}: CharacterTileProps) {
  const handleClick = useCallback(() => {
    if (!isDisabled) {
      onClick();
    }
  }, [onClick, isDisabled]);

  const tileClass = useMemo(() => {
    const classes = [styles.characterTile];

    if (isDisabled) classes.push(styles.tileDisabled);

    if (showResult) {
      if (isSelected) {
        classes.push(isCorrect ? styles.tileCorrect : styles.tileWrong);
      } else if (isCorrect) {
        classes.push(styles.tileCorrectHint);
      }
    }

    return classes.join(' ');
  }, [isDisabled, showResult, isSelected, isCorrect]);

  return (
    <button
      type="button"
      className={tileClass}
      onClick={handleClick}
      disabled={isDisabled}
    >
      <div className={styles.tileImageContainer}>
        <img
          src={character.iconUrl}
          alt={character.name}
          className={styles.tileImage}
          loading="lazy"
          draggable={false}
        />
      </div>
      <span className={styles.tileName}>{character.name}</span>

      {showResult && isSelected && (
        <div
          className={`${styles.tileResultIcon} ${isCorrect ? styles.resultCorrect : styles.resultWrong}`}
        >
          {isCorrect ? (
            <Check className="w-5 h-5" />
          ) : (
            <X className="w-5 h-5" />
          )}
        </div>
      )}

      {showResult && !isSelected && isCorrect && (
        <div className={`${styles.tileResultIcon} ${styles.resultHint}`}>
          <Check className="w-4 h-4" />
        </div>
      )}
    </button>
  );
});
