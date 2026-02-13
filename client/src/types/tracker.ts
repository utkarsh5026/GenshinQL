/**
 * Types for user tracking of characters and weapons they are building
 */

export type TrackingReason = 'building' | 'farming' | 'wishlist';

export interface TrackedCharacter {
  name: string;
  reason: TrackingReason;
  addedAt: number; // timestamp
  notes?: string;
  pairedWeapons: string[]; // Multiple weapons array
  teamId?: string; // Optional team association
  // Deprecated: kept for migration
  pairedWeapon?: string;
}

export interface TrackedWeapon {
  name: string;
  reason: TrackingReason;
  addedAt: number; // timestamp
  targetCharacter?: string; // which character this weapon is for
  notes?: string;
}

export interface TrackedTeam {
  id: string; // UUID
  name: string;
  characters: string[]; // Character names
  icon: string; // Icon identifier (e.g., 'sword', 'shield', 'star', 'flame', 'water')
  createdAt: number;
  notes?: string;
}

export interface TrackerState {
  trackedCharacters: TrackedCharacter[];
  trackedWeapons: TrackedWeapon[];
  teams: TrackedTeam[];
}
