import { By, WebDriver, WebElement } from 'selenium-webdriver';
import { URL, waitForElementCss, withWebDriver } from './setup.js';
import {
  AnimationSchema,
  GallerySchema,
  GenshinImageSchema,
} from './schema.js';
import { getParentNextDivSibling } from './utils.js';
import * as path from 'node:path';
import * as fs from 'node:fs/promises';
import { PUBLIC_DIR, loadJsonData, saveJson, listFiles } from './fileio.js';
import chalk from 'chalk';

const parseUrl = (url: string) => url.split('/revision/')[0];
const CHARACTERS_DIR = path.join(PUBLIC_DIR, 'characters');

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
    console.log(chalk.cyan(`\n=== Scraping gallery for ${characterName} ===`));
    try {
      const galleryData = await getCharacterGalleryImages(driver, characterName);
      console.log(chalk.green(`✅ Scraped gallery for ${characterName}`));
      return galleryData;
    } catch (error) {
      console.log(chalk.red(`❌ Error scraping gallery for ${characterName}:`), error);
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
    console.log(
      chalk.red('❌ Characters directory not found:'),
      CHARACTERS_DIR
    );
    return;
  }

  const characterFiles = await listFiles(CHARACTERS_DIR);
  console.log(chalk.cyan(`📁 Found ${characterFiles.length} character files`));

  for (const file of characterFiles) {
    if (!file.endsWith('.json')) continue;

    const characterName = file.replace('.json', '');
    const filePath = path.join(CHARACTERS_DIR, file);

    try {
      // Load existing character data
      const characterData = await loadJsonData<any>(filePath);

      if (!characterData) {
        console.log(
          chalk.yellow(`⚠️  Could not load data for ${characterName}`)
        );
        continue;
      }

      // Skip if gallery already exists and force is false
      if (characterData.gallery && !force) {
        console.log(
          chalk.gray(
            `⏭️  ${characterName} already has gallery data, skipping...`
          )
        );
        continue;
      }

      // Scrape gallery data with its own WebDriver instance
      const galleryData = await scrapeCharacterGallery(characterName);

      if (!galleryData) {
        console.log(
          chalk.yellow(`⚠️  No gallery data returned for ${characterName}`)
        );
        continue;
      }

      // Merge gallery data into character data
      characterData.gallery = galleryData;

      // Save back to the same file
      await saveJson(characterData, CHARACTERS_DIR, file);

      console.log(chalk.green(`✅ Merged gallery data for ${characterName}`));
    } catch (error) {
      console.log(chalk.red(`❌ Error processing ${characterName}:`), error);
    }
  }

  console.log(chalk.green.bold('\n✨ Gallery merge complete!'));
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

  const screenAnimations = await getCharacterScreenAnimations(driver);
  const nameCards = await getCharacterNameCard(driver);
  const attackTypes = [
    'Normal_Attack',
    'Elemental_Burst',
    'Elemental_Skill',
  ] as const;

  const attackAnimations = await Promise.all(
    attackTypes.map(async (skill) => {
      return {
        skill,
        animations: await getCharacterAttackAnimations(driver, skill),
      };
    })
  );

  return {
    screenAnimations,
    nameCards,
    attackAnimations,
    detailedImages: await getImagesAfterHeading(
      driver,
      'span#Character_Details'
    ),
    stickers: await getImagesAfterHeading(
      driver,
      'span[id="Paimon\'s_Paintings"]'
    ),
  };
}

/**
 * Scrapes character screen animations from the gallery page.
 * Locates and extracts image URLs and captions from figure elements.
 *
 * @param {WebDriver} driver - Selenium WebDriver instance
 * @returns {Promise<Array<AnimationSchema>>}
 */
