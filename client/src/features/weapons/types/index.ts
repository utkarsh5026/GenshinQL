/* Export all types from weapons feature */
import type { ImageUrl } from '@/types';

export * from './filters';
export * from './weapon-profile';

export type WeaponRaw = {
  name: string;
  iconUrl: string;
  attack: number;
  rarity: number;
  subStat: string;
  effect: string;
  nation?: number; // index to nations array (-1 if not applicable)
  weekdays?: number; // index to days array (-1 if not applicable)
};

export type WeaponSummary = Omit<WeaponRaw, 'nation' | 'weekdays'> & {
  nation: string;
  weekday: string;
  weaponType: string;
};

export type WeaponMaterial = {
  dayOne: string;
  dayTwo: string;
  materialImages: ImageUrl[];
};

export type WeaponWithMaterial = WeaponSummary & {
  materialSchedule: WeaponMaterial;
};

export type NationWeaponSchedule = {
  nation: string;
  materials: {
    day: string;
    materialImages: ImageUrl[];
    weapons: WeaponRaw[];
  }[];
};

export type SubstatType =
  | 'CRIT Rate'
  | 'CRIT DMG'
  | 'ATK'
  | 'HP'
  | 'DEF'
  | 'Energy Recharge'
  | 'Elemental Mastery'
  | 'Physical DMG Bonus'
  | 'None';

export type WeaponTier = 'high-atk' | 'balanced' | 'high-substat';
