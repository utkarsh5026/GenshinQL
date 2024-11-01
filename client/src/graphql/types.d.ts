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
};

type TalentScale = {
  key: string;
  value: string[];
}

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