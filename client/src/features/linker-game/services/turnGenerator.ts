import {
  getRandomVersionInRange,
  getValidVersionRange,
  isValidNumericVersion,
} from '@/features/linker-game/utils/versionComparison';
import type { Character } from '@/types';

import { DIFFICULTY_CONFIG } from '../constants';
import type { LinkerDifficulty, LinkerTurn } from '../types';
import {
  generateGrid,
  getRandomCharacter,
  getRandomLinkType,
} from './gridGeneratorService';

/**
 * Generates a new turn for the linker game.
 * Creates a random challenge by selecting a target character, a link type, and generating
 * a grid of characters where some match the link criteria and others don't.
 *
 * Special handling for version-based link types:
 * - Filters characters to only include those with valid numeric versions
 * - Falls back to element-based matching if no valid version characters exist
 * - Generates a random version in the valid range for comparison
 *
 * @param characters - Pool of all available characters
 * @param difficulty - Game difficulty level (affects grid configuration)
 * @param gridSize - Number of characters to display in the grid
 * @returns A complete turn object with target character, link type, grid, and correct answers
 */
export function generateNewTurn(
  characters: Character[],
  difficulty: LinkerDifficulty,
  gridSize: number
): LinkerTurn {
  const config = DIFFICULTY_CONFIG[difficulty];
  const linkType = getRandomLinkType();

  let targetCharacter: Character;
  let linkValue: string;
  let charactersForGrid: Character[];

  if (linkType === 'versionBefore' || linkType === 'versionAfter') {
    charactersForGrid = characters.filter(
      (c) => c.version && isValidNumericVersion(c.version)
    );

    if (charactersForGrid.length === 0) {
      charactersForGrid = characters;
      targetCharacter = getRandomCharacter(charactersForGrid);
      linkValue = targetCharacter.element;
    } else {
      targetCharacter = getRandomCharacter(charactersForGrid);
      const { min, max } = getValidVersionRange(charactersForGrid);
      linkValue = getRandomVersionInRange(min, max);
    }
  } else {
    charactersForGrid = characters;
    targetCharacter = getRandomCharacter(charactersForGrid);
    linkValue = targetCharacter[linkType];
  }

  const { characters: gridCharacters, correctNames } = generateGrid(
    charactersForGrid,
    targetCharacter,
    linkType,
    linkValue,
    {
      gridSize: gridSize,
      minCorrect: config.minCorrect,
      maxCorrect: config.maxCorrect,
    }
  );

  return {
    targetCharacter,
    linkType,
    linkValue,
    gridCharacters,
    correctCharacterNames: correctNames,
    turnStartTime: Date.now(),
  };
}
