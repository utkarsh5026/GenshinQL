export interface VersionCharacter {
  name: string;
  icon: string;
  description: string;
  rarity?: string;
  element?: string;
  weaponType?: string;
}

export interface VersionWeapon {
  name: string;
  showcaseImage: string;
}

export interface ArtifactPiece {
  type: 'flower' | 'plume' | 'sands' | 'goblet' | 'circlet';
  name: string;
  iconUrl: string;
}

export interface VersionArtifact {
  name: string;
  pieces: ArtifactPiece[];
  twoPieceBonus: string;
  fourPieceBonus: string;
  showcaseImage: string;
}

export interface FeaturedCharacter {
  name: string;
  icon: string;
  element?: string;
  weaponType?: string;
  rarity?: number;
}

export interface EventWish {
  bannerName: string;
  bannerUrl: string;
  bannerImage: string;
  phase: 'Phase I' | 'Phase II';
  duration: {
    start: string;
    end: string;
  };
  featuredCharacters: FeaturedCharacter[];
}

export interface EventReward {
  url: string;
  caption: string;
  count: number;
}

export interface VersionEvent {
  name: string;
  url: string;
  images: string[];
  rewards: EventReward[];
}

export interface NewArea {
  name: string;
  url: string;
  nationName: string;
  areaImage?: string;
  galleryImages: string[];
}

export interface SpiralAbyssPhase {
  phase: number;
  updateDate: string;
  floor11Disorders: string[];
  floor12Disorders: {
    firstHalf: string;
    secondHalf: string;
  };
  blessing: {
    name: string;
    description: string;
  };
}

export interface SpiralAbyssUpdate {
  phases: SpiralAbyssPhase[];
}

export interface GalleryImage {
  url: string;
  caption: string;
}

export interface VersionData {
  newCharacters: VersionCharacter[];
  newWeapons: VersionWeapon[];
  newArtifacts: VersionArtifact[];
  eventWishes: EventWish[];
  newEvents: VersionEvent[];
  newAreas: NewArea[];
  spiralAbyss: SpiralAbyssUpdate | null;
  gallery: GalleryImage[];
}

export interface VersionMeta {
  version: string;
  name: string;
  theme: string;
}
