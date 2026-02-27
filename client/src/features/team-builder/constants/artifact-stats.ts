/** Main stat options for the Sands (Timepiece) artifact slot */
export const SANDS_MAIN_STATS: string[] = ['ATK%', 'DEF%', 'HP%', 'ER%', 'EM'];

/** Main stat options for the Goblet (Chalice) artifact slot */
export const GOBLET_MAIN_STATS: string[] = [
  'ATK%',
  'DEF%',
  'HP%',
  'EM',
  'Pyro DMG%',
  'Hydro DMG%',
  'Cryo DMG%',
  'Electro DMG%',
  'Anemo DMG%',
  'Geo DMG%',
  'Dendro DMG%',
  'Physical DMG%',
] as const;

/** Main stat options for the Circlet (Crown) artifact slot */
export const CIRCLET_MAIN_STATS: string[] = [
  'ATK%',
  'DEF%',
  'HP%',
  'EM',
  'CRIT Rate%',
  'CRIT DMG%',
  'Healing Bonus%',
];

/** Priority order for substat display — lower value = higher priority. */
export const SUBSTAT_PRIORITY: Record<string, number> = {
  'CRIT Rate%': 0,
  'CRIT DMG%': 1,
  'ATK%': 2,
  ATK: 3,
  EM: 4,
  'ER%': 5,
  'HP%': 6,
  HP: 7,
  'DEF%': 8,
  DEF: 9,
};

/** Common substat options for artifact configuration, ordered by priority. */
export const SUBSTAT_OPTIONS: string[] = [
  'CRIT Rate%',
  'CRIT DMG%',
  'ATK%',
  'ATK',
  'EM',
  'ER%',
  'HP%',
  'HP',
  'DEF%',
  'DEF',
];
