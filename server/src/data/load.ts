import path from "path";
import fs from "fs";
import {
  advancedCharacterSchema,
  baseCharacterSchema,
  characterFilterSchema,
  gallerySchema,
  talentDaySchema,
} from "./schema";
import { z } from "zod";

export const BASE_DIR = path.join(__dirname, "..", "..", "data");
export const CHARACTER_DIR = path.join(BASE_DIR, "characters");
const WEAPON_DIR = path.join(BASE_DIR, "weapons");

type BaseCharacter = z.infer<typeof baseCharacterSchema>;
type AdvancedCharacter = z.infer<typeof advancedCharacterSchema>;
type CharacterFilter = z.infer<typeof characterFilterSchema>;
type TalentDaySchema = z.infer<typeof talentDaySchema>;
type GallerySchema = z.infer<typeof gallerySchema>;

const characterMap: Record<string, AdvancedCharacter> = {};

/**
 * Loads all base characters from the characters.json file.
 * @returns An array of BaseCharacter objects.
 */
export function loadCharacters(): BaseCharacter[] {
  const filePath = path.join(CHARACTER_DIR, "characters.json");
  const file = fs.readFileSync(filePath, "utf8");
  const characters = JSON.parse(file);
  return characters.map((character: any) => {
    return baseCharacterSchema.parse(character);
  });
}

/**
 * Loads a specific character's advanced details from their individual JSON file.
 * @param name The name of the character to load.
 * @returns An AdvancedCharacter object if found, null otherwise.
 */
function loadCharacter(name: string): AdvancedCharacter | null {
  if (!name) return null;
  const snakeCaseName = name
    .split(" ")
    .map((word) => {
      return word[0].toUpperCase() + word.slice(1);
    })
    .join("_");
  const filePath = path.join(
    CHARACTER_DIR,
    "detailed",
    `${snakeCaseName}.json`
  );
  const file = fs.readFileSync(filePath, "utf8");
  const parsedCharacter = advancedCharacterSchema.parse(JSON.parse(file));
  return parsedCharacter;
}

/**
 * Retrieves a character's advanced details, either from cache or by loading from file.
 * @param name The name of the character to get.
 * @returns An AdvancedCharacter object if found, null otherwise.
 */
export function getCharacter(name: string): AdvancedCharacter | null {
  const parseName = name.split(" ").join("_");
  if (characterMap[parseName]) {
    return characterMap[parseName];
  }
  const character = loadCharacter(parseName);
  if (character) characterMap[parseName] = character;
  return character;
}

/**
 * An array of all base characters, loaded on module initialization.
 */
export const characters = loadCharacters();

/**
 * Filters characters based on the provided filter criteria.
 * @param filter An object containing filter criteria for character properties.
 * @returns An array of BaseCharacter objects that match the filter criteria.
 */
export function filterCharacters(filter: CharacterFilter): BaseCharacter[] {
  const parsedFilter = characterFilterSchema.parse(filter);
  return loadCharacters().filter((character) => {
    return Object.entries(parsedFilter).every(([key, value]) => {
      if (!value) return true;
      const characterValue = character[key as keyof BaseCharacter];
      return characterValue.toLowerCase().includes(value.toLowerCase());
    });
  });
}

export function loadDailyTalents(): Record<string, TalentDaySchema[]> {
  const filePath = path.join(BASE_DIR, "talents", "dailyTalents.json");
  const file = fs.readFileSync(filePath, "utf8");
  return JSON.parse(file);
}

export function loadGallery(): Record<string, GallerySchema> {
  const filePath = path.join(CHARACTER_DIR, "gallery.json");
  const file = fs.readFileSync(filePath, "utf8");
  const data = JSON.parse(file);

  Object.values(data).forEach((char) => {
    gallerySchema.safeParse(char);
  });
  return data;
}
