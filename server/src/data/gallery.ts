import { By, WebDriver, WebElement } from "selenium-webdriver";
import {
  loadJsonPath,
  saveJson,
  setupDriver,
  URL,
  waitForElementCss,
} from "./setup";
import path from "path";
import { imageSchema } from "./schema";
import { z } from "zod";

type GenshinImage = z.infer<typeof imageSchema>;

const CHARACTERS = "characters";
const GALLERY_FILE = "gallery.json";

const parseUrl = (url: string) => url.split("/revision/")[0];

/**
 * Loads and saves gallery images for all characters.
 * Processes characters from characters.json and saves results to gallery_op.json.
 * Skips already processed characters unless force flag is set.
 *
 * @param {WebDriver} driver - Selenium WebDriver instance
 * @param {boolean} [force=false] - Force re-scraping of already saved characters
 * @returns {Promise<void>}
 */
async function loadCharactersGallery(driver: WebDriver, force = false) {
  const characters = await loadJsonPath(
    path.join(CHARACTERS, "characters.json"),
  );
  const alreadySaved = await loadJsonPath(path.join(CHARACTERS, GALLERY_FILE));

  const charGalleryMap: Record<string, any> = alreadySaved;
  for (const char of characters) {
    try {
      const name = char.name.split(" ").join("_");
      if (!force && name in alreadySaved) continue;
      charGalleryMap[name] = await getCharacterGalleryImages(driver, name);
      console.log(`Scraped ${char.name}`);
    } catch (error) {
      console.error(`Error scraping ${char.name}:`, error);
    }
  }

  await saveJson(charGalleryMap, "characters", "gallery_op");
  console.log("Gallery saved");
}

/**
 * Scrapes all gallery images for a specific character.
 * Includes screen animations, name cards, and attack animations.
 *
 * @param {WebDriver} driver - Selenium WebDriver instance
 * @param {string} character - Character name in URL-friendly format
 * @returns {Promise<{
 *   screenAnimations: Array<GenshinImage>,
 *   nameCards: Array<GenshinImage>,
 *   attackAnimations: Array<{
 *     skill: "Normal_Attack" | "Elemental_Burst" | "Elemental_Skill",
 *     animations: Array<GenshinImage>
 *   }>
 * }>}
 */
async function getCharacterGalleryImages(driver: WebDriver, character: string) {
  const galleryUrl = `${URL}/${character}/Gallery`;
  await driver.get(galleryUrl);

  const screenAnimations = await getCharacterScreenAnimations(driver);
  const nameCards = await getCharacterNameCard(driver);
  const attackTypes = [
    "Normal_Attack",
    "Elemental_Burst",
    "Elemental_Skill",
  ] as const;

  const attackAnimations = await Promise.all(
    attackTypes.map(async (skill) => {
      return {
        skill,
        animations: await getCharacterAttackAnimations(driver, skill),
      };
    }),
  );

  return {
    screenAnimations,
    nameCards,
    attackAnimations,
  };
}

/**
 * Scrapes character screen animations from the gallery page.
 * Locates and extracts image URLs and captions from figure elements.
 *
 * @param {WebDriver} driver - Selenium WebDriver instance
 * @returns {Promise<Array<GenshinImage>>}
 */
async function getCharacterScreenAnimations(
  driver: WebDriver,
): Promise<GenshinImage[]> {
  const cssSelector = "span#Character_Screen_Animations";
  await waitForElementCss(driver, cssSelector);

  const galleryContainer = await driver
    .findElement(By.css(cssSelector))
    .findElement(By.xpath("./parent::*"))
    .findElement(By.xpath("./following-sibling::div"));

  const figures = await galleryContainer.findElements(By.css("figure"));
  return await Promise.all(
    figures.map(async (figure) => {
      try {
        const img = await figure
          .findElement(By.css("img"))
          .getAttribute("data-src");
        const caption = await figure
          .findElement(By.css("figcaption"))
          .getText();
        return {
          url: parseUrl(img),
          caption,
        };
      } catch {
        return {
          url: "",
          caption: "",
        };
      }
    }),
  );
}

/**
 * Scrapes character name card images.
 * Locates and extracts image URLs and captions from the name card section.
 *
 * @param {WebDriver} driver - Selenium WebDriver instance
 * @returns {Promise<Array<GenshinImage>>}
 */
async function getCharacterNameCard(
  driver: WebDriver,
): Promise<GenshinImage[]> {
  const cssSelector = "span#Namecard";
  await waitForElementCss(driver, cssSelector);

  const images = await driver
    .findElement(By.css(cssSelector))
    .findElement(By.xpath("./parent::*"))
    .findElement(By.xpath("./following-sibling::div"))
    .findElements(By.css("img"));

  return parseImages(images);
}

/**
 * Scrapes animation images for a specific attack type.
 *
 * @param {WebDriver} driver - Selenium WebDriver instance
 * @param {string} skill - Attack type ("Normal_Attack", "Elemental_Burst", or "Elemental_Skill")
 * @returns {Promise<Array<GenshinImage>>}
 */
async function getCharacterAttackAnimations(
  driver: WebDriver,
  skill: string,
): Promise<GenshinImage[]> {
  const cssSelector = `span#${skill}`;
  await waitForElementCss(driver, cssSelector);

  const galleryContainer = await driver
    .findElement(By.css(cssSelector))
    .findElement(By.xpath("./parent::*"))
    .findElement(By.xpath("./following-sibling::div"));

  const images = await galleryContainer.findElement(By.css("img"));
  return await parseImages([images]);
}

/**
 * Parses image elements to extract URLs and captions.
 * Handles errors by returning empty strings for failed extractions.
 *
 * @param {WebElement[]} images - Array of WebElement objects representing images
 * @returns {Promise<Array<GenshinImage>>}
 */
async function parseImages(images: WebElement[]): Promise<GenshinImage[]> {
  return await Promise.all(
    images.map(async (img) => {
      try {
        const url = await img.getAttribute("data-src");
        const caption = await img.getAttribute("alt");
        return {
          url: parseUrl(url),
          caption,
        };
      } catch {
        return {
          url: "",
          caption: "",
        };
      }
    }),
  );
}

/**
 * Main entry point for the scraper.
 * Sets up the WebDriver, runs the scraping process, and ensures cleanup.
 *
 * @returns {Promise<void>}
 */
async function main() {
  const driver = await setupDriver();

  try {
    await loadCharactersGallery(driver, true);
  } finally {
    await driver.quit();
  }
}

main()
  .then(() => console.log("Done"))
  .catch(console.error);