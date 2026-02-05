import type { LucideIcon } from 'lucide-react';

export type SearchResultType = 'navigation' | 'character' | 'weapon';

export interface NavigationItem {
  type: 'navigation';
  route: string;
  label: string;
  icon: LucideIcon;
  iconColor: string;
}

export interface CharacterResult {
  type: 'character';
  name: string;
  iconUrl: string;
  rarity: number;
  element: string;
  weaponType: string;
}

export interface WeaponResult {
  type: 'weapon';
  name: string;
  iconUrl: string;
  rarity: number;
  weaponType: string;
}

export type SearchResult = NavigationItem | CharacterResult | WeaponResult;

// Serializable version for localStorage (without React components)
export interface RecentItem {
  type: SearchResultType;
  name: string;
  route: string;
  iconUrl?: string;
  rarity?: number;
  element?: string;
  weaponType?: string;
  // For navigation items
  label?: string;
  iconName?: string;
  iconColor?: string;
  timestamp: number;
}
