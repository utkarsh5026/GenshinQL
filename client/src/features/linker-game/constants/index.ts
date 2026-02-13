import type { LinkerDifficulty, LinkerDifficultyConfig } from '../types';

export const DIFFICULTY_CONFIG: Record<
  LinkerDifficulty,
  LinkerDifficultyConfig
> = {
  easy: {
    timePerTurn: 15000,
    gridSize: 6,
    basePoints: 100,
    timeMultiplier: 5,
    minCorrect: 2,
    maxCorrect: 3,
  },
  medium: {
    timePerTurn: 10000,
    gridSize: 6,
    basePoints: 150,
    timeMultiplier: 10,
    minCorrect: 1,
    maxCorrect: 2,
  },
  hard: {
    timePerTurn: 5000,
    gridSize: 9,
    basePoints: 200,
    timeMultiplier: 20,
    minCorrect: 1,
    maxCorrect: 2,
  },
};
