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
      videoUrl: z.string().optional(),   // Add video support
      videoType: z.string().optional(),   // Add video type
    })
  ),
  scaling: z.record(z.array(z.string())),
});

export const constellationSchema = z.object({
  name: z.string(),
  description: z.string(),
  level: z.number(),
  iconUrl: z.string(),
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
  version: z.string().optional(),
  gallery: gallerySchema.optional(),  // Add gallery to character JSON
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

export const primitivesSchema = z.object({
  elements: z.array(primitiveItemSchema),
  regions: z.array(primitiveItemSchema),
  weaponTypes: z.array(primitiveItemSchema),
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
