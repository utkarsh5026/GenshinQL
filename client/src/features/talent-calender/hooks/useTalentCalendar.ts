import { useMemo } from 'react';

import { DAYS } from '../constants';
import { TalentBookCalendar } from '../types';

export function useTalentCalendar(nDays: number, talent: TalentBookCalendar) {
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
    return dates.map((date) => {
      const currDay = DAYS[date.getDay()];
      const filteredDay = talent.days.find((day) => day.day.includes(currDay));

      if (filteredDay === undefined)
        return {
          date: date.toDateString(),
          isSunday: true,
          currDay,
          books: [],
          characters: [],
        };

      return {
        date: date.toDateString(),
        isSunday: false,
        currDay,
        books: filteredDay.books,
        characters: filteredDay.characters,
      };
    });
  }, [dates, talent.days]);

  return { calendar };
}
