export type AnimationMedia = {
  imageUrl: string;
  videoUrl: string;
  caption: string;
  videoType: string;
  fallbackUrl?: string;
};

export type AttackAnimation = {
  normalAttack: AnimationMedia[];
  elementalSkill: AnimationMedia[];
  elementalBurst: AnimationMedia[];
};

export type Element =
  | 'pyro'
  | 'hydro'
  | 'anemo'
  | 'electro'
  | 'cryo'
  | 'geo'
  | 'dendro';

export type Nation =
  | 'Mondstadt'
  | 'Liyue'
  | 'Inazuma'
  | 'Sumeru'
  | 'Fontaine'
  | 'Natlan'
  | 'NodKrai';

export type WeaponType = 'sword' | 'claymore' | 'polearm' | 'bow' | 'catalyst';

export type AvatarRequirement = {
  name: string;
  iconUrl: string;
};

export type ImageUrl = {
  caption: string;
  url: string;
};

export type Day =
  | 'Monday'
  | 'Tuesday'
  | 'Wednesday'
  | 'Thursday'
  | 'Friday'
  | 'Saturday'
  | 'Sunday';

export type PrimitiveItem = {
  name: string;
  url: string;
};

export type Primitives = {
  elements: PrimitiveItem[];
  regions: PrimitiveItem[];
  weaponTypes: PrimitiveItem[];
};

export type CharacterMenuItem =
  | 'Profile'
  | 'Talents'
  | 'Constellations'
  | 'Passives'
  | 'Routine';

export type StickersData = Record<string, string[]>;

export interface GameSticker {
  url: string;
  characterName: string;
}

export interface MemoryTile {
  id: number;
  sticker: GameSticker;
  isFlipped: boolean;
  isMatched: boolean;
}

export interface MemoryGameStats {
  score: number;
  moves: number;
  matchesFound: number;
  exactMatches: number;
  characterMatches: number;
  startTime: number | null;
  endTime: number | null;
}

export type GameDifficulty = 'easy' | 'medium' | 'hard';
export type GameStatus = 'idle' | 'playing' | 'won';

export type { WeaponProfile as WeaponDetailedType } from '@/features/weapons/types';

// Calendar types re-exported for convenience
export type {
  TalentBookCalendar,
  WeaponMaterialSchedule,
} from '@/features/calendar';

// Character types re-exported for convenience
export type {
  ArtifactBuild,
  ArtifactLink,
  Character,
  CharacterBuild,
  CharacterBuildsData,
  CharacterDetailed,
  Constellation,
  ConstellationInfo,
  MainStats,
  Talent,
  TeamComp,
  WeaponOption,
  WeaponRecommendations,
} from '@/features/characters/types';

// Tracker types
export type {
  TrackedCharacter,
  TrackedTeam,
  TrackedWeapon,
  TrackerState,
  TrackingReason,
} from './tracker';

// Game content types (Spiral Abyss, Imaginarium Theater)
export type {
  AbyssChamber,
  AbyssChamberHalf,
  AbyssFloor,
  CharacterPriority,
  ImaginariumData,
  RecommendedCharacter,
  RecommendedTeam,
  SpiralAbyssBlessing,
  SpiralAbyssData,
  TheaterCharacter,
  TheaterElement,
} from './gameContent';
