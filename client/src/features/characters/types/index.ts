/* Export all types from characters feature */
import { AnimationMedia, ImageUrl } from '@/types';

import type { CharacterBuild } from './build';
export type GIFWithVideo = {
  url: string;
  caption: string;
  videoUrl?: string;
  videoType?: string;
};

export type ScreenAnimation = {
  idleOne?: AnimationMedia;
  idleTwo?: AnimationMedia;
  partySetup?: AnimationMedia;
};

export type AttackAnimation = {
  normalAttack: AnimationMedia[];
  elementalSkill: AnimationMedia[];
  elementalBurst: AnimationMedia[];
};

export type Character = {
  name: string;
  iconUrl: string;
  rarity: string;
  element: string;
  weaponType: string;
  region: string;
  /** Element icon URL - populated at runtime from primitives.json */
  elementUrl: string;
  /** Weapon type icon URL - populated at runtime from primitives.json */
  weaponUrl: string;
  /** Region icon URL - populated at runtime from primitives.json */
  regionUrl: string;
  /** Namecard background URL - from character's nameCards gallery */
  namecardURL?: string;
  modelType: string;
  version?: string;
  idleOne?: AnimationMedia;
  idleTwo?: AnimationMedia;
  partyJoin?: AnimationMedia;
};

export type GalleryRaw = {
  screenAnimations: GIFWithVideo[];
  nameCards: ImageUrl[];
  attackAnimations: {
    skill: 'Normal_Attack' | 'Elemental_Burst' | 'Elemental_Skill';
    animations: GIFWithVideo[];
  }[];
  detailedImages?: ImageUrl[];
  stickers?: ImageUrl[];
};

export type TalentRaw = {
  talentName: string;
  talentIcon: string;
  talentType: string;
  description: string;
  figureUrls: GIFWithVideo[];
  scaling: Record<string, string[]>; // Object in JSON
};

export type CharacterRaw = Character & {
  talents: TalentRaw[];
  constellations: {
    iconUrl: string;
    name: string;
    description: string;
    level: number;
  }[];
  imageUrls: {
    card: string;
    wish: string;
    inGame: string;
    nameCard: string;
  };
  version?: string;
  gallery?: GalleryRaw;
  buildGuide?: CharacterBuild;
};

type TalentScale = {
  key: string;
  value: string[];
};

export type CharacterDetailed = Character & {
  talents: Talent[];
  constellations: Constellation[];
  imageUrls: {
    card: string;
    wish: string;
    inGame: string;
    nameCard: string;
  };
  screenAnimation: ScreenAnimation;
  gallery?: GalleryRaw;
  buildGuide?: CharacterBuild;
  attackAnimations?: AttackAnimation;
};

export type AttackTalentType =
  | 'Normal Attack'
  | 'Elemental Skill'
  | 'Elemental Burst';

export type OtherTalentType =
  | '1st Ascension Passive'
  | '4th Ascension Passive'
  | 'Utility Passive';

export type Talent = {
  talentName: string;
  talentIcon: string;
  talentType: AttackTalentType | OtherTalentType;
  description: string;
  figureUrls: {
    url: string;
    caption: string;
  }[];
  scaling: TalentScale[];
};

export type Constellation = {
  iconUrl: string;
  name: string;
  description: string;
  level: number;
};

/* Character build types */
export type {
  ArtifactBuild,
  ArtifactLink,
  CharacterBuild,
  CharacterBuildsData,
  ConstellationInfo,
  MainStats,
  TeamComp,
  WeaponOption,
  WeaponRecommendations,
} from './build';

export type CharacterMenuItem =
  | 'Profile'
  | 'Talents'
  | 'Constellations'
  | 'Passives'
  | 'Routine'
  | 'Builds';
