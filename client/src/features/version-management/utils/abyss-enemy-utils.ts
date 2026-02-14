/**
 * Parses a date string like "January 16, 2026 04:00 GMT+8" and returns
 * the filename format "spiral-abyss-2026-01-16.json"
 */
export function parseAbyssFilename(dateString: string): string | null {
  try {
    const match = dateString.match(/(\w+)\s+(\d+),\s+(\d{4})/);
    if (!match) return null;

    const [, monthName, day, year] = match;
    const monthMap: Record<string, string> = {
      January: '01',
      February: '02',
      March: '03',
      April: '04',
      May: '05',
      June: '06',
      July: '07',
      August: '08',
      September: '09',
      October: '10',
      November: '11',
      December: '12',
    };

    const month = monthMap[monthName];
    if (!month) return null;

    const paddedDay = day.padStart(2, '0');
    return `spiral-abyss-${year}-${month}-${paddedDay}.json`;
  } catch {
    return null;
  }
}
