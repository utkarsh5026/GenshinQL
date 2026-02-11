import type { Day, Element, Nation, WeaponType } from '@/types';

export * from './filePaths';

// ============================================================================
// Time Constants
// ============================================================================

export const DAYS_OF_WEEK: Day[] = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
] as const;

// ============================================================================
// Game Elements
// ============================================================================

export const ELEMENTS: Element[] = [
  'pyro',
  'hydro',
  'anemo',
  'electro',
  'cryo',
  'geo',
  'dendro',
] as const;

// ============================================================================
// Weapon Types
// ============================================================================

export const WEAPON_TYPES: WeaponType[] = [
  'sword',
  'claymore',
  'polearm',
  'bow',
  'catalyst',
] as const;

// ============================================================================
// Nations/Regions
// ============================================================================

export const NATIONS: Nation[] = [
  'Mondstadt',
  'Liyue',
  'Inazuma',
  'Sumeru',
  'Fontaine',
  'Natlan',
  'NodKrai',
] as const;

// ============================================================================
// Rarity
// ============================================================================

export const RARITIES = [1, 2, 3, 4, 5] as const;
export const CHARACTER_RARITIES = [4, 5] as const;
export const WEAPON_RARITIES = [1, 2, 3, 4, 5] as const;

// ============================================================================
// Artifact Constants
// ============================================================================

export const ARTIFACT_SLOTS = [
  'Flower',
  'Plume',
  'Sands',
  'Goblet',
  'Circlet',
] as const;

export type ArtifactSlot = (typeof ARTIFACT_SLOTS)[number];

export const ARTIFACT_MAIN_STATS = {
  Flower: ['HP'],
  Plume: ['ATK'],
  Sands: ['HP%', 'ATK%', 'DEF%', 'Energy Recharge%', 'Elemental Mastery'],
  Goblet: [
    'HP%',
    'ATK%',
    'DEF%',
    'Elemental Mastery',
    'Pyro DMG Bonus%',
    'Hydro DMG Bonus%',
    'Anemo DMG Bonus%',
    'Electro DMG Bonus%',
    'Cryo DMG Bonus%',
    'Geo DMG Bonus%',
    'Dendro DMG Bonus%',
    'Physical DMG Bonus%',
  ],
  Circlet: [
    'HP%',
    'ATK%',
    'DEF%',
    'Elemental Mastery',
    'CRIT Rate%',
    'CRIT DMG%',
    'Healing Bonus%',
  ],
} as const;

export const ARTIFACT_SUB_STATS = [
  'HP',
  'HP%',
  'ATK',
  'ATK%',
  'DEF',
  'DEF%',
  'Energy Recharge%',
  'Elemental Mastery',
  'CRIT Rate%',
  'CRIT DMG%',
] as const;

// ============================================================================
// Stat Types
// ============================================================================

export const STAT_TYPES = {
  // Base Stats
  HP: 'HP',
  HP_PERCENT: 'HP%',
  ATK: 'ATK',
  ATK_PERCENT: 'ATK%',
  DEF: 'DEF',
  DEF_PERCENT: 'DEF%',

  // Elemental Stats
  ELEMENTAL_MASTERY: 'Elemental Mastery',
  ENERGY_RECHARGE: 'Energy Recharge%',

  // Crit Stats
  CRIT_RATE: 'CRIT Rate%',
  CRIT_DMG: 'CRIT DMG%',

  // Damage Bonus
  PYRO_DMG: 'Pyro DMG Bonus%',
  HYDRO_DMG: 'Hydro DMG Bonus%',
  ANEMO_DMG: 'Anemo DMG Bonus%',
  ELECTRO_DMG: 'Electro DMG Bonus%',
  CRYO_DMG: 'Cryo DMG Bonus%',
  GEO_DMG: 'Geo DMG Bonus%',
  DENDRO_DMG: 'Dendro DMG Bonus%',
  PHYSICAL_DMG: 'Physical DMG Bonus%',

  // Other
  HEALING_BONUS: 'Healing Bonus%',
} as const;

export const DAMAGE_BONUS_STATS = [
  'Pyro DMG Bonus%',
  'Hydro DMG Bonus%',
  'Anemo DMG Bonus%',
  'Electro DMG Bonus%',
  'Cryo DMG Bonus%',
  'Geo DMG Bonus%',
  'Dendro DMG Bonus%',
  'Physical DMG Bonus%',
] as const;

// ============================================================================
// Character Constants
// ============================================================================

export const BODY_TYPES = [
  'Male - Tall',
  'Male - Medium',
  'Male - Short',
  'Female - Tall',
  'Female - Medium',
  'Female - Short',
] as const;

// ============================================================================
// Ascension Constants
// ============================================================================

export const ASCENSION_LEVELS = [0, 1, 2, 3, 4, 5, 6] as const;
export const MAX_CHARACTER_LEVEL = 90;
export const MAX_WEAPON_LEVEL = 90;
export const MAX_TALENT_LEVEL = 10;
export const MAX_CONSTELLATION = 6;

// ============================================================================
// Material Farming Days
// ============================================================================

export const TALENT_BOOK_DAYS = {
  'Monday/Thursday': ['Monday', 'Thursday'],
  'Tuesday/Friday': ['Tuesday', 'Friday'],
  'Wednesday/Saturday': ['Wednesday', 'Saturday'],
  Sunday: ['Sunday'],
} as const;

export const WEAPON_MATERIAL_DAYS = {
  'Monday/Thursday': ['Monday', 'Thursday'],
  'Tuesday/Friday': ['Tuesday', 'Friday'],
  'Wednesday/Saturday': ['Wednesday', 'Saturday'],
  Sunday: ['Sunday'],
} as const;

// ============================================================================
// Resin Constants
// ============================================================================

export const RESIN = {
  MAX: 200,
  REGEN_RATE_MINUTES: 8, // 1 resin per 8 minutes
  CONDENSED_MAX: 5,
  CONDENSED_COST: 40,
  DOMAIN_COST: 20,
  BOSS_COST: 40,
  WEEKLY_BOSS_COST: 30,
  LEYLINE_COST: 20,
} as const;
