import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

import {
  fetchStickers,
  flattenStickers,
  shuffleArray,
} from '@/features/memory-game/services';
import type { GameSticker, StickersData } from '@/types';

interface StickerState {
  stickers: GameSticker[];
  loading: boolean;
  error: string | null;

  fetchStickers: () => Promise<void>;
  getRandomSticker: () => GameSticker | null;
}

const initialState = {
  stickers: [] as GameSticker[],
  loading: false,
  error: null as string | null,
};

export const useStickerStore = create<StickerState>()(
  devtools(
    (set, get) => ({
      ...initialState,

      fetchStickers: async () => {
        const { stickers } = get();
        if (stickers.length > 0) return;

        set({ loading: true, error: null });

        try {
          const data: StickersData = await fetchStickers();
          const flattened = flattenStickers(data);

          set({ stickers: flattened, loading: false });
        } catch (err) {
          const errorMessage =
            err instanceof Error ? err.message : 'Failed to load stickers';
          set({ loading: false, error: errorMessage });
        }
      },

      getRandomSticker: () => {
        const { stickers } = get();
        if (stickers.length === 0) return null;

        const shuffled = shuffleArray(stickers);
        return shuffled[0];
      },
    }),
    { name: 'StickerStore' }
  )
);
