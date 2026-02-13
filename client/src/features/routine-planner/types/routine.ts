import type { TalentBook } from '@/features/calendar';
import type { WeaponSummary } from '@/features/weapons';
import type { Day, ImageUrl, TrackingReason } from '@/types';

/**
 * Enriched character with full tracking context for display
 */
export interface EnrichedCharacter {
  // Core character data
  name: string;
  iconUrl: string;
  rarity: number;
  weaponType: string;

  // Tracking context
  reason: TrackingReason;
  addedAt: number;
  notes?: string;

  // Relationships
  pairedWeapons: WeaponSummary[];
  teamId?: string;
  teamName?: string;
  teamIcon?: string;

  // Display helpers (pre-computed)
  reasonBadgeClass: string;
  reasonLabel: string;
}

/**
 * Group of characters needing the same talent book
 */
export interface TalentMaterialGroup {
  book: TalentBook;
  characters: EnrichedCharacter[];
}

/**
 * Character-weapon pair for weapon material display
 */
export interface CharacterWeaponPair {
  character: EnrichedCharacter;
  weapon: WeaponSummary;
}

/**
 * Group of character-weapon pairs needing the same weapon material
 */
export interface WeaponMaterialGroup {
  dayOne: string;
  dayTwo: string;
  materialImages: ImageUrl[];
  materialName: string; // Derived from first material caption
  characterWeaponPairs: CharacterWeaponPair[];
}

/**
 * Daily routine data with grouped materials
 */
export interface PlannerDailyRoutine {
  day: Day;
  isToday: boolean;
  talentGroups: TalentMaterialGroup[];
  weaponGroups: WeaponMaterialGroup[];
  totalCharacters: number; // Unique characters in this day
  totalWeapons: number; // Unique weapons in this day
  hasFarming: boolean; // Whether there's anything to farm
}

/**
 * Filter options for routine table
 */
export interface RoutineFilters {
  selectedDay: Day | 'all' | 'today';
  selectedReasons: Set<TrackingReason>;
  selectedTeam: string | 'all';
  sortBy: 'priority' | 'alphabetical';
}

/**
 * Sort direction
 */
export type SortDirection = 'asc' | 'desc';
