import { WeaponSummary } from '@/features/weapons';
import { Character } from '@/types';
/**
 * Configuration for a single tier in the tierlist
 */
export interface TierConfig {
  id: string; // UUID for stable identity across renames
  name: string; // Display name (S, A, B, etc.)
  color: string; // Hex color (#ef4444)
  order: number; // Sort order (0-indexed, lower = higher in UI)
}

/**
 * Base state structure for tierlists
 */
export interface TierListState<T> {
  tiers: TierConfig[];
  tierAssignments: Record<string, string[]>; // tier.id -> item.name[]
  unassignedPool: T[]; // Items not yet placed in tiers
  version: number; // For future schema migrations
  lastUpdated: number; // Timestamp of last modification
}

/**
 * Character-specific tierlist state
 */
export type CharacterTierListState = TierListState<Character>;

/**
 * Weapon-specific tierlist state
 */
export type WeaponTierListState = TierListState<WeaponSummary>;
