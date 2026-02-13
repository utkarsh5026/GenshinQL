/* Export all constants from calendar feature */
export const DAYS = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
] as const;

export type DayName = (typeof DAYS)[number];

export { TALENT_CALENDAR_THEME, WEAPON_CALENDAR_THEME } from './theme';
