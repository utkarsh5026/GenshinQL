import { By, WebDriver, WebElement } from 'selenium-webdriver';
import { URL, waitForElementCss, withWebDriver } from './setup.js';
import {
  AdvancedCharacterSchema,
  GallerySchema,
  GenshinImageSchema,
  gallerySchema,
} from './schema.js';
import { getParentNextDivSibling } from './utils.js';
import * as path from 'node:path';
import * as fs from 'node:fs/promises';
import { PUBLIC_DIR, loadJsonData, saveJson, listFiles } from './fileio.js';
import { logger } from '../logger.js';

const parseUrl = (url: string) => url.split('/revision/')[0];
const CHARACTERS_DIR = path.join(PUBLIC_DIR, 'characters');

/**
 * Validates if gallery data has all required fields and proper structure
 * @param galleryData - The gallery data object to validate
 * @param characterName - Character name for logging purposes
 * @returns true if the gallery data is complete, false otherwise
 */
function isGalleryDataComplete(
  galleryData: unknown,
  characterName: string
): boolean {
  if (!galleryData) {
    logger.warn(`${characterName} has no gallery data`);
    return false;
  }

  const result = gallerySchema.safeParse(galleryData);

  if (!result.success) {
    logger.warn(
      `Gallery validation failed for ${characterName}:`,
      result.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`)
    );
    return false;
  }

  // Use the validated data from the parse result
  const validatedGallery = result.data;

  // Check for required arrays (should exist even if empty)
  if (!validatedGallery.screenAnimations) {
    logger.warn(`${characterName} gallery missing screenAnimations`);
    return false;
  }

  if (!validatedGallery.nameCards) {
    logger.warn(`${characterName} gallery missing nameCards`);
    return false;
  }

  if (!validatedGallery.attackAnimations) {
    logger.warn(`${characterName} gallery missing attackAnimations`);
    return false;
  }

  logger.debug(`${characterName} gallery data is complete`);
  return true;
}

/**
 * Scrapes gallery data for a single character using its own WebDriver instance.
 * Creates a new WebDriver instance for each character scrape.
 *
 * @param {string} characterName - Character name (from filename without .json)
 * @returns {Promise<GallerySchema | undefined>}
 */
async function scrapeCharacterGallery(
  characterName: string
): Promise<GallerySchema | undefined> {
  const scrapeGallery = async (driver: WebDriver) => {
    logger.cyan(`\n=== Scraping gallery for ${characterName} ===`);
    try {
      const galleryData = await getCharacterGalleryImages(
        driver,
        characterName
      );
      logger.success(`✅ Scraped gallery for ${characterName}`);
      return galleryData;
    } catch (error) {
      logger.error(`❌ Error scraping gallery for ${characterName}:`, error);
      throw error;
    }
  };

  return await withWebDriver(scrapeGallery);
}

/**
 * Loads and merges gallery images for all characters in the characters folder.
 * Processes character files from client/public/characters/ and merges gallery data into each file.
 * Each character gets its own WebDriver instance for isolated scraping.
 * Skips already processed characters unless force flag is set.
 *
 * @param {boolean} [force=false] - Force re-scraping of already saved characters
 * @returns {Promise<void>}
 */
async function mergeGalleryIntoCharacterFiles(
  force: boolean = false
): Promise<void> {
  try {
    await fs.access(CHARACTERS_DIR);
  } catch {
    logger.error('❌ Characters directory not found:', CHARACTERS_DIR);
    return;
  }

  const characterFiles = await listFiles(CHARACTERS_DIR);
  logger.cyan(`📁 Found ${characterFiles.length} character files`);

  for (const file of characterFiles) {
    if (!file.endsWith('.json')) continue;

    const characterName = file.replace('.json', '');
    const filePath = path.join(CHARACTERS_DIR, file);

    try {
      const characterData =
        await loadJsonData<AdvancedCharacterSchema>(filePath);

      if (!characterData) {
        logger.warn(`⚠️  Could not load data for ${characterName}`);
        continue;
      }

      if (!force && characterData.gallery) {
        const isComplete = isGalleryDataComplete(
          characterData.gallery,
          characterName
        );
        if (isComplete) {
          logger.debug(
            `⏭️  ${characterName} already has complete gallery data, skipping...`
          );
          continue;
        } else {
          logger.warn(
            `${characterName} has incomplete gallery data, re-scraping...`
          );
        }
      }

      // Scrape gallery data with its own WebDriver instance
      const galleryData = await scrapeCharacterGallery(characterName);

      if (!galleryData) {
        logger.warn(`⚠️  No gallery data returned for ${characterName}`);
        continue;
      }

      // Merge gallery data into character data
      characterData.gallery = galleryData;

      // Save back to the same file
      await saveJson(characterData, CHARACTERS_DIR, file);

      logger.success(`✅ Merged gallery data for ${characterName}`);
    } catch (error) {
      logger.error(`❌ Error processing ${characterName}:`, error);
    }
  }

  logger.success('\n✨ Gallery merge complete!');
}

/**
 * Scrapes all gallery images for a specific character.
 * Includes screen animations, name cards, and attack animations.
 *
 * @param {WebDriver} driver - Selenium WebDriver instance
 * @param {string} character - Character name in URL-friendly format
 * @returns {Promise<GallerySchema>}
 */
export async function getCharacterGalleryImages(
  driver: WebDriver,
  character: string
): Promise<GallerySchema> {
  const galleryUrl = `${URL}/${character}/Gallery`;
  await driver.get(galleryUrl);

  const getElementsAfterHeading = async <T>(
    headingSelector: string,
    childSelector: 'figure' | 'img',
    parser: (elements: WebElement[]) => Promise<T[]>
  ): Promise<T[]> => {
    try {
      await waitForElementCss(driver, headingSelector);
      const container = await getParentNextDivSibling(driver, headingSelector);
      const elements = await container.findElements(By.css(childSelector));
      return await parser(elements);
    } catch {
      logger.debug(
        `Optional element ${headingSelector} not found for ${character}, skipping...`
      );
      return [];
    }
  };
  const getImagesAfterHeading = (selector: string) =>
    getElementsAfterHeading(selector, 'img', parseImages);

  const [screenAnimations, nameCards] = await Promise.all([
    getElementsAfterHeading(
      'span#Character_Screen_Animations',
      'figure',
      parseFigures
    ),
    getElementsAfterHeading('span#Namecard', 'img', parseImages),
  ]);

  const attackTypes = [
    'Normal_Attack',
    'Elemental_Burst',
    'Elemental_Skill',
  ] as const;

  const attackAnimations = await Promise.all(
    attackTypes.map(async (skill) => {
      return {
        skill,
        animations: await getElementsAfterHeading(
          `span#${skill}`,
          'figure',
          parseFigures
        ),
      };
    })
  );

  return {
    screenAnimations,
    nameCards,
    attackAnimations,
    detailedImages: await getImagesAfterHeading('span#Character_Details'),
    stickers: await getImagesAfterHeading('span[id="Paimon\'s_Paintings"]'),
  };
}

