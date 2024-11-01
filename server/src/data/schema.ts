import {z} from "zod";

export const talentSchema = z.object({
    talentIcon: z.string(),
    talentName: z.string(),
    talentType: z.string(),
    description: z.string(),
    figureUrls: z.array(
        z.object({
            url: z.string(),
            caption: z.string(),
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
});

export const advancedCharacterSchema = baseCharacterSchema.extend({
    talents: z.array(talentSchema),
    constellations: z.array(constellationSchema),
    imageUrls: imageUrlsSchema,
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


export const talentDaySchema = z.object({
    day: z.string(),
    books: z.array(z.object({
        name: z.string(),
        url: z.string(),
    })),
    characters: z.array(z.object({
        name: z.string(),
        url: z.string(),
    })),
})