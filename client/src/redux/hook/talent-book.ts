import { useCallback } from "react";
import { useAppDispatch, useAppSelector } from "../hooks";
import { useLazyQuery } from "@apollo/client";
import { GET_TALENT_MATERIALS_CALENDAR } from "@/graphql/queries";
import { setCalendar, setError, setLoading } from "../slices/talent-books";
import type { TalentBookCalendar } from "@/graphql/types";
import type { TalentBook } from "../slices/talent-books";

interface TalentBooksHook {
  calendar: TalentBookCalendar[] | null;
  talentCharMap: Record<string, TalentBook>;
  loading: boolean;
  error: Error | null;
  fetchBooks: (checkCache?: boolean) => Promise<void>;
}

/**
 * Custom hook for managing talent book data and operations.
 *
 * This hook provides access to talent book calendar data, character mappings,
 * loading states, and methods to fetch talent book information.
 *
 * @returns {TalentBooksHook} An object containing:
 *   - calendar: The current talent book calendar data
 *   - talentCharMap: Mapping of characters to their talent book requirements
 *   - loading: Loading state indicator
 *   - error: Any error that occurred during data fetching
 *   - fetchBooks: Function to fetch talent book data
 */
const useTalentBooks = (): TalentBooksHook => {
  const [getTalentBooks] = useLazyQuery(GET_TALENT_MATERIALS_CALENDAR);
  const dispatch = useAppDispatch();
  const { calendar, talentCharMap, loading, error } = useAppSelector(
    (state) => state.talentBooks
  );

  const fetchBooks = useCallback(
    async (checkCache = true) => {
      dispatch(setLoading(true));
      if (calendar && calendar.length > 0 && checkCache) return;

      const { data, error } = await getTalentBooks();
      console.log(data);
      if (error) dispatch(setError(error));
      else dispatch(setCalendar(data.talentBooks));
    },
    [dispatch, getTalentBooks, calendar]
  );

  return { calendar, talentCharMap, loading, error, fetchBooks };
};

export default useTalentBooks;
