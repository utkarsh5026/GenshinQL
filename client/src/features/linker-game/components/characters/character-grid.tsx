import { memo, useCallback, useMemo } from 'react';

import type { Character } from '@/types';

import type { LinkerDifficulty } from '../../types';
import { CharacterTile } from './character-tile';
import styles from './LinkerGame.module.css';

interface CharacterGridProps {
  characters: Character[];
  onSelect: (characterName: string) => void;
  isProcessing: boolean;
  selectedName: string | null;
  selectedNames: string[]; // For multi-select mode
  correctNames: string[];
  showResult: boolean;
  difficulty: LinkerDifficulty;
}

export const CharacterGrid = memo(function CharacterGrid({
  characters,
  onSelect,
  isProcessing,
  selectedName,
  selectedNames,
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
        // Check if selected - in multi mode use selectedNames array
        const isSelected =
          selectedName === character.name ||
          selectedNames.includes(character.name);
        const isCorrect = correctNames.includes(character.name);
        // In multi mode, already selected correct ones should be disabled
        const isAlreadySelected = selectedNames.includes(character.name);

        return (
          <CharacterTile
            key={character.name}
            character={character}
            onClick={() => handleSelect(character.name)}
            isSelected={isSelected}
            isCorrect={showResult ? isCorrect : isAlreadySelected ? true : null}
            isDisabled={isProcessing || isAlreadySelected}
            showResult={showResult || isAlreadySelected}
          />
        );
      })}
    </div>
  );
});
