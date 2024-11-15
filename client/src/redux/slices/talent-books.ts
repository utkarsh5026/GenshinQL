import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { TalentBookCalendar } from "@/graphql/types";

export type TalentBook = {
  name: string;
  philosophyUrl: string;
  teachingUrl: string;
  guideUrl: string;
  dayOne: string;
  dayTwo: string;
};

interface TalentBookState {
  calendar: TalentBookCalendar[] | null;
  loading: boolean;
  error: Error | null;
  talentCharMap: Record<string, TalentBook>;
}

/**
 * Creates a mapping of character names to their talent book requirements
 * @param calendar - Array of talent book calendar data
 * @returns Record mapping character names to their talent book details
 */
const createCharTalentMap = (
  calendar: TalentBookCalendar[]
): Record<string, TalentBook> => {
  const map: Record<string, TalentBook> = {};

  for (const book of calendar) {
    for (const { books, characters, day } of book.days) {
      const [dayOne, dayTwo] = day.split(" ");
      const guideUrl = books.find((b) => b.name.includes("Guide"))?.url;
      const philosophyUrl = books.find((b) =>
        b.name.includes("Philosophies")
      )?.url;
      const teachingUrl = books.find((b) => b.name.includes("Teaching"))?.url;

      for (const char of characters) {
        map[char.name] = {
          name: char.name,
          guideUrl: guideUrl || "",
          philosophyUrl: philosophyUrl || "",
          teachingUrl: teachingUrl || "",
          dayOne,
          dayTwo,
        };
      }
    }
  }

  return map;
};

const initialState: TalentBookState = {
  calendar: null,
  loading: false,
  error: null,
  talentCharMap: {},
};

const talentBooksSlice = createSlice({
  name: "talentBooks",
  initialState,
  reducers: {
    setCalendar: (state, action: PayloadAction<TalentBookCalendar[]>) => {
      console.log(action.payload);
      state.calendar = action.payload;
      state.talentCharMap = createCharTalentMap(action.payload);
      state.loading = false;
      state.error = null;
    },
    setError: (state, action: PayloadAction<Error>) => {
      state.error = action.payload;
      state.loading = false;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
  },
});

export const { setCalendar, setError, setLoading } = talentBooksSlice.actions;
export default talentBooksSlice.reducer;
