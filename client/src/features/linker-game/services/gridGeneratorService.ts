import type { Character } from '@/types';

import type { LinkType } from '../types';
import { isVersionAfter, isVersionBefore } from '../utils/versionComparison';
/**
 * Available link types that can be used to match characters in the game.
 * These represent different character properties that can be used as connection criteria.
 */
const LINK_TYPES: LinkType[] = [
  'element',
  'weaponType',
  'region',
  'rarity',
  'versionBefore',
  'versionAfter',
] as const;

/**
 * Configuration options for grid generation.
 */
interface GridGenerationConfig {
  /** Total number of characters to display in the grid */
  gridSize: number;
  /** Minimum number of correct matching characters */
  minCorrect: number;
  /** Maximum number of correct matching characters */
  maxCorrect: number;
}

/**
 * Result of grid generation, containing the characters to display and which ones are correct.
 */
interface GeneratedGrid {
  /** Array of characters to display in the grid */
  characters: Character[];
  /** Names of characters that are correct matches for the given link type and value */
  correctNames: string[];
}

/**
 * Shuffles an array using the Fisher-Yates algorithm.
 * Creates a new array to avoid mutating the original.
 *
 * @template T - Type of array elements
 * @param array - The array to shuffle
 * @returns A new shuffled array
 */
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Generates a random integer between min and max (inclusive).
 *
 * @param min - Minimum value (inclusive)
 * @param max - Maximum value (inclusive)
 * @returns Random integer in the range [min, max]
 */
function randomBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Determines if a character matches the given link type and value.
 * Handles special cases for version-based comparisons.
 *
 * @param character - The character to check
 * @param linkType - The type of link/property to match against
 * @param linkValue - The expected value for the link type
 * @returns True if the character matches the criteria, false otherwise
 */
function isCharacterMatch(
  character: Character,
  linkType: LinkType,
  linkValue: string
): boolean {
  if (linkType === 'versionBefore') {
    return character.version
      ? isVersionBefore(character.version, linkValue)
      : false;
  }
  if (linkType === 'versionAfter') {
    return character.version
      ? isVersionAfter(character.version, linkValue)
      : false;
  }
  return character[linkType] === linkValue;
}

/**
 * Generates a grid of characters for the linker game.
 * Selects a mix of correct and incorrect characters based on the link type and value.
 *
 * @param allCharacters - Pool of all available characters to choose from
 * @param targetCharacter - The target character to match against (excluded from grid)
 * @param linkType - The type of link/property to match
 * @param linkValue - The value that correct characters should match
 * @param config - Configuration for grid size and number of correct answers
 * @returns Generated grid with characters and list of correct character names
 *
 * @example
 * ```ts
 * const grid = generateGrid(
 *   characters,
 *   targetChar,
 *   'element',
 *   'Pyro',
 *   { gridSize: 8, minCorrect: 2, maxCorrect: 4 }
 * );
 * ```
 */
export function generateGrid(
  allCharacters: Character[],
  targetCharacter: Character,
  linkType: LinkType,
  linkValue: string,
  config: GridGenerationConfig
): GeneratedGrid {
  const matchingCharacters = allCharacters.filter(
    (c) =>
      c.name !== targetCharacter.name &&
      isCharacterMatch(c, linkType, linkValue)
  );

  const nonMatchingCharacters = allCharacters.filter(
    (c) =>
      c.name !== targetCharacter.name &&
      !isCharacterMatch(c, linkType, linkValue)
  );

  const numCorrect = Math.min(
    matchingCharacters.length,
    randomBetween(config.minCorrect, config.maxCorrect)
  );

  const selectedCorrect = shuffleArray(matchingCharacters).slice(0, numCorrect);
  const numWrong = config.gridSize - numCorrect;
  const selectedWrong = shuffleArray(nonMatchingCharacters).slice(0, numWrong);
  const grid = shuffleArray([...selectedCorrect, ...selectedWrong]);

  return {
    characters: grid,
    correctNames: selectedCorrect.map((c) => c.name),
  };
}

/**
 * Returns a random link type from the available options.
 *
 * @returns A randomly selected link type
 */
export function getRandomLinkType(): LinkType {
  return LINK_TYPES[Math.floor(Math.random() * LINK_TYPES.length)];
}

/**
 * Selects a random character from the provided array.
 *
 * @param characters - Array of characters to choose from
 * @returns A randomly selected character
 */
export function getRandomCharacter(characters: Character[]): Character {
  return characters[Math.floor(Math.random() * characters.length)];
}

/**
 * Converts a link type to its human-readable display name.
 *
 * @param linkType - The link type to convert
 * @returns User-friendly display name for the link type
 *
 * @example
 * ```ts
 * getLinkDisplayName('weaponType') // Returns: 'Weapon'
 * getLinkDisplayName('versionBefore') // Returns: 'Released'
 * ```
 */
export function getLinkDisplayName(linkType: LinkType): string {
  switch (linkType) {
    case 'element':
      return 'Element';
    case 'weaponType':
      return 'Weapon';
    case 'region':
      return 'Region';
    case 'rarity':
      return 'Rarity';
    case 'versionBefore':
      return 'Released';
    case 'versionAfter':
      return 'Released';
  }
}
