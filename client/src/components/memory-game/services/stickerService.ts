import type { GameSticker, StickersData } from '@/types';

let stickersCache: StickersData | null = null;

export async function fetchStickers(): Promise<StickersData> {
  if (stickersCache) return stickersCache;

  const response = await fetch('/stickers.json');
  stickersCache = await response.json();
  return stickersCache;
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

export function getDifficultyConfig(difficulty: 'easy' | 'medium' | 'hard') {
  switch (difficulty) {
    case 'easy':
      return { pairs: 6, cols: 3, rows: 4 };
    case 'medium':
      return { pairs: 8, cols: 4, rows: 4 };
    case 'hard':
      return { pairs: 12, cols: 6, rows: 4 };
  }
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
