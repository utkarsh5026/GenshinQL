import {
  BaseCharacterSchema,
  characterFilterSchema,
  GallerySchema,
  talentDaySchema,
  WeaponSchema,
  WeaponTypeSchema,
} from "./schema";
import { z } from "zod";
import {
  BASE_CHARACTERS_FILE,
  CHARACTER_DIR,
  GALLERY_FILE,
  loadLatestFileContents,
  TALENT_DIR,
  TALENT_FILE,
  WEAPONS_DETAILED_FILE,
  WEAPONS_DIR,
} from "./fileio";

type CharacterFilter = z.infer<typeof characterFilterSchema>;
type TalentDaySchema = z.infer<typeof talentDaySchema>;
type CharacterGalleryMap = Record<string, GallerySchema>;
type WeaponMap = Record<WeaponTypeSchema, WeaponSchema[]>;
type TalentMap = Record<string, TalentDaySchema[]>;

/**
 * Loads all base characters from the characters.json file.
 * @returns An array of BaseCharacterSchema objects.
 */
export function loadCharacters(): Promise<BaseCharacterSchema[] | null> {
  return loadLatestFileContents<BaseCharacterSchema[]>(
    CHARACTER_DIR,
    BASE_CHARACTERS_FILE,
  );
}

/**
 * Loads the gallery of characters from the gallery.json file.
 * @returns A CharacterGalleryMap object.
 */
export function loadCharactersGallery(): Promise<CharacterGalleryMap | null> {
  return loadLatestFileContents<CharacterGalleryMap>(
    CHARACTER_DIR,
    GALLERY_FILE,
  );
}

/**
 * Filters characters based on the provided filter criteria.
 * @param filter An object containing filter criteria for character properties.
 * @returns An array of BaseCharacter objects that match the filter criteria.
 */
export async function filterCharacters(
  filter: CharacterFilter,
): Promise<BaseCharacterSchema[] | null> {
  const parsedFilter = characterFilterSchema.parse(filter);
  return loadCharacters().then((characters) => {
    if (!characters) return null;
    return characters.filter((character) => {
      return Object.entries(parsedFilter).every(([key, value]) => {
        if (!value) return true;
        const characterValue = character[key as keyof BaseCharacterSchema];
        return characterValue.toLowerCase().includes(value.toLowerCase());
      });
    });
  });
}

/**
 * Loads the daily talent materials data from the dailyTalents.json file.
 * This data contains information about which talent materials are available
 * on which days for each region/nation.
 *
 * @returns A promise that resolves to a TalentMap object mapping region names to arrays of talent day data,
 * or null if the file cannot be loaded.
 */
export async function loadDailyTalents(): Promise<TalentMap | null> {
  return loadLatestFileContents<TalentMap>(TALENT_DIR, TALENT_FILE);
}

/**
 * Loads detailed weapon data from the weapons_detailed.json file.
 *
 * @returns A promise that resolves to a WeaponMap object mapping weapon types to weapon data,
 * or null if the file cannot be loaded.
 */
export async function loadWeapons(): Promise<WeaponMap | null> {
  return loadLatestFileContents<WeaponMap>(WEAPONS_DIR, WEAPONS_DETAILED_FILE);
}