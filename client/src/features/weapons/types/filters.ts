/**
 * Shared type definitions for weapon filtering components
 */

export interface WeaponFilterOption {
  name: string;
  url: string;
}

export interface WeaponFilterState {
  selectedWeaponTypes: string[];
  selectedRarities: number[];
  selectedSubstats: string[];
  searchQuery?: string;
}

export interface WeaponFilterCallbacks {
  onToggleWeaponType: (type: string) => void;
  onToggleRarity: (rarity: number) => void;
  onToggleSubstat: (substat: string) => void;
  onClearAll: () => void;
  onSearchChange?: (query: string) => void;
}

export interface WeaponFiltersCommonProps {
  selectedWeaponTypes: string[];
  selectedRarities: number[];
  selectedSubstats: string[];

  weaponTypes: WeaponFilterOption[];
  uniqueRarities: number[];
  uniqueSubstats: string[];

  onToggleWeaponType: (type: string) => void;
  onToggleRarity: (rarity: number) => void;
  onToggleSubstat: (substat: string) => void;
  onClearAll: () => void;
}
