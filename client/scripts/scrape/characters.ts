import { By, until, WebDriver, WebElement } from 'selenium-webdriver';
import { URL, withWebDriver } from './setup.js';
import * as path from 'node:path';
import * as fs from 'node:fs/promises';
import chalk from 'chalk';
import { logger } from '../logger';
import {
  parseCharacterName,
  findImageInCell,
  findImageAltInCell,
  safeGet,
  getTableFromHeading,
  waitForElement,
} from './utils.js';
import {
  CHARACTER_DIR,
  PUBLIC_DIR,
  listFiles,
  loadFromPublic,
  loadJsonData,
  saveFileWithNewVersion,
  saveJson,
  saveToPublic,
} from './fileio';
import {
  AdvancedCharacterSchema,
  BaseCharacterSchema,
  TalentSchema,
} from './schema.js';

const TIME_TO_WAIT_FOR_ELEMENT_MS = 10000;
const CHARACTERS_FILE_NAME = 'characters';

const parseUrl = (url: string) => url.split('/revision/')[0];

async function getTableRows(driver: WebDriver, tableSelector: string) {
  logger.debug(`Looking for table with selector: ${tableSelector}`);
  await driver.wait(
    until.elementLocated(By.css(tableSelector)),
    TIME_TO_WAIT_FOR_ELEMENT_MS
  );

  return await driver.findElements(By.css(`${tableSelector} tr`));
}

/**
 * Scrapes character details from their wiki page including images, talents and constellations.
 * Creates a new WebDriver instance for each character scrape.
 */
export async function scrapeCharacterDetailed(character: string) {
  const getCharacterReleaseVersion = async (driver: WebDriver) => {
    logger.info(`Fetching release version for ${character}...`);
    const table = await getTableFromHeading(
      driver,
      'Character Event Wishes',
      'h3'
    );
    const rows = await table.findElements(By.css('tr'));

    const cells = await rows[1].findElements(By.css('td'));
    const lastCell = cells.at(-1);

    if (!lastCell) {
      logger.warn(`Release version not found for ${character}`);
      return 'Unknown Version';
    }
    const version = await lastCell.getText();
    logger.success(`Release version: ${version}`);
    return version;
  };

  const getCharacterImages = async (driver: WebDriver) => {
    logger.info(`Scraping images for ${character}...`);
    const selector = 'a.image.image-thumbnail';
    await waitForElement(driver, selector);

    const characterUrls = await driver.findElements(By.css(selector));
    const urls = await Promise.all(
      characterUrls.map(async (url) => {
        return parseUrl(await url.getAttribute('href'));
      })
    );

    const urlMap: Map<string, string> = new Map();

    for (const url of urls) {
      const lowerUrl = url.toLowerCase();
      if (lowerUrl.includes('card')) urlMap.set('card', url);
      else if (lowerUrl.includes('wish')) urlMap.set('wish', url);
      else if (lowerUrl.includes('game')) urlMap.set('inGame', url);
    }

    const nameCardContainer = await driver.findElement(
      By.css('div[data-source="namecard"]')
    );

    urlMap.set('nameCard', parseUrl(await findImageInCell(nameCardContainer)));
    logger.success(`Found ${urlMap.size} images`);
    return urlMap;
  };


  const getTalents = async (driver: WebDriver) => {
    logger.info(`Scraping talents for ${character}...`);
    const talentSelector = 'table.talent-table';
    await waitForElement(driver, talentSelector);

    const rows = await driver.findElements(By.css(`${talentSelector} tr`));

    const talents: TalentSchema[] = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const cells = await row.findElements(By.css('td'));

      if (cells.length == 3) {
        try {
          const talentIcon = parseUrl(
            await cells[0].findElement(By.css('a img')).getAttribute('data-src')
          );
          const talentName = await cells[1].getText();
          const talentType = await cells[2].getText();

          const descRow = rows[i + 1];
          const description = await getTalentDescription(driver, descRow);

          const figureUrls = await getFigureUrls(driver, descRow);
          const scaling = await getTalentScaling(driver, descRow);

          talents.push({
            talentIcon,
            talentName,
            talentType,
            description,
            figureUrls,
            scaling,
          });
          logger.debug(`  - ${talentName} (${talentType})`);
        } catch (error) {
          logger.error('Error scraping talent:', error);
        }
      }
    }

    logger.success(`Scraped ${talents.length} talents`);
    return talents;
  };

  const getConstellations = async (driver: WebDriver) => {
    const rows = await getTableRows(driver, 'table.constellation-table');

    const parseConstellationRow = async (row: WebElement, index: number) => {
      const cells = await row.findElements(By.css('td'));
      if (cells.length != 3) {
        return null;
      }

      const [iconCell, nameCell, levelCell] = cells;
      const iconUrl = parseUrl(
        await iconCell.findElement(By.css('a img')).getAttribute('data-src')
      );

      const description = await rows[index + 1]
        .findElement(By.css('td'))
        .getText();

      return {
        iconUrl,
        name: await nameCell.getText(),
        level: Number.parseInt(await levelCell.getText()),
        description,
      };
    };

    const constellations = await Promise.all(rows.map(parseConstellationRow));
    return constellations.filter((c) => c !== null);
  };

  const scrapeCharacter = async (driver: WebDriver) => {
    const characterUrl = `${URL}/${character}`;
    logger.cyan(`\n=== Starting scrape for ${character} ===`);
    logger.info(`Navigating to ${characterUrl}`);

    try {
      await driver.get(characterUrl);

      const [imageUrls, talents, constellations, version] = await Promise.all([
        getCharacterImages(driver),
        getTalents(driver),
        getConstellations(driver),
        getCharacterReleaseVersion(driver),
      ]);

      logger.success(`\n=== Completed scrape for ${character} ===\n`);
      return {
        talents,
        constellations,
        imageUrls,
        version,
      };
    } catch (error) {
      logger.error(`Failed to scrape ${character}:`, error);
    }
  };

  return await withWebDriver(scrapeCharacter);
}

