import { memo, useCallback, useMemo } from 'react';

import type { Character } from '@/types';

import type { LinkerDifficulty } from '../types';
import { CharacterTile } from './character-tile';
import styles from './LinkerGame.module.css';

interface CharacterGridProps {
  characters: Character[];
  onSelect: (characterName: string) => void;
  isProcessing: boolean;
  selectedName: string | null;
  correctNames: string[];
  showResult: boolean;
  difficulty: LinkerDifficulty;
}

export const CharacterGrid = memo(function CharacterGrid({
  characters,
  onSelect,
  isProcessing,
  selectedName,
  correctNames,
  showResult,
  difficulty,
}: CharacterGridProps) {
  const handleSelect = useCallback(
    (name: string) => {
      if (!isProcessing) {
        onSelect(name);
      }
    },
    [onSelect, isProcessing]
  );

  const gridClass = useMemo(() => {
    return `${styles.characterGrid} ${
      difficulty === 'hard' ? styles.gridSize9 : styles.gridSize6
    }`;
  }, [difficulty]);

  return (
    <div className={gridClass}>
      {characters.map((character) => {
        const isSelected = selectedName === character.name;
        const isCorrect = correctNames.includes(character.name);

        return (
          <CharacterTile
            key={character.name}
            character={character}
            onClick={() => handleSelect(character.name)}
            isSelected={isSelected}
            isCorrect={showResult ? isCorrect : null}
            isDisabled={isProcessing}
            showResult={showResult}
          />
        );
      })}
    </div>
  );
});
