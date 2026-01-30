/**
 * Returns the current day of the week as a string
 * @returns {string} Current day (e.g. "Monday", "Tuesday", etc.)
 */
export const getCurrentDay = (): string => {
  const days = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ];
  const dayIndex = new Date().getDay();
  return days[dayIndex];
};
