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
  version: string;
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
  level: string;
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
  type: string;
  subStat: string;
  effect: string;
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

type CharacterGallery = {
  attackAnimation: AttackAnimation;
  screenAnimation: ScreenAnimation;
  nameCard: NameCardAnimation;
};

export type AnimationMedia = {
  imageUrl: string;
  videoUrl: string;
  caption: string;
  videoType: string;
};

export type AttackAnimation = {
  normalAttack: AnimationMedia[];
  elementalSkill: AnimationMedia[];
  elementalBurst: AnimationMedia[];
};

export type AttackTalentType =
  | "Normal Attack"
  | "Elemental Skill"
  | "Elemental Burst";

export type OtherTalentType =
  | "1st Ascension Passive"
  | "4th Ascension Passive"
  | "Utility Passive";

export type AvatarRequirement = {
  name: string;
  iconUrl: string;
};

export type ImageUrl = {
  caption: string;
  url: string;
};

export type Day =
  | "Monday"
  | "Tuesday"
  | "Wednesday"
  | "Thursday"
  | "Friday"
  | "Saturday"
  | "Sunday";

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