/**
 * Extracts talent description from the Description tab
 *
 * @param driver - The WebDriver instance
 * @param descRow - The row element containing the description
 * @returns Promise resolving to the description text
 */
async function getTalentDescription(
  driver: WebDriver,
  descRow: WebElement
): Promise<string> {
  try {
    // Check if tabs exist within this specific row
    const tabs = await descRow.findElements(By.css('.wds-tabs__tab'));

    if (tabs.length > 0) {
      // Find and click the "Description" tab within this specific row
      let descriptionTabFound = false;
      for (const tab of tabs) {
        const tabText = await tab.getText();
        if (tabText.includes('Description')) {
          // Scroll the tab into view and click it using JavaScript to avoid click interception
          await driver.executeScript(
            'arguments[0].scrollIntoView({behavior: "smooth", block: "center"}); arguments[0].click();',
            tab
          );
          descriptionTabFound = true;
          logger.debug('Clicked Description tab');
          break;
        }
      }

      if (descriptionTabFound) {
        // Wait for the tab content to become active
        await driver.sleep(800);
      }
    }

    // Try to get description from the new tab structure first
    const tabContent = await descRow.findElements(
      By.css('.wds-tab__content.wds-is-current p')
    );

    if (tabContent.length > 0) {
      const description = await tabContent[0].getText();
      return description;
    }

    // Fallback to old structure
    const descCells = await descRow.findElement(By.css('td'));
    const rawDescription = (await descCells.getText()).split('▼')[0];
    return rawDescription;
  } catch (error) {
    logger.error('Error in getTalentDescription:', error);
    return '';
  }
}

/**
 * Extracts figure URLs and captions from talent description figures
 *
 * @param driver - The WebDriver instance
 * @param descRow - The row element containing the figures
 * @returns Promise resolving to array of figure URLs and captions
 */
async function getFigureUrls(driver: WebDriver, descRow: WebElement) {
  try {
    const tabs = await descRow.findElements(By.css('.wds-tabs__tab'));

    if (tabs.length > 0) {
      let previewTabFound = false;
      for (const tab of tabs) {
        const tabText = await tab.getText();
        if (tabText.includes('Preview')) {
          await driver.executeScript(
            'arguments[0].scrollIntoView({behavior: "smooth", block: "center"}); arguments[0].click();',
            tab
          );
          previewTabFound = true;
          logger.debug('Clicked Preview tab');
          break;
        }
      }

      if (previewTabFound) {
        await driver.sleep(800);
      }
    }

    let figures = await descRow.findElements(
      By.css('.wds-tab__content.wds-is-current figure.thumb')
    );

    if (figures.length === 0) {
      figures = await descRow.findElements(By.css('figure.thumb'));
    }

    return Promise.all(
      figures.map(async (figure) => {
        try {
          const image = await figure.findElement(By.css('a img'));
          const url = parseUrl(await image.getAttribute('data-src'));
          let caption = '';

          try {
            caption = await driver.executeScript(
              `
          const fig = arguments[0];
          const captionEl = fig.querySelector('figcaption p.caption');
          return captionEl ? captionEl.textContent.trim() : '';
        `,
              figure
            );

            if (caption) {
              logger.debug('Caption found:', caption);
            }
          } catch {
            try {
              caption = await driver.executeScript(
                `
            const fig = arguments[0];
            const figcaption = fig.querySelector('figcaption');
            return figcaption ? figcaption.textContent.trim() : '';
          `,
                figure
              );
            } catch {
              logger.debug('No caption found');
            }
          }

          return { url, caption };
        } catch (error) {
          logger.error('Error getting figure urls:', error);
          return { url: '', caption: '' };
        }
      })
    );
  } catch (error) {
    logger.error('Error in getFigureUrls:', error);
    return [];
  }
}

