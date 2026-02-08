import type { Character } from '@/types';
import { isVersionAfter, isVersionBefore } from '@/utils/versionComparison';

import type { LinkType } from '../types';

interface GridGenerationConfig {
  gridSize: number;
  minCorrect: number;
  maxCorrect: number;
}

interface GeneratedGrid {
  characters: Character[];
  correctNames: string[];
}

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function randomBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function isCharacterMatch(
  character: Character,
  linkType: LinkType,
  linkValue: string
): boolean {
  // Handle version comparison links
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

  // Handle direct property match (element, weaponType, region, rarity)
  return character[linkType] === linkValue;
}

export function generateGrid(
  allCharacters: Character[],
  targetCharacter: Character,
  linkType: LinkType,
  linkValue: string,
  config: GridGenerationConfig
): GeneratedGrid {
  // Filter characters that match the link (excluding target)
  const matchingCharacters = allCharacters.filter(
    (c) =>
      c.name !== targetCharacter.name &&
      isCharacterMatch(c, linkType, linkValue)
  );

  // Filter characters that do NOT match the link
  const nonMatchingCharacters = allCharacters.filter(
    (c) =>
      c.name !== targetCharacter.name &&
      !isCharacterMatch(c, linkType, linkValue)
  );

  // Determine number of correct answers (random within range)
  const numCorrect = Math.min(
    matchingCharacters.length,
    randomBetween(config.minCorrect, config.maxCorrect)
  );

  // Select random correct characters
  const selectedCorrect = shuffleArray(matchingCharacters).slice(0, numCorrect);

  // Fill remaining slots with wrong answers
  const numWrong = config.gridSize - numCorrect;
  const selectedWrong = shuffleArray(nonMatchingCharacters).slice(0, numWrong);

  // Combine and shuffle the final grid
  const grid = shuffleArray([...selectedCorrect, ...selectedWrong]);

  return {
    characters: grid,
    correctNames: selectedCorrect.map((c) => c.name),
  };
}

export function getRandomLinkType(): LinkType {
  const linkTypes: LinkType[] = [
    'element',
    'weaponType',
    'region',
    'rarity',
    'versionBefore',
    'versionAfter',
  ];
  return linkTypes[Math.floor(Math.random() * linkTypes.length)];
}

export function getRandomCharacter(characters: Character[]): Character {
  return characters[Math.floor(Math.random() * characters.length)];
}

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
