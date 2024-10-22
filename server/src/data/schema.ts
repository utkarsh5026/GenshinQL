import { z } from "zod";

export const talentSchema = z.object({
  name: z.string(),
  type: z.string(),
  description: z.string(),
});

export const constellationSchema = z.object({
  name: z.string(),
  description: z.string(),
  level: z.number(),
});

export const baseCharacterSchema = z.object({
  name: z.string(),
  element: z.string(),
  rarity: z.string(),
  weaponType: z.string(),
  region: z.string(),
  iconUrl: z.string(),
  elementUrl: z.string(),
});

export const advancedCharacterSchema = baseCharacterSchema
  .omit({
    iconUrl: true,
  })
  .extend({
    talents: z.array(talentSchema),
    constellations: z.array(constellationSchema),
  });

export const characterFilterSchema = z.object({
  name: z.string().optional(),
  element: z.string().optional(),
  rarity: z.string().optional(),
  weaponType: z.string().optional(),
  region: z.string().optional(),
});

export const weaponTypeSchema = z.union([
  z.literal("Sword"),
  z.literal("Claymore"),
  z.literal("Polearm"),
  z.literal("Catalyst"),
  z.literal("Bow"),
]);
