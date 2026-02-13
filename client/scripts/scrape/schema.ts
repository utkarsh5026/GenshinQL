import { z } from 'zod';

export const talentSchema = z.object({
  talentIcon: z.string(),
  talentName: z.string(),
  talentType: z.string(),
  description: z.string(),
  figureUrls: z.array(
    z.object({
      url: z.string(),
      caption: z.string(),
      videoUrl: z.string().optional(), // Add video support
      videoType: z.string().optional(), // Add video type
    })
  ),
  scaling: z.record(z.string(), z.array(z.string())),
});

export const constellationSchema = z.object({
  name: z.string(),
  description: z.string(),
  level: z.number(),
  iconUrl: z.string(),
});

// Material used in a talent upgrade
export const upgradeMaterialSchema = z.object({
  name: z.string(), // "Mora", "Rich Red Brocade", etc.
  iconUrl: z.string(), // URL to icon image
  count: z.number(), // Amount needed for this level
  cumulative: z.number().optional(), // Total needed up to this level
});

// Single talent level upgrade (e.g., 7 → 8)
export const talentUpgradeSchema = z.object({
  levelRange: z.string(), // "7 → 8"
  requiredAscension: z.number().optional(), // 5 (from "5✦")
  materials: z.array(upgradeMaterialSchema),
});

// Version release/banner information
export const versionReleaseSchema = z.object({
  characters: z.array(z.string()), // Featured character names
  duration: z.string(), // "September 30, 2025 – October 21, 2025"
  version: z.string(), // "Luna I"
});

export const imageUrlsSchema = z.object({
  card: z.string(),
  wish: z.string(),
  inGame: z.string(),
  nameCard: z.string(),
});

export const baseCharacterSchema = z.object({
  name: z.string(),
  element: z.string(),
  rarity: z.string(),
  weaponType: z.string(),
  region: z.string(),
  iconUrl: z.string(),
  elementUrl: z.string(),
  weaponUrl: z.string(),
  regionUrl: z.string(),
  modelType: z.string(),
});

export const characterFilterSchema = z.object({
  name: z.string().optional(),
  element: z.string().optional(),
  rarity: z.string().optional(),
  weaponType: z.string().optional(),
  region: z.string().optional(),
});

export const weaponTypeSchema = z.union([
  z.literal('Sword'),
  z.literal('Claymore'),
  z.literal('Polearm'),
  z.literal('Catalyst'),
  z.literal('Bow'),
]);

export const talentDaySchema = z.object({
  day: z.string(),
  books: z.array(
    z.object({
      name: z.string(),
      url: z.string(),
    })
  ),
  characters: z.array(
    z.object({
      name: z.string(),
      url: z.string(),
    })
  ),
});

export const imageSchema = z.object({
  url: z.string(),
  caption: z.string(),
});

export const animationSchema = imageSchema.extend({
  videoUrl: z.string(),
  videoType: z.string(),
});

export const gallerySchema = z.object({
  screenAnimations: z.array(animationSchema),
  nameCards: z.array(imageSchema),
  attackAnimations: z.array(
    z.object({
      skill: z.union([
        z.literal('Normal_Attack'),
        z.literal('Elemental_Burst'),
        z.literal('Elemental_Skill'),
      ]),
      animations: z.array(animationSchema),
    })
  ),
  detailedImages: z.array(imageSchema).optional(),
  stickers: z.array(imageSchema).optional(),
});

export const advancedCharacterSchema = baseCharacterSchema.extend({
  talents: z.array(talentSchema),
  constellations: z.array(constellationSchema),
  talentUpgrades: z.array(talentUpgradeSchema),
  versionReleases: z.array(versionReleaseSchema).optional(),
  version: z.string(),
  gallery: gallerySchema.optional(),
  roles: z.array(z.string()).optional(), // ["On-Field", "Sub DPS"]
});

export const talentBookTypeSchema = z.union([
  z.literal('teaching'),
  z.literal('guide'),
  z.literal('philosophies'),
]);

export const ascensionMaterialSchema = z.object({
  url: z.string(),
  caption: z.string(),
  count: z.number(),
});

export const weaponAscensionPhaseSchema = z.object({
  phase: z.number(),
  levelRange: z.string(),
  baseAttack: z.object({
    min: z.number(),
    max: z.number(),
  }),
  subStat: z.object({
    min: z.number().optional(),
    max: z.number().optional(),
  }),
  mora: z.number().optional(),
  materials: z.array(ascensionMaterialSchema).optional(),
});

export const weaponAscensionDataSchema = z.object({
  phases: z.array(weaponAscensionPhaseSchema),
});

export const weaponSchema = z.object({
  name: z.string(),
  rarity: z.number(),
  attack: z.number(),
  iconUrl: z.string(),
  subStat: z.string(),
  effect: z.string(),
  materials: z.array(
    imageSchema.extend({
      count: z.number().optional(),
    })
  ),
  passives: z.array(z.string()),
  images: z.array(z.string()),
  ascension: weaponAscensionDataSchema.optional(),
});

export const weapMaterialSchema = z.object({
  day: z.string(),
  images: z.array(imageSchema),
  weapons: z.array(z.string()),
});

export const primitiveItemSchema = z.object({
  name: z.string(),
  url: z.string(),
});

export const characterRoleSchema = z.object({
  name: z.string(),
  iconUrl: z.string(),
});

export const primitivesSchema = z.object({
  elements: z.array(primitiveItemSchema),
  regions: z.array(primitiveItemSchema),
  weaponTypes: z.array(primitiveItemSchema),
  roles: z.array(characterRoleSchema).optional(),
});