async function getCharacterScreenAnimations(
  driver: WebDriver
): Promise<AnimationSchema[]> {
  const cssSelector = 'span#Character_Screen_Animations';
  await waitForElementCss(driver, cssSelector);

  const galleryContainer = await driver
    .findElement(By.css(cssSelector))
    .findElement(By.xpath('./parent::*'))
    .findElement(By.xpath('./following-sibling::div'));

  const figures = await galleryContainer.findElements(By.css('figure'));
  return await parseFigures(figures);
}

/**
 * Scrapes character name card images.
 * Locates and extracts image URLs and captions from the name card section.
 *
 * @param {WebDriver} driver - Selenium WebDriver instance
 * @returns {Promise<Array<GenshinImageSchema>>}
 */
async function getCharacterNameCard(
  driver: WebDriver
): Promise<GenshinImageSchema[]> {
  const cssSelector = 'span#Namecard';
  await waitForElementCss(driver, cssSelector);

  const images = await driver
    .findElement(By.css(cssSelector))
    .findElement(By.xpath('./parent::*'))
    .findElement(By.xpath('./following-sibling::div'))
    .findElements(By.css('img'));

  return await parseImages(images);
}

/**
 * Scrapes animation images for a specific attack type.
 *
 * @param {WebDriver} driver - Selenium WebDriver instance
 * @param {string} skill - Attack type ("Normal_Attack", "Elemental_Burst", or "Elemental_Skill")
 * @returns {Promise<Array<AnimationSchema>>}
 */
async function getCharacterAttackAnimations(
  driver: WebDriver,
  skill: string
): Promise<AnimationSchema[]> {
  const cssSelector = `span#${skill}`;
  await waitForElementCss(driver, cssSelector);

  const galleryContainer = await driver
    .findElement(By.css(cssSelector))
    .findElement(By.xpath('./parent::*'))
    .findElement(By.xpath('./following-sibling::div'));

  const figures = await galleryContainer.findElements(By.css('figure'));
  return await parseFigures(figures);
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
        const img = await figure
          .findElement(By.css('img'))
          .getAttribute('data-src');
        const caption = await figure
          .findElement(By.css('figcaption'))
          .getText();
        const videoSource = await figure.findElement(By.css('video source'));

        const videoUrl = await videoSource.getAttribute('data-src');
        const videoType = await videoSource.getAttribute('type');
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
      try {
        const url = await img.getAttribute('data-src');
        const caption = await img.getAttribute('alt');
        return {
          url: parseUrl(url),
          caption,
        };
      } catch {
        return {
          url: '',
          caption: '',
        };
      }
    })
  );
}

/**
 * Retrieves and parses images that appear after a specified heading in the DOM.
 *
 * @param driver - Selenium WebDriver instance for browser automation
 * @param headingSelector - CSS selector string to find the heading element
 * @returns Promise resolving to array of image objects with urls and captions
 * @throws Error if heading element cannot be found or images cannot be parsed
 */
async function getImagesAfterHeading(
  driver: WebDriver,
  headingSelector: string
): Promise<GenshinImageSchema[]> {
  try {
    await waitForElementCss(driver, headingSelector);
    const container = await getParentNextDivSibling(driver, headingSelector);
    const imgs = await container.findElements(By.css('img'));
    return await parseImages(imgs);
  } catch (error) {
    console.error(`Error getting images after ${headingSelector}:`, error);
    return [];
  }
}

/**
 * Main entry point for the scraper.
 * Processes all character files and merges gallery data into each one.
 * Each character gets its own WebDriver instance via withWebDriver.
 *
 * @returns {Promise<void>}
 */
async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const force = args.includes('--force');

  console.log(chalk.cyan('\n🎨 Starting gallery scraper...\n'));

  try {
    await mergeGalleryIntoCharacterFiles(force);
  } catch (error) {
    console.error(chalk.red('❌ Error in main:'), error);
    throw error;
  }
}

const isMainModule =
  process.argv[1] && import.meta.url.includes(path.basename(process.argv[1]));
if (isMainModule) {
  await main();
}
