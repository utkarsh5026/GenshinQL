/* Export all types from home feature */
import type { ImageUrl } from '@/types';

import type { DayType } from '../utils';

/**
 * Character or weapon item with tracking status
 */
export interface MaterialItem {
  name: string;
  url: string;
  isTracked: boolean;
}

/**
 * Talent book reference
 */
export interface TalentBookItem {
  name: string;
  url: string;
}

/**
 * Talent materials grouped by region for today's farming
 */
export interface TalentMaterialsByRegion {
  region: string; // e.g., "Mondstadt"
  regionIconUrl?: string; // Region icon URL
  books: TalentBookItem[]; // Available talent books
  characters: MaterialItem[]; // Characters needing these books
}

/**
 * Weapon materials grouped by nation for today's farming
 */
export interface WeaponMaterialsByNation {
  nation: string; // e.g., "Mondstadt"
  nationIconUrl?: string; // Nation icon URL
  materials: ImageUrl[]; // Material item images
  weapons: MaterialItem[]; // Weapons needing these materials
}

/**
 * Complete today's calendar data with farming materials
 */
export interface TodayCalendarData {
  // Day context
  dayType: DayType; // 0 | 1 | 2 | 'all'
  currentDay: string; // "Monday", "Tuesday", etc.
  isSunday: boolean; // True if all materials available

  // Filtered materials for today
  talentMaterials: TalentMaterialsByRegion[];
  weaponMaterials: WeaponMaterialsByNation[];

  // Utility mapping
  regionUrlMap: Record<string, string>; // Region name → icon URL
}
