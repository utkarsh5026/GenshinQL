export type Character = {
  name: string;
  iconUrl: string;
  rarity: string;
  element: string;
  weaponType: string;
  region: string;
  elementUrl: string;
  weaponUrl: string;
  regionUrl: string;
  modelType: string;
  version?: string;
  idleOne?: AnimationMedia;
  idleTwo?: AnimationMedia;
  partyJoin?: AnimationMedia;
};

type TalentScale = {
  key: string;
  value: string[];
};

export type Talent = {
  talentName: string;
  talentIcon: string;
  talentType: AttackTalentType;
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
};

export type TalentBookCalendar = {
  location: string;
  days: {
    day: string;
    books: {
      name: string;
      url: string;
    }[];
    characters: {
      name: string;
      url: string;
    }[];
  }[];
};

export type Weapon = {
  name: string;
  iconUrl: string;
  attack: number;
  rarity: number;
  subStat: string;
  effect: string;
  nation?: number; // index to nations array (-1 if not applicable)
  weekdays?: number; // index to days array (-1 if not applicable)
};

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

export type WeaponDetailedType = {
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

export type ScreenAnimation = {
  idleOne?: AnimationMedia;
  idleTwo?: AnimationMedia;
  partySetup?: AnimationMedia;
};

type NameCardAnimation = {
  background: string;
  icon: string;
};

export type CharacterGallery = {
  attackAnimation: AttackAnimation;
  screenAnimation: ScreenAnimation;
  nameCard: NameCardAnimation;
};

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

export type AttackTalentType =
  | 'Normal Attack'
  | 'Elemental Skill'
  | 'Elemental Burst';

export type OtherTalentType =
  | '1st Ascension Passive'
  | '4th Ascension Passive'
  | 'Utility Passive';

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

export type WeaponMaterialSchedule = {
  nation: string;
  materials: {
    day: string;
    materialImages: ImageUrl[];
    weapons: Weapon[];
  }[];
};

export type WeaponMaterial = {
  day: string;
  materialImages: ImageUrl[];
};

// Raw types for JSON structure (before transformation)
export type GalleryRaw = {
  screenAnimations: {
    url: string;
    caption: string;
    videoUrl: string;
    videoType: string;
  }[];
  nameCards: {
    url: string;
    caption: string;
  }[];
  attackAnimations: {
    skill: 'Normal_Attack' | 'Elemental_Burst' | 'Elemental_Skill';
    animations: {
      url: string;
      caption: string;
      videoUrl: string;
      videoType: string;
    }[];
  }[];
  detailedImages?: { url: string; caption: string }[];
  stickers?: { url: string; caption: string }[];
};

export type TalentRaw = {
  talentName: string;
  talentIcon: string;
  talentType: string;
  description: string;
  figureUrls: {
    url: string;
    caption: string;
    videoUrl?: string;
    videoType?: string;
  }[];
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
};

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

// Memory Game Types
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
