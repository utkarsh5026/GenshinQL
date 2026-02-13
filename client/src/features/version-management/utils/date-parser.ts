/**
 * Parses duration strings from version data into JavaScript Date objects.
 * Handles formats like:
 * - "January 14, 2026 11:00 GMT+8"
 * - "February 3, 2026 18:00 (Server Time)"
 *
 * Assumes "Server Time" refers to GMT+8 (Asia/Shanghai timezone).
 */
export function parseDurationString(dateStr: string): Date | null {
  try {
    const normalized = dateStr.replace(/\(Server Time\)/i, 'GMT+8').trim();
    const date = new Date(normalized);
    if (isNaN(date.getTime())) {
      console.warn('[date-parser] Invalid date string:', dateStr);
      return null;
    }

    return date;
  } catch (error) {
    console.error('[date-parser] Date parsing error:', dateStr, error);
    return null;
  }
}
