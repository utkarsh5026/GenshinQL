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
});

export const advancedCharacterSchema = baseCharacterSchema.extend({
  talents: z.array(talentSchema),
  constellations: z.array(constellationSchema),
});
