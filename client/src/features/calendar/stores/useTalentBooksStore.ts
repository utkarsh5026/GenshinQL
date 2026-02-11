import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

import { loadTalentsData } from '../services';
import type { TalentBook, TalentBookCalendar } from '../types';
interface TalentBooksState {
  calendar: TalentBookCalendar[] | null;
  talentCharMap: Record<string, TalentBook>;
  loading: boolean;
  error: string | null;
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

function createCharTalentMap(
  calendar: TalentBookCalendar[]
): Record<string, TalentBook> {
  const map: Record<string, TalentBook> = {};

  const getUrl = (books: { name: string; url: string }[], keyword: string) => {
    return books.find((b) => b.name.includes(keyword))?.url ?? '';
  };

  for (const book of calendar) {
    for (const { books, characters, dayOne, dayTwo } of book.days) {
      const [guideUrl, philosophyUrl, teachingUrl] = [
        'Guide',
        'Philosophies',
        'Teaching',
      ].map((keyword) => getUrl(books, keyword));

      characters.forEach(({ name }) => {
        if (!name) return;

        map[name] = {
          name,
          bookName: guideUrl.split(' ')[2] ?? '',
          guideUrl,
          philosophyUrl,
          teachingUrl,
          dayOne,
          dayTwo,
        };
      });
    }
  }

  return map;
}

export const useTalentBooksStore = create<TalentBooksState>()(
  devtools(
    (set, get) => ({
      ...initialState,

      setCalendar: (calendar) => {
        set({
          calendar,
          talentCharMap: createCharTalentMap(calendar),
          loading: false,
          error: null,
        });
      },

      fetchBooks: async (checkCache = true) => {
        const { calendar } = get();

        if (calendar && calendar.length > 0 && checkCache) {
          return;
        }

        set({ loading: true });

        try {
          const { talentBooks } = await loadTalentsData();
          get().setCalendar(talentBooks);
        } catch (err) {
          set({
            loading: false,
            error:
              err instanceof Error
                ? err.message
                : 'Failed to fetch talent books',
          });
        }
      },

      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ loading: false, error }),
      reset: () => set(initialState),
    }),
    { name: 'TalentBooksStore' }
  )
);

export const useTalentCalendar = () =>
  useTalentBooksStore((state) => state.calendar);
export const useTalentCharMap = () =>
  useTalentBooksStore((state) => state.talentCharMap);
export const useTalentBooksLoading = () =>
  useTalentBooksStore((state) => state.loading);
export const useTalentBooksError = () =>
  useTalentBooksStore((state) => state.error);