export const artifactPieceTypeSchema = z.enum([
  'flower',
  'plume',
  'sands',
  'goblet',
  'circlet',
]);

export const artifactPieceSchema = z.object({
  type: artifactPieceTypeSchema,
  name: z.string(),
  iconUrl: z.string(),
});

export const artifactSetSchema = z.object({
  name: z.string(),
  pieces: z.array(artifactPieceSchema),
  twoPieceBonus: z.string(),
  fourPieceBonus: z.string(),
});

// Imaginarium Theater schemas
export const theaterCharacterSchema = z.object({
  name: z.string(),
  iconUrl: z.string(),
});

export const theaterElementSchema = z.object({
  name: z.string(),
  iconUrl: z.string(),
});

export const imaginariamTheaterSeasonSchema = z.object({
  seasonNumber: z.number(),
  dateRange: z.string(),
  versionName: z.string().optional(),
  openingCharacters: z.array(theaterCharacterSchema),
  theaterEffect: z.string(),
  elements: z.array(theaterElementSchema),
  specialGuestCharacters: z.array(theaterCharacterSchema),
});

export type WeaponMaterialSchema = z.infer<typeof weapMaterialSchema>;
export type ImageSchema = z.infer<typeof imageSchema>;
export type WeaponSchema = z.infer<typeof weaponSchema>;
export type GallerySchema = z.infer<typeof gallerySchema>;
export type GenshinImageSchema = z.infer<typeof imageSchema>;
export type AnimationSchema = z.infer<typeof animationSchema>;
export type BaseCharacterSchema = z.infer<typeof baseCharacterSchema>;
export type AdvancedCharacterSchema = z.infer<typeof advancedCharacterSchema>;
export type TalentBookTypeSchema = z.infer<typeof talentBookTypeSchema>;
export type WeaponTypeSchema = z.infer<typeof weaponTypeSchema>;
export type TalentDaySchema = z.infer<typeof talentDaySchema>;
export type ImageUrlsSchema = z.infer<typeof imageUrlsSchema>;
export type TalentSchema = z.infer<typeof talentSchema>;
export type ConstellationSchema = z.infer<typeof constellationSchema>;
export type PrimitiveItem = z.infer<typeof primitiveItemSchema>;
export type Primitives = z.infer<typeof primitivesSchema>;
export type UpgradeMaterial = z.infer<typeof upgradeMaterialSchema>;
export type TalentUpgrade = z.infer<typeof talentUpgradeSchema>;
export type VersionRelease = z.infer<typeof versionReleaseSchema>;
export type CharacterRole = z.infer<typeof characterRoleSchema>;
// Event Wish / Banner schemas
export const featuredCharacterSchema = z.object({
  name: z.string(),
  icon: z.string(),
  element: z.string().optional(),
  weaponType: z.string().optional(),
  rarity: z.number().min(1).max(5).optional(),
});

export const eventWishSchema = z.object({
  bannerName: z.string(),
  bannerUrl: z.string().url(),
  bannerImage: z.string(),
  phase: z.enum(['Phase I', 'Phase II']),
  duration: z.object({
    start: z.string(),
    end: z.string(),
  }),
  featuredCharacters: z.array(featuredCharacterSchema),
});

// New Weapon schema for version releases
export const newWeaponSchema = z.object({
  name: z.string(),
  showcaseImage: z.string(),
});

// Version Artifact schema (extends artifact set with showcase image)
export const versionArtifactSchema = artifactSetSchema.extend({
  showcaseImage: z.string(),
});

// Event Reward item (extracted from card containers)
export const eventRewardSchema = z.object({
  name: z.string(),
  icon: z.string(),
  count: z.number().optional(), // Some rewards may not have counts
});

// New Event schema
export const newEventSchema = z.object({
  name: z.string(),
  url: z.string().url(),
  images: z.array(z.string()), // All images from <aside> figures
  rewards: z.array(ascensionMaterialSchema),
});

export type TheaterCharacter = z.infer<typeof theaterCharacterSchema>;
export type TheaterElement = z.infer<typeof theaterElementSchema>;
export type ImaginariamTheaterSeason = z.infer<
  typeof imaginariamTheaterSeasonSchema
>;
export type FeaturedCharacter = z.infer<typeof featuredCharacterSchema>;
export type EventWish = z.infer<typeof eventWishSchema>;
export type NewWeapon = z.infer<typeof newWeaponSchema>;
export type VersionArtifact = z.infer<typeof versionArtifactSchema>;
export type EventReward = z.infer<typeof eventRewardSchema>;
export type NewEvent = z.infer<typeof newEventSchema>;

// Spiral Abyss schemas
export const spiralAbyssPhaseSchema = z.object({
  phase: z.number().min(1).max(2),
  updateDate: z.string(), // "January 16, 2026"
  floor11Disorders: z.array(z.string()),
  floor12Disorders: z.object({
    firstHalf: z.string(),
    secondHalf: z.string(),
  }),
  blessing: z.object({
    name: z.string(), // "Surgestrike Moon"
    description: z.string(),
  }),
});

export const spiralAbyssUpdateSchema = z.object({
  phases: z.array(spiralAbyssPhaseSchema),
});

export type SpiralAbyssPhase = z.infer<typeof spiralAbyssPhaseSchema>;
export type SpiralAbyssUpdate = z.infer<typeof spiralAbyssUpdateSchema>;

export const newAreaSchema = z.object({
  name: z.string(),
  url: z.string().url(),
  nationName: z.string(),
  areaImage: z.string().optional(),
  galleryImages: z.array(z.string()),
});

export type NewArea = z.infer<typeof newAreaSchema>;
