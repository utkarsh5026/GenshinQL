import type { Character } from '@/types';

// Linker Game Types
export type LinkerDifficulty = 'easy' | 'medium' | 'hard';
export type LinkType = 'element' | 'weaponType' | 'region';
export type LinkerGameStatus = 'idle' | 'playing' | 'game_over';
export type SelectionMode = 'single' | 'multi';

export interface LinkerTurn {
  targetCharacter: Character;
  linkType: LinkType;
  linkValue: string;
  gridCharacters: Character[];
  correctCharacterNames: string[];
  turnStartTime: number;
}

export interface LinkerGameStats {
  score: number;
  correctAnswers: number;
  wrongAnswers: number;
  totalRounds: number;
  longestStreak: number;
  currentStreak: number;
  startTime: number | null;
  endTime: number | null;
}

export interface LinkerDifficultyConfig {
  timePerTurn: number;
  gridSize: number;
  basePoints: number;
  timeMultiplier: number;
  minCorrect: number;
  maxCorrect: number;
}
