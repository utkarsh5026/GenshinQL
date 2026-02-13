/* Export all utilities from home feature */
import { DAY_NAMES, MONTH_NAMES } from '../constants';

export type DayType = 0 | 1 | 2 | 'all';

/**
 * Gets the current day type for material farming schedule
 * @returns 'all' for Sunday, 0 for Mon/Thu, 1 for Tue/Fri, 2 for Wed/Sat
 */
export function getDayType(): DayType {
  const day = new Date().getDay();
  if (day === 0) return 'all'; // Sunday - all materials available
  if ([1, 4].includes(day)) return 0; // Mon/Thu
  if ([2, 5].includes(day)) return 1; // Tue/Fri
  return 2; // Wed/Sat
}

/**
 * Gets the current day name
 */
export function getCurrentDayName(): string {
  return DAY_NAMES[new Date().getDay()];
}

/**
 * Formats the current date as "Day, Month Date"
 * @example "Monday, February 11"
 */
export function getFormattedDate(): string {
  const now = new Date();
  const day = DAY_NAMES[now.getDay()];
  const month = MONTH_NAMES[now.getMonth()];
  const date = now.getDate();
  return `${day}, ${month} ${date}`;
}