/**
 * Scrapes and retrieves talent scaling information from a character's talent row.
 *
 * @param driver - The WebDriver instance used for browser automation
 * @param row - The WebElement representing the talent row containing scaling data
 * @returns A Record mapping stat names to arrays of scaling values. For example:
 *          {
 *            "Normal Attack DMG": ["100%", "110%", "120%"],
 *            "Charged Attack DMG": ["150%", "165%", "180%"],
 *            "CD": ["12s"]
 *          }
 *          Returns empty object if scaling data cannot be retrieved.
 */
async function getTalentScaling(driver: WebDriver, row: WebElement) {
  try {
    const tabs = await row.findElements(By.css('.wds-tabs__tab'));
    if (tabs.length === 0) {
      logger.debug('No tabs found in this talent row');
      return {};
    }

    let attributeScalingTabFound = false;
    for (const tab of tabs) {
      const tabText = await tab.getText();
      if (tabText.includes('Attribute Scaling')) {
        await driver.executeScript(
          'arguments[0].scrollIntoView({behavior: "smooth", block: "center"}); arguments[0].click();',
          tab
        );
        attributeScalingTabFound = true;
        logger.debug('Clicked Attribute Scaling tab');
        break;
      }
    }

    if (!attributeScalingTabFound) {
      logger.debug('Attribute Scaling tab not found in this row');
      return {};
    }

    await driver.sleep(800);
    const tables = await row.findElements(
      By.css('.wds-tab__content.wds-is-current table.wikitable')
    );
    const scaling: Record<string, string[]> = {};

    for (const table of tables) {
      const rows = await table.findElements(By.css('tbody tr'));

      for (const scalingRow of rows) {
        const headings = await scalingRow.findElements(By.css('th'));

        if (headings.length === 1) {
          const colspan = await headings[0].getAttribute('colspan');
          if (colspan === '12') {
            continue;
          }
        }

        if (headings.length > 0) {
          const statName = await headings[0].getText();
          if (!statName.trim()) continue;

          const values = await scalingRow.findElements(By.css('td'));
          const valueTexts = await Promise.all(
            values.map((value) => value.getText())
          );

          if (valueTexts.length > 0) {
            scaling[statName] = valueTexts;
          }
        }
      }
    }

    return scaling;
  } catch (error) {
    logger.error('Error in getTalentScaling:', error);
    return {};
  }
}

/**
 * Scrapes character data from the main characters page and processes it into a structured format.
 *
 * @param driver - The WebDriver instance used for browser automation.
 * @returns A Promise that resolves to an array of character objects, excluding "Aloy" and "Traveler".
 */
async function scrapeBaseCharactersTable(
  driver: WebDriver
): Promise<BaseCharacterSchema[]> {
  const getCharacterRows = async () => {
    console.log(
      chalk.cyan('📍 Navigating to:'),
      chalk.blue(`${URL}/Character`)
    );
    await driver.get(`${URL}/Character`);
    await driver.sleep(2000);

    const table = await getTableFromHeading(driver, 'Playable Characters');
    return await table.findElements(By.css('tr'));
  };

  const parseTableRow = async (
    row: WebElement
  ): Promise<BaseCharacterSchema | null> => {
    const cells = await row.findElements(By.css('td'));
    const texts = await Promise.all(cells.map((cell) => cell.getText()));

    texts[2] = await findImageAltInCell(cells[2]);

    const [iconUrl, elementUrl, regionUrl, weaponUrl] = await Promise.all(
      [0, 3, 5, 4].map((i) => findImageInCell(cells[i]))
    );

    const character: BaseCharacterSchema = {
      iconUrl: parseUrl(iconUrl),
      name: texts[1],
      rarity: await findImageAltInCell(cells[2]),
      element: texts[3],
      weaponType: texts[4],
      region: texts[5],
      elementUrl: parseUrl(elementUrl),
      weaponUrl: parseUrl(weaponUrl),
      regionUrl: parseUrl(regionUrl),
      modelType: texts.at(-1) || 'Unknown',
    };

    if (character.name === 'Aloy' || character.name === 'Traveler') {
      console.log(chalk.gray('⏭️  Skipping:'), chalk.dim(character.name));
      return null;
    }

    console.log(
      chalk.green('✓'),
      chalk.white(character.name),
      chalk.gray(`(${character.element})`)
    );
    return character;
  };

  const scrape = async () => {
    const rowElements = await getCharacterRows();
    console.log(
      chalk.cyan('📊 Processing'),
      chalk.bold(`${rowElements.length - 1}`),
      chalk.cyan('character rows...')
    );
    const characters = await Promise.all(
      rowElements.slice(1).map(parseTableRow)
    );
    const filtered = characters.filter(
      (c): c is BaseCharacterSchema => c !== null
    );
    console.log(
      chalk.green.bold(
        `\n✨ Successfully scraped ${filtered.length} characters!`
      )
    );
    return filtered;
  };

  return safeGet(scrape, []);
}

