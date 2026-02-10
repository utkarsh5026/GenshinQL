import { useMemo } from 'react';

import { DAYS } from '../constants';
import type { CalendarEntry, ScheduleEntry } from '../types';

export function useCalendar<T extends ScheduleEntry>(
  nDays: number,
  scheduleEntries: T[]
): { calendar: CalendarEntry<T>[] } {
  const dates = useMemo(() => {
    const today = new Date();
    const dates: Date[] = [];
    for (let i = 0; i < nDays; i++) {
      const nextDay = new Date(today);
      nextDay.setDate(today.getDate() + i);
      dates.push(nextDay);
    }
    return dates;
  }, [nDays]);

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
