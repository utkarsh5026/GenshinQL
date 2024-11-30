/**
 * Scrapes newly released characters from the game wiki and saves them to the database.
 * and update and add all the necessary JSON files.
 * use this to add newly released characters. 😊😊
 */
import { WebDriver } from "selenium-webdriver";
import {
  scrapeCharactersInDetail,
  scrapeCharacterTable,
} from "../data/characters";
import { setupDriver } from "../data/setup";
import Character from "../db/models/Character";
import { repo } from "../db/utils";
import { initDb } from "../db/init";
import { getCharacterGalleryImages } from "../data/gallery";
import {
  BaseCharacterSchema,
  GallerySchema,
  TalentDaySchema,
} from "../data/schema";
import {
  CHARACTER_DIR,
  GALLERY_FILE,
  saveFile,
  saveFileWithNewVersion,
  TALENT_DIR,
  TALENT_FILE,
} from "../data/fileio";
import { findTalentsForRegion } from "../data/talents";
import { TALENT_URL } from "../data/urls";
import { parseCharacterName } from "../data/utils";

/**
 * Main pipeline for processing new Genshin Impact characters.
 *
 * The pipeline handles the complete workflow of adding new characters,
 * from initial scraping to saving all required data.
 *
 * @throws Error if scraping or data processing fails
 */
async function newCharactersPipeline() {
  const driver = await setupDriver();
  const newCharacters = (await getNewCharacters()).map((char) => ({
    ...char,
    name: parseCharacterName(char.name),
  }));

  console.log(`Found ${newCharacters.length} new characters`);
  console.dir(newCharacters, { depth: null, colors: true });

  try {
    await scrapeCharactersInDetail(driver, newCharacters);
    await updateTalents(newCharacters);
    await saveCharactersGallery(newCharacters);
  } catch (error) {
    console.error("Error scraping character details:", error);
  } finally {
    await driver.quit();
  }
}

/**
 * Scrapes and saves gallery images for new characters.
 *
 * @param driver - Selenium WebDriver instance for web scraping
 * @param characters - Array of base character data to get gallery images for
 * @returns Promise that resolves when gallery data is saved
 * @throws Error if scraping or saving fails
 */
async function saveCharactersGallery(characters: BaseCharacterSchema[]) {
  const driver = await setupDriver();

  try {
    const galleries: Record<string, GallerySchema> = {};
    for (const char of characters) {
      galleries[char.name] = await getCharacterGalleryImages(driver, char.name);
    }
    await saveFile(galleries, CHARACTER_DIR, GALLERY_FILE, false);
  } finally {
    await driver.quit();
  }
}

/**
 * Retrieves new characters that don't exist in the database yet.
 *
 * This function:
 * 1. Scrapes the character table from the game wiki
 * 2. Queries existing characters from the database
 * 3. Filters out characters that already exist in the database
 *
 * @returns Array of Character objects that are not yet in the database
 * @throws Error if no characters are found during scraping
 */
const getNewCharacters = async (): Promise<BaseCharacterSchema[]> => {
  const driver = await setupDriver();
  try {
    console.log("Scraping character table");
    const characters = await scrapeCharacterTable(driver);
    if (!characters) throw new Error("No characters found");

    await saveFileWithNewVersion(characters, CHARACTER_DIR, "baseCharacters");
    const existingCharacters = await repo(Character).find();

    return characters.filter(
      (character) =>
        !existingCharacters.some((existing) => existing.name === character.name)
    );
  } finally {
    await driver.quit();
  }
};

/**
 * Updates talent information for characters from specified regions.
 *
 * @param characters - Array of base character data to get talent info for
 * @returns Promise that resolves when talent data is updated and saved
 * @throws Error if scraping or saving fails
 */
async function updateTalents(characters: BaseCharacterSchema[]) {
  const driver = await setupDriver();

  try {
    await driver.get(TALENT_URL);
    const nations = new Set(characters.map((char) => char.region));
    let talents: Record<string, TalentDaySchema[]> = {};
    for (const nation of nations) {
      talents[nation] = await findTalentsForRegion(nation, driver);
    }
    await saveFile(talents, TALENT_DIR, TALENT_FILE, false);
  } finally {
    await driver.quit();
  }
}

async function main() {
  await initDb();
  console.log("Database initialized");
  await newCharactersPipeline();
}

if (require.main === module) {
  main()
    .catch((error) => {
      console.error(error);
    })
    .then(() => {
      console.log("New characters pipeline complete");
    });
}
