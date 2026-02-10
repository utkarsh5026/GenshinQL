import { useMemo } from 'react';

import { useNextDays } from '@/hooks/useNextDays';

import { DAYS } from '../constants';
import type { CalendarEntry, ScheduleEntry } from '../types';

export function useCalendar<T extends ScheduleEntry>(
  nDays: number,
  scheduleEntries: T[]
): { calendar: CalendarEntry<T>[] } {
  const { dates } = useNextDays(nDays);

  const calendar = useMemo(() => {
    return dates.map((date): CalendarEntry<T> => {
      const currDay = DAYS[date.getDay()];
      const matchedEntry = scheduleEntries.find((entry) =>
        entry.day.includes(currDay)
      );

      return {
        date: date.toDateString(),
        isSunday: matchedEntry === undefined,
        currDay,
        data: matchedEntry ?? null,
      };
    });
  }, [dates, scheduleEntries]);

  return { calendar };
}