/**
 * Scrapes and saves detailed character information for characters that haven't been processed yet.
 */
const scrapeAndSaveDetailedCharacterInfo = async (
  force: boolean = false
): Promise<void> => {
  const characters =
    await loadFromPublic<BaseCharacterSchema[]>(CHARACTERS_FILE_NAME);

  if (!characters) {
    console.error('No characters found');
    return;
  }

  await scrapeCharactersInDetail(characters.slice(0, 1), force);
};

/**
 * Scrapes detailed information for each character and saves it to individual files.
 * After scraping all characters, combines the files into a single detailed characters file.
 * Each character gets its own WebDriver instance for isolated scraping.
 *
 * @param characters - Array of base character data to scrape details for
 * @param force - If true, scrapes all characters even if they were previously saved.
 *               If false, skips characters that already have saved data.
 * @returns Promise that resolves when all characters have been scraped and saved
 */
export async function scrapeCharactersInDetail(
  characters: BaseCharacterSchema[],
  force: boolean = false
) {
  const detailedDir = path.join(PUBLIC_DIR, 'characters');

  try {
    await fs.access(detailedDir);
  } catch {
    await fs.mkdir(detailedDir, { recursive: true });
    console.log(chalk.blue('📁 Created directory:'), chalk.gray(detailedDir));
  }

  const savedCharacters = await listFiles(detailedDir);

  for (const char of characters) {
    const name = parseCharacterName(char.name);
    if (!force && savedCharacters.includes(name)) {
      console.log(`${char.name} already saved`);
      continue;
    }

    try {
      console.log(`Scraping ${name}`);
      const desc = await scrapeCharacterDetailed(name);

      const fullDesc = {
        ...char,
        ...desc,
      };

      await saveJson(fullDesc, detailedDir, name);
    } catch (error) {
      console.error(`Error scraping ${char.name}:`, error);
    }
  }

  await morphAllFilesIntoOne();
}

/**
 * Combines all individual character detail files into a single file.
 * Reads each character's detailed data file from the detailed subdirectory,
 * combines them into a single object keyed by character name,
 * and saves the combined data to a versioned file.
 *
 * @remarks
 * The individual files are read from CHARACTER_DIR/detailed/
 * The combined file is saved to CHARACTER_DIR/characters_detailed{version}.json
 *
 * @returns Promise that resolves when the combined file has been saved
 */
async function morphAllFilesIntoOne() {
  let charactersDetailed: Record<string, AdvancedCharacterSchema> = {};
  const charDir = path.join(PUBLIC_DIR, 'characters');
  try {
    await fs.access(charDir);
  } catch {
    await fs.mkdir(charDir, { recursive: true });
    console.log(chalk.blue('📁 Created directory:'), chalk.gray(charDir));
  }

  const files = await listFiles(charDir);

  for (const file of files) {
    const char = await loadJsonData<AdvancedCharacterSchema>(
      path.join(charDir, file)
    );

    if (char)
      charactersDetailed = {
        ...charactersDetailed,
        [char.name]: char,
      };
  }

  await saveFileWithNewVersion(
    charactersDetailed,
    CHARACTER_DIR,
    'characters_detailed'
  );
}

async function main() {
  console.log('Starting character scraping script...');
  const args = process.argv.slice(2);
  console.log('Arguments:', args);

  if (args.length === 0) {
    console.dir('No arguments provided', {
      depth: null,
      colors: true,
    });

    console.log('Usage: node characters.js --base --detailed');
    return;
  }

  const scrapeCharactersBase = async (driver: WebDriver) => {
    console.log('Starting base character scraping...');
    await saveToPublic(
      await scrapeBaseCharactersTable(driver),
      CHARACTERS_FILE_NAME
    );
    console.log('Base character scraping complete');
  };

  const saveCharactersDetailed = async () => {
    console.log('Starting detailed character scraping...');
    await scrapeAndSaveDetailedCharacterInfo(true);
    console.log('Detailed character scraping complete');
  };

  if (args.includes('--base')) {
    await withWebDriver(scrapeCharactersBase);
  }

  if (args.includes('--detailed')) {
    await saveCharactersDetailed();
  }
}

const isMainModule =
  process.argv[1] && import.meta.url.includes(path.basename(process.argv[1]));
if (isMainModule) {
  main().then(() => console.log('Completed'));
}