/**
 * Parses figure elements to extract image URLs, captions, and video details.
 * Handles errors by returning empty strings for failed extractions.
 *
 * @param {WebElement[]} figures - Array of WebElement objects representing figures
 * @returns {Promise<Array<{url: string, caption: string, videoUrl: string, videoType: string}>>}
 */
async function parseFigures(
  figures: WebElement[]
): Promise<
  Array<{ url: string; caption: string; videoUrl: string; videoType: string }>
> {
  return await Promise.all(
    figures.map(async (figure) => {
      try {
        const [img, caption, videoSource] = await Promise.all([
          figure.findElement(By.css('img')).getAttribute('data-src'),
          figure.findElement(By.css('figcaption')).getText(),
          figure.findElement(By.css('video source')),
        ]);

        const [videoUrl, videoType] = await Promise.all([
          videoSource.getAttribute('data-src'),
          videoSource.getAttribute('type'),
        ]);

        return {
          url: parseUrl(img),
          caption,
          videoUrl: parseUrl(videoUrl),
          videoType,
        };
      } catch {
        return {
          url: '',
          caption: '',
          videoUrl: '',
          videoType: '',
        };
      }
    })
  );
}

/**
 * Parses image elements to extract URLs and captions.
 * Handles errors by returning empty strings for failed extractions.
 *
 * @param {WebElement[]} images - Array of WebElement objects representing images
 * @returns {Promise<Array<GenshinImageSchema>>}
 */
async function parseImages(
  images: WebElement[]
): Promise<GenshinImageSchema[]> {
  return await Promise.all(
    images.map(async (img) => {
      const defaultImg = {
        url: '',
        caption: '',
      };

      try {
        return {
          url: parseUrl(await img.getAttribute('data-src')),
          caption: await img.getAttribute('alt'),
        };
      } catch {
        return defaultImg;
      }
    })
  );
}

/**
 * Main entry point for the scraper.
 * Processes all character files and merges gallery data into each one.
 * Each character gets its own WebDriver instance via withWebDriver.
 *
 * @returns {Promise<void>}
 */
async function main(): Promise<void> {
  logger.cyan('\n🎨 Starting gallery scraper...\n');

  try {
    await mergeGalleryIntoCharacterFiles(false);
  } catch (error) {
    logger.error('❌ Error in main:', error);
    throw error;
  }
}

const isMainModule =
  process.argv[1] && import.meta.url.includes(path.basename(process.argv[1]));
if (isMainModule) {
  await main();
}
