import { useEffect, useMemo } from 'react';

import { useStickerStore } from '@/stores/useStickerStore';
import type { GameSticker } from '@/types';

export function useRandomSticker(): {
  sticker: GameSticker | null;
  loading: boolean;
  error: string | null;
} {
  const stickers = useStickerStore((state) => state.stickers);
  const loading = useStickerStore((state) => state.loading);
  const error = useStickerStore((state) => state.error);
  const fetchStickers = useStickerStore((state) => state.fetchStickers);
  const getRandomSticker = useStickerStore((state) => state.getRandomSticker);

  useEffect(() => {
    fetchStickers();
  }, [fetchStickers]);

  const selectedSticker = useMemo(() => {
    if (stickers.length === 0 || loading) return null;
    return getRandomSticker();
  }, [stickers.length, loading, getRandomSticker]);

  return { sticker: selectedSticker, loading, error };
}
