/**
 * Centralized file path constants for data fetching
 */

export const DATA_BASE_URL = '/';

/**
 * Static data file names
 */
export const DATA_FILES = {
  PRIMITIVES: 'primitives.json',
  CHARACTERS: 'characters.json',
  DAILY_TALENTS: 'dailyTalents.json',
  WEAPONS: 'weapons.json',
  WEAPON_CALENDAR: 'weaponCalendar.json',
  GALLERY: 'gallery.json',
  CHARACTER_BUILDS: 'characterBuilds.json',
} as const;

/**
 * Dynamic data file paths (require parameters)
 */
export const DATA_PATHS = {
  /**
   * Get path to individual character JSON file
   */
  character: (name: string) => `${DATA_BASE_URL}characters/${name}.json`,

  /**
   * Get path to individual weapon JSON file
   */
  weapon: (fileName: string) => `${DATA_BASE_URL}weapons/${fileName}.json`,
} as const;

/**
 * Helper to construct full URL for static data files
 */
export const getDataFileUrl = (fileName: string) =>
  `${DATA_BASE_URL}${fileName}`;
