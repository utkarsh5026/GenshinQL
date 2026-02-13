import type { ImageUrl } from '@/types';

export type AscensionMaterial = {
  url: string;
  caption: string;
  count: number;
};

export type AscensionPhase = {
  phase: number;
  levelRange: string;
  baseAttack: {
    min: number;
    max: number;
  };
  subStat: {
    min: number;
    max: number;
  };
  mora?: number;
  materials?: AscensionMaterial[];
};

export type WeaponProfile = {
  name: string;
  rarity: number;
  attack: number;
  subStat: string;
  effect: string;
  iconUrl: string;
  nation: number;
  weekdays: number;
  materials: ImageUrl[];
  passives: string[];
  images: string[];
  ascension: {
    phases: AscensionPhase[];
  };
};

export type StatComparison = {
  currentMin: number;
  currentMax: number;
  fromPreviousPhase: number;
  fromPhaseZero: number;
  progressPercent: number;
};

export type WeaponAscensionPhaseStats = AscensionPhase & {
  atkStats: StatComparison;
  subStats: StatComparison;
};
