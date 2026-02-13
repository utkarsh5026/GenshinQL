import * as fs from 'node:fs/promises';
import * as path from 'node:path';

import { By, WebDriver, WebElement } from 'selenium-webdriver';

import { logger } from '../logger.js';
import { listFiles, loadJsonData, PUBLIC_DIR, saveJson } from './fileio.js';
import {
  AdvancedCharacterSchema,
  GallerySchema,
  gallerySchema,
  GenshinImageSchema,
} from './schema.js';
import { URL, waitForElementCss, withWebDriver } from './setup.js';
import { getParentNextDivSibling, launchDriverInBatchSafe } from './utils.js';

const parseUrl = (url: string) => url.split('/revision/')[0];
const CHARACTERS_DIR = path.join(PUBLIC_DIR, 'characters');

/**
 * Validates if gallery data has all required fields and proper structure
 * @param galleryData - The gallery data object to validate
 * @param charName - Character name for logging purposes
 * @returns true if the gallery data is complete, false otherwise
 */
function isGalleryDataComplete(
  galleryData: unknown,
  charName: string
): boolean {
  if (!galleryData) {
    logger.warn(`${charName} has no gallery data`);
    return false;
  }

  const result = gallerySchema.safeParse(galleryData);

  if (!result.success) {
    logger.warn(
      `Gallery validation failed for ${charName}:`,
      result.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`)
    );
    return false;
  }

  const validatedGallery = result.data;

  if (!validatedGallery.screenAnimations) {
    logger.warn(`${charName} gallery missing screenAnimations`);
    return false;
  }

  const hasCompleteScreenAnimations = validatedGallery.screenAnimations.some(
    (anim) => anim.url || anim.videoUrl
  );
  if (!hasCompleteScreenAnimations) {
    logger.warn(
      `${charName} gallery has incomplete screenAnimations (all empty)`
    );
    return false;
  }

  if (!validatedGallery.nameCards) {
    logger.warn(`${charName} gallery missing nameCards`);
    return false;
  }

  if (!validatedGallery.attackAnimations) {
    logger.warn(`${charName} gallery missing attackAnimations`);
    return false;
  }

  logger.debug(`${charName} gallery data is complete`);
  return true;
}

/**
 * Checks all character files for gallery data completeness and reports coverage statistics.
 * Similar to checkCharacterCoverage in characters.ts but focused on gallery data validation.
 */
export async function checkGalleryCoverage(): Promise<void> {
  logger.cyan('\n=== Checking Gallery Coverage ===\n');

  try {
    await fs.access(CHARACTERS_DIR);
  } catch {
    logger.error('Characters directory not found:', CHARACTERS_DIR);
    return;
  }

  const characterFiles = (await listFiles(CHARACTERS_DIR)).filter((file) =>
    file.endsWith('.json')
  );

  let totalChecked = 0;
  let totalComplete = 0;
  const incompleteCharacters: string[] = [];

  for (const file of characterFiles) {
    const charName = file.replace('.json', '');
    const filePath = path.join(CHARACTERS_DIR, file);
    totalChecked++;

    try {
      const character = await loadJsonData<AdvancedCharacterSchema>(filePath);

      if (!character) {
        logger.warn(`${charName} - could not load file`);
        incompleteCharacters.push(charName);
        continue;
      }

      if (!character.gallery) {
        logger.warn(`${charName} - no gallery data`);
        incompleteCharacters.push(charName);
        continue;
      }

      const isComplete = isGalleryDataComplete(character.gallery, charName);
      if (isComplete) {
        totalComplete++;
      } else {
        incompleteCharacters.push(charName);
      }
    } catch (error) {
      logger.error(`${charName} - error reading file:`, error);
      incompleteCharacters.push(charName);
    }
  }

  logger.info(`Total characters checked: ${totalChecked}`);
  logger.success(`Complete characters: ${totalComplete}`);

  if (incompleteCharacters.length === 0) {
    logger.success('\nAll characters have complete gallery data!\n');
  } else {
    logger.warn(
      `Incomplete/Missing (${incompleteCharacters.length}): ${incompleteCharacters.join(', ')}\n`
    );
  }
}

/**
 * Scrapes gallery data for a single character using its own WebDriver instance.
 * Creates a new WebDriver instance for each character scrape.
 *
 * @param {string} charName - Character name (from filename without .json)
 * @returns {Promise<GallerySchema | undefined>}
 */
async function scrapeCharacterGallery(
  charName: string
): Promise<GallerySchema | undefined> {
  const scrapeGallery = async (driver: WebDriver) => {
    logger.cyan(`\n=== Scraping gallery for ${charName} ===`);
    try {
      const galleryData = await getCharacterGalleryImages(driver, charName);
      logger.success(`Scraped gallery for ${charName}`);
      return galleryData;
    } catch (error) {
      logger.error(`Error scraping gallery for ${charName}:`, error);
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

  const characterFiles = (await listFiles(CHARACTERS_DIR)).filter((file) =>
    file.endsWith('.json')
  );

  const filterResults = await Promise.all(
    characterFiles.map(async (file) => {
      const charName = file.replace('.json', '');
      const filePath = path.join(CHARACTERS_DIR, file);

      const character = await loadJsonData<AdvancedCharacterSchema>(filePath);
      if (!character) {
        logger.warn(`⚠️  Could not load data for ${charName}`);
        return { file, needsScraping: false };
      }

      if (!force && character.gallery) {
        const isComplete = isGalleryDataComplete(character.gallery, charName);
        if (isComplete) {
          logger.debug(
            `⏭️  ${charName} already has complete gallery data, skipping...`
          );
          return { file, needsScraping: false };
        }
        logger.warn(`${charName} has incomplete gallery data, re-scraping...`);
      }

      return { file, needsScraping: true };
    })
  );

  const filesToScrape = filterResults
    .filter((r) => r.needsScraping)
    .map((r) => r.file);

  logger.cyan(
    `\n📋 Found ${filesToScrape.length}/${characterFiles.length} characters to scrape`
  );

  const createScrapeTask = (file: string) => async () => {
    const charName = file.replace('.json', '');
    const filePath = path.join(CHARACTERS_DIR, file);

    const character = await loadJsonData<AdvancedCharacterSchema>(filePath);
    if (!character) return;

    const gallery = await scrapeCharacterGallery(charName);
    if (!gallery) {
      logger.warn(`⚠️  No gallery data returned for ${charName}`);
      return;
    }

    character.gallery = gallery;
    await saveJson(character, CHARACTERS_DIR, file);
    logger.success(`✅ Merged gallery data for ${charName}`);
  };

  const tasks = filesToScrape.map(createScrapeTask);

  await launchDriverInBatchSafe(tasks, 4, (batchIndex, totalBatches) => {
    logger.cyan(`\n📦 Completed batch ${batchIndex}/${totalBatches}`);
  });

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
        // Always get img and caption first (these should always exist)
        const [img, caption] = await Promise.all([
          figure.findElement(By.css('img')).getAttribute('data-src'),
          figure.findElement(By.css('figcaption')).getText(),
        ]);

        let videoUrl = '';
        let videoType = '';

        try {
          const videoSource = await figure.findElement(By.css('video source'));
          [videoUrl, videoType] = await Promise.all([
            videoSource.getAttribute('data-src'),
            videoSource.getAttribute('type'),
          ]);
        } catch {
          logger.debug('No video source found, using GIF only');
        }

        return {
          url: parseUrl(img),
          caption,
          videoUrl: videoUrl ? parseUrl(videoUrl) : '',
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
  logger.info('Starting gallery script...');
  const args = process.argv.slice(2);
  logger.info('Arguments:', args);

  if (args.length === 0) {
    logger.info('Usage: node gallery.js --merge --check');
    logger.info('  --merge: Scrape and merge gallery data for characters');
    logger.info('  --check: Check gallery coverage for all characters');
    return;
  }

  if (args.includes('--merge')) {
    logger.cyan('\n🎨 Starting gallery merge...\n');
    try {
      await mergeGalleryIntoCharacterFiles(false);
    } catch (error) {
      logger.error('❌ Error in merge:', error);
      throw error;
    }
  }

  if (args.includes('--check')) {
    await checkGalleryCoverage();
  }
}

const isMainModule =
  process.argv[1] && import.meta.url.includes(path.basename(process.argv[1]));
if (isMainModule) {
  await main();
}
