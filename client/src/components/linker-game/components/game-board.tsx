import { memo, useCallback, useMemo } from 'react';

import {
  useLinkerGameCurrentTurn,
  useLinkerGameDifficulty,
  useLinkerGameIsProcessing,
  useLinkerGameLastAnswer,
  useLinkerGameSelectedCharacters,
  useLinkerGameStats,
  useLinkerGameStore,
} from '../store/useLinkerGameStore';
import { CharacterGrid } from './character-grid';
import styles from './LinkerGame.module.css';
import { TargetPanel } from './target-panel';

export const GameBoard = memo(function GameBoard() {
  const currentTurn = useLinkerGameCurrentTurn();
  const difficulty = useLinkerGameDifficulty();
  const isProcessing = useLinkerGameIsProcessing();
  const lastAnswer = useLinkerGameLastAnswer();
  const stats = useLinkerGameStats();
  const selectedCharacters = useLinkerGameSelectedCharacters();
  const selectCharacter = useLinkerGameStore((state) => state.selectCharacter);

  const handleSelect = useCallback(
    (characterName: string) => {
      selectCharacter(characterName);
    },
    [selectCharacter]
  );

  // Use total rounds as a key to trigger animations on turn change
  const turnKey = useMemo(() => stats.totalRounds, [stats.totalRounds]);

  if (!currentTurn) {
    return (
      <div className={styles.gameBoardEmpty}>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className={styles.gameBoard}>
      <TargetPanel
        character={currentTurn.targetCharacter}
        linkType={currentTurn.linkType}
        linkValue={currentTurn.linkValue}
        turnKey={turnKey}
      />

      <CharacterGrid
        characters={currentTurn.gridCharacters}
        onSelect={handleSelect}
        isProcessing={isProcessing}
        selectedName={lastAnswer.selectedName}
        selectedNames={selectedCharacters}
        correctNames={currentTurn.correctCharacterNames}
        showResult={lastAnswer.showingResult}
        difficulty={difficulty}
      />
    </div>
  );
});
