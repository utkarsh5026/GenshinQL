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
  talentType: string;
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
  rarity: string;
  type: string;
  subStat: string;
};

type ScreenAnimation = {
  idleOne?: string;
  idleTwo?: string;
  partyJoin: string;
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
