/**
 * Types for game content data (Spiral Abyss, Imaginarium Theater)
 */

export type CharacterPriority = 'S' | 'A' | 'B' | 'C';

// Spiral Abyss types
export interface SpiralAbyssBlessing {
  name: string;
  description: string;
  iconUrl?: string;
}

export interface AbyssChamberHalf {
  enemies: string[];
  tips?: string;
}

export interface AbyssChamber {
  chamber: number;
  firstHalf: AbyssChamberHalf;
  secondHalf: AbyssChamberHalf;
}

export interface AbyssFloor {
  floor: number;
  chambers: AbyssChamber[];
}

export interface RecommendedCharacter {
  name: string;
  role: string;
  priority: CharacterPriority;
  reason?: string;
  element?: string;
  isSpecialGuest?: boolean;
}

export interface RecommendedTeam {
  name: string;
  characters: string[];
  description?: string;
}

export interface SpiralAbyssData {
  version: string;
  phase: number;
  lastUpdated: string;
  blessing: SpiralAbyssBlessing;
  floors: AbyssFloor[];
  recommendedCharacters: RecommendedCharacter[];
  recommendedTeams: RecommendedTeam[];
}

// Imaginarium Theater types
export interface TheaterCharacter {
  name: string;
  iconUrl: string;
}

export interface TheaterElement {
  name: string;
  iconUrl: string;
}

export interface ImaginariumData {
  seasonNumber: number;
  dateRange: string;
  versionName?: string;
  openingCharacters: TheaterCharacter[];
  theaterEffect: string;
  elements: TheaterElement[];
  specialGuestCharacters: TheaterCharacter[];
}
