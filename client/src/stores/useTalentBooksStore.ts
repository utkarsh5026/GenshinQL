import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

import { fetchTalentBooks as fetchTalentBooksService } from '@/services/dataService';
import type { TalentBookCalendar } from '@/types';

export type TalentBook = {
  name: string;
  philosophyUrl: string;
  teachingUrl: string;
  guideUrl: string;
  dayOne: string;
  dayTwo: string;
  bookName: string;
};

interface TalentBooksState {
  // State
  calendar: TalentBookCalendar[] | null;
  talentCharMap: Record<string, TalentBook>;
  loading: boolean;
  error: string | null;

  // Actions
  setCalendar: (calendar: TalentBookCalendar[]) => void;
  fetchBooks: (checkCache?: boolean) => Promise<void>;
  setLoading: (loading: boolean) => void;
  setError: (error: string) => void;
  reset: () => void;
}

const initialState = {
  calendar: null,
  talentCharMap: {},
  loading: false,
  error: null,
};

// Helper function to create character->talent book mapping
const createCharTalentMap = (
  calendar: TalentBookCalendar[]
): Record<string, TalentBook> => {
  const map: Record<string, TalentBook> = {};

  for (const book of calendar) {
    for (const { books, characters, day } of book.days) {
      const [dayOne, dayTwo] = day.split(/\s+/);
      const guideUrl = books.find((b) => b.name.includes('Guide'))?.url;
      const philosophyUrl = books.find((b) =>
        b.name.includes('Philosophies')
      )?.url;
      const teachingUrl = books.find((b) => b.name.includes('Teaching'))?.url;

      for (const char of characters) {
        map[char.name] = {
          name: char.name,
          bookName:
            books.find((b) => b.name.includes('Guide'))?.name.split(' ')[2] ??
            '',
          guideUrl: guideUrl ?? '',
          philosophyUrl: philosophyUrl ?? '',
          teachingUrl: teachingUrl ?? '',
          dayOne,
          dayTwo,
        };
      }
    }
  }

  return map;
};

export const useTalentBooksStore = create<TalentBooksState>()(
  devtools(
    (set, get) => ({
      ...initialState,

      setCalendar: (calendar) => {
        set(
          {
            calendar,
            talentCharMap: createCharTalentMap(calendar),
            loading: false,
            error: null,
          },
          false,
          'talentBooks/setCalendar'
        );
      },

      fetchBooks: async (checkCache = true) => {
        const { calendar } = get();

        // Caching logic
        if (calendar && calendar.length > 0 && checkCache) {
          return;
        }

        set({ loading: true }, false, 'talentBooks/fetchBooks/pending');

        try {
          const data = await fetchTalentBooksService();
          get().setCalendar(data);
        } catch (err) {
          const errorMessage =
            err instanceof Error ? err.message : 'Failed to fetch talent books';
          set(
            { loading: false, error: errorMessage },
            false,
            'talentBooks/fetchBooks/rejected'
          );
        }
      },

      setLoading: (loading) =>
        set({ loading }, false, 'talentBooks/setLoading'),
      setError: (error) =>
        set({ loading: false, error }, false, 'talentBooks/setError'),
      reset: () => set(initialState, false, 'talentBooks/reset'),
    }),
    { name: 'TalentBooksStore' }
  )
);

// Selector hooks for optimized subscriptions
export const useTalentCalendar = () =>
  useTalentBooksStore((state) => state.calendar);
export const useTalentCharMap = () =>
  useTalentBooksStore((state) => state.talentCharMap);
export const useTalentBooksLoading = () =>
  useTalentBooksStore((state) => state.loading);
export const useTalentBooksError = () =>
  useTalentBooksStore((state) => state.error);
