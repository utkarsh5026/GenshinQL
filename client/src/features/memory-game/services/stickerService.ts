import type {
  ComboConfig,
  DifficultyConfig,
  GameDifficulty,
  GameSticker,
  PeekConfig,
  StickersData,
} from '@/types';

let stickersCache: StickersData | null = null;

// Grid configurations for each difficulty
export const GRID_CONFIG: Record<GameDifficulty, DifficultyConfig> = {
  easy: { cols: 3, rows: 4, pairs: 6, bombCount: 0 },
  medium: { cols: 4, rows: 4, pairs: 8, bombCount: 0 },
  hard: { cols: 6, rows: 4, pairs: 12, bombCount: 0 },
  expert_wide: { cols: 8, rows: 4, pairs: 16, bombCount: 2 },
  expert_square: { cols: 6, rows: 6, pairs: 18, bombCount: 2 },
};

// Time limits for Time Attack mode (in milliseconds)
export const TIME_ATTACK_LIMITS: Record<GameDifficulty, number> = {
  easy: 120000, // 2 minutes
  medium: 150000, // 2.5 minutes
  hard: 180000, // 3 minutes
  expert_wide: 240000, // 4 minutes
  expert_square: 270000, // 4.5 minutes
};

// Time bonus per remaining second in Time Attack
export const TIME_BONUS_PER_SECOND: Record<GameDifficulty, number> = {
  easy: 2,
  medium: 3,
  hard: 4,
  expert_wide: 5,
  expert_square: 5,
};

// Peek mode durations (in milliseconds)
export const PEEK_CONFIG: Record<GameDifficulty, PeekConfig> = {
  easy: { duration: 3000, theme: 'normal' },
  medium: { duration: 2000, theme: 'spooky' },
  hard: { duration: 1500, theme: 'spooky' },
  expert_wide: { duration: 1500, theme: 'spooky' },
  expert_square: { duration: 1000, theme: 'spooky' },
};

// Combo system configuration
export const COMBO_CONFIG: ComboConfig = {
  windowMs: 5000, // 5 seconds to maintain combo
  multipliers: [1, 1.5, 2, 2.5, 3], // Index 0 = 1st match, index 4 = 5th+ consecutive
};

export async function fetchStickers(): Promise<StickersData> {
  if (stickersCache) return stickersCache;

  const response = await fetch('/stickers.json');
  const data: StickersData = await response.json();
  stickersCache = data;
  return data;
}

export function flattenStickers(data: StickersData): GameSticker[] {
  const result: GameSticker[] = [];
  for (const [characterName, urls] of Object.entries(data)) {
    for (const url of urls) {
      result.push({ url, characterName });
    }
  }
  return result;
}

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function getRandomStickersForGame(
  allStickers: GameSticker[],
  pairCount: number
): GameSticker[] {
  const shuffled = shuffleArray(allStickers);
  const selected = shuffled.slice(0, pairCount);
  const pairs = [...selected, ...selected];
  return shuffleArray(pairs);
}

export function getDifficultyConfig(
  difficulty: GameDifficulty
): DifficultyConfig {
  return GRID_CONFIG[difficulty];
}

export async function preloadStickers(
  stickers: GameSticker[],
  onProgress?: (loaded: number, total: number) => void
): Promise<void> {
  let loaded = 0;
  const total = stickers.length;

  const promises = stickers.map(
    (s) =>
      new Promise<void>((resolve) => {
        const img = new Image();
        img.onload = () => {
          loaded++;
          onProgress?.(loaded, total);
          resolve();
        };
        img.onerror = () => {
          loaded++;
          onProgress?.(loaded, total);
          resolve();
        };
        img.src = s.url;
      })
  );
  await Promise.all(promises);
}
