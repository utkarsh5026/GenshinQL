import * as fs from 'node:fs/promises';
import * as path from 'node:path';

import chalk from 'chalk';
import { By, until, WebDriver, WebElement } from 'selenium-webdriver';

import { logger } from '../logger.js';
import {
  listFiles,
  loadFromPublic,
  PUBLIC_DIR,
  saveJson,
  saveToPublic,
} from './fileio.js';
import {
  advancedCharacterSchema,
  BaseCharacterSchema,
  CharacterRole,
  Primitives,
  TalentSchema,
  TalentUpgrade,
  UpgradeMaterial,
  VersionRelease,
} from './schema.js';
import { URL, withWebDriver } from './setup.js';
import {
  findImageAltInCell,
  findImageInCell,
  getTableFromHeading,
  parseCharacterName,
  safeGet,
  waitAndGetElement,
  waitForElement,
} from './utils.js';

const TIME_TO_WAIT_FOR_ELEMENT_MS = 10000;
const CHARACTERS_FILE_NAME = 'characters';

/**
 * Validates if a character file has all required fields
 * @param filePath - Path to the character JSON file
 * @returns true if the file is complete, false otherwise
 */
async function isCharacterFileComplete(filePath: string): Promise<boolean> {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    const data = JSON.parse(content);

    const result = advancedCharacterSchema.safeParse(data);

    if (!result.success) {
      logger.warn(
        `Validation failed for ${path.basename(filePath)}:`,
        result.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`)
      );
      return false;
    }

    if (!data.talents || data.talents.length === 0) {
      logger.warn(`${path.basename(filePath)} has no talents`);
      return false;
    }

    if (!data.constellations || data.constellations.length === 0) {
      logger.warn(`${path.basename(filePath)} has no constellations`);
      return false;
    }

    logger.debug(`${path.basename(filePath)} is complete`);
    return true;
  } catch (error) {
    logger.error(`Error validating ${path.basename(filePath)}:`, error);
    return false;
  }
}

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

  /**
   * Scrapes all version releases/banners from the Character Event Wishes table
   * Each row contains: banner image (skipped), featured characters, duration, version
   */
  const getVersionReleases = async (
    driver: WebDriver
  ): Promise<VersionRelease[]> => {
    try {
      const table = await getTableFromHeading(
        driver,
        'Character Event Wishes',
        'h3'
      );
      const rows = await table.findElements(By.css('tbody tr'));
      const releases: VersionRelease[] = [];

      for (const row of rows) {
        try {
          const cells = await row.findElements(By.css('td'));
          if (cells.length < 4) {
            continue;
          }

          const [, charactersCell, durationCell, versionCell] = cells;

          const characterCards = await charactersCell.findElements(
            By.css('.card-container.mini-card')
          );

          const characters: string[] = [];
          for (const card of characterCards) {
            try {
              const caption = await card.findElement(By.css('.card-caption'));
              const name = (await caption.getText()).trim();
              if (name) characters.push(name);
            } catch {
              try {
                const img = await card.findElement(By.css('a img'));
                const name = await img.getAttribute('alt');
                if (name) characters.push(name.trim());
              } catch {
                // Skip this card if we can't get the name
              }
            }
          }

          const duration = (await durationCell.getText()).trim();

          let version = '';
          try {
            const versionLink = await versionCell.findElement(By.css('a'));
            version = (await versionLink.getText()).trim();
          } catch {
            version = (await versionCell.getText()).trim();
          }

          if (characters.length > 0 && duration && version) {
            releases.push({
              characters,
              duration,
              version,
            });
          }
        } catch (error) {
          logger.error('Error parsing version release row:', error);
        }
      }

      return releases;
    } catch (error) {
      logger.warn('Version releases table not found or error:', error);
      return [];
    }
  };

  const getCharacterImages = async (driver: WebDriver) => {
    logger.info(`Scraping images for ${character}...`);

    const imageCollection = await waitAndGetElement(
      driver,
      'div.pi-image-collection[data-source="image"]'
    );

    const imageLinks = await imageCollection.findElements(
      By.css('a.image.image-thumbnail')
    );

    const urlMap: Map<string, string> = new Map();

    for (const link of imageLinks) {
      const href = parseUrl(await link.getAttribute('href'));
      const title = (await link.getAttribute('title')).toLowerCase();

      if (title === 'card') {
        urlMap.set('card', href);
      } else if (title === 'wish') {
        urlMap.set('wish', href);
      } else if (title === 'in-game') {
        urlMap.set('inGame', href);
      }
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

      if (cells.length !== 3) {
        logger.warn(`Skipping row ${i} with ${cells.length} cells`);
        continue;
      }

      try {
        const talentIcon = parseUrl(
          await cells[0].findElement(By.css('a img')).getAttribute('data-src')
        );
        const talentName = await cells[1].getText();
        const talentType = await cells[2].getText();

        const { description, figureUrls, scaling } = await parseTalentTableRow(
          driver,
          rows[i + 1]
        );

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

  /**
   * Parses a single talent upgrade row containing level info and materials
   */
  const parseTalentUpgradeRow = async (
    row: WebElement
  ): Promise<TalentUpgrade | null> => {
    const cells = await row.findElements(By.css('td'));

    // Each upgrade row has exactly 2 tds
    if (cells.length !== 2) {
      return null;
    }

    const [levelCell, materialsCell] = cells;

    // Parse level range from first cell
    // HTML: "7 → 8<br>(5✦)" or just "1 → 2"
    const levelText = await levelCell.getText();
    const levelRange = levelText.split('\n')[0].trim(); // "7 → 8"

    // Extract ascension requirement if present (e.g., "(5✦)")
    const ascensionMatch = levelText.match(/\((\d+)✦\)/);
    const requiredAscension = ascensionMatch
      ? parseInt(ascensionMatch[1])
      : undefined;

    // Parse materials from second cell
    const materialCards = await materialsCell.findElements(
      By.css('div.card-container.mini-card')
    );

    const materials: UpgradeMaterial[] = [];

    for (const card of materialCards) {
      try {
        // Get material name from the image title attribute
        const img = await card.findElement(By.css('a img'));
        const name = await img.getAttribute('title');
        const iconUrl = parseUrl(await img.getAttribute('data-src'));

        // Get count from .card-text
        const countText = await card
          .findElement(By.css('.card-text'))
          .getText();
        const count = parseInt(countText.replace(/,/g, ''), 10);

        // Get cumulative total from .card-caption small if present
        let cumulative: number | undefined;
        try {
          const captionText = await card
            .findElement(By.css('.card-caption small'))
            .getText();
          // Extract number from "[502,500]"
          const cumulativeMatch = captionText.match(/\[([\d,]+)\]/);
          if (cumulativeMatch) {
            cumulative = parseInt(cumulativeMatch[1].replace(/,/g, ''), 10);
          }
        } catch {
          // Caption is optional
        }

        materials.push({
          name,
          iconUrl,
          count,
          ...(cumulative !== undefined && { cumulative }),
        });
      } catch (error) {
        logger.error('Error parsing material card:', error);
      }
    }

    return {
      levelRange,
      ...(requiredAscension !== undefined && { requiredAscension }),
      materials,
    };
  };

  /**
   * Scrapes all talent upgrade levels from the talent upgrade table
   */
  const getTalentUpgrades = async (
    driver: WebDriver
  ): Promise<TalentUpgrade[]> => {
    logger.info(`Scraping talent upgrades for ${character}...`);

    try {
      const table = await getTableFromHeading(
        driver,
        'Talent Level-Up Materials',
        'h3'
      );

      const rows = await table.findElements(By.css('tbody tr'));
      const upgrades: TalentUpgrade[] = [];

      for (const row of rows) {
        const upgrade = await parseTalentUpgradeRow(row);
        if (upgrade && upgrade.materials.length > 0) {
          logger.debug(
            `  - Level ${upgrade.levelRange}: ${upgrade.materials.length} materials`
          );
          upgrades.push(upgrade);
        }
      }

      logger.success(`Scraped ${upgrades.length} talent upgrade levels`);
      return upgrades;
    } catch (error) {
      logger.warn('Talent upgrades table not found or error:', error);
      return [];
    }
  };

  const scrapeCharacter = async (driver: WebDriver) => {
    const characterUrl = `${URL}/${character}`;
    logger.cyan(`\n=== Starting scrape for ${character} ===`);

    try {
      await driver.get(characterUrl);

      const [
        imageUrls,
        talents,
        constellations,
        version,
        talentUpgrades,
        versionReleases,
      ] = await Promise.all([
        getCharacterImages(driver),
        getTalents(driver),
        getConstellations(driver),
        getCharacterReleaseVersion(driver),
        getTalentUpgrades(driver),
        getVersionReleases(driver),
      ]);

      logger.success(`\n=== Completed scrape for ${character} ===\n`);
      return {
        talents,
        constellations,
        talentUpgrades,
        versionReleases,
        imageUrls,
        version,
      };
    } catch (error) {
      logger.error(`Failed to scrape ${character}:`, error);
    }
  };

  return await withWebDriver(scrapeCharacter);
}

async function parseTalentTableRow(driver: WebDriver, row: WebElement) {
  const clickTabByName = async (tabName: string): Promise<boolean> => {
    try {
      const tabs = await row.findElements(By.css('.wds-tabs__tab'));

      if (tabs.length === 0) {
        logger.debug(`No tabs found in row for ${tabName}`);
        return false;
      }

      for (const tab of tabs) {
        const tabText = await tab.getText();
        if (tabText.includes(tabName)) {
          await driver.executeScript(
            'arguments[0].scrollIntoView({behavior: "smooth", block: "center"}); arguments[0].click();',
            tab
          );
          logger.debug(`Clicked ${tabName} tab`);
          await driver.sleep(800);
          return true;
        }
      }

      logger.debug(`${tabName} tab not found in row`);
      return false;
    } catch (error) {
      logger.error(`Error clicking ${tabName} tab:`, error);
      return false;
    }
  };

  const getTalentDescription = async () => {
    try {
      await clickTabByName('Description');

      const paragraphs = await row.findElements(
        By.css('.wds-tab__content.wds-is-current p')
      );

      if (paragraphs.length > 0) {
        const description = await paragraphs[0].getText();
        if (description.trim()) {
          return description;
        }
      }

      const tableCells = await row.findElements(By.css('td[colspan="3"]'));

      if (tableCells.length > 0) {
        const description = await tableCells[0].getText();
        if (description.trim()) {
          return description;
        }
      }

      const anyCell = await row.findElements(
        By.css('.wds-tab__content.wds-is-current td')
      );

      if (anyCell.length > 0) {
        const description = await anyCell[0].getText();
        if (description.trim()) {
          return description;
        }
      }

      return 'No Description Found';
    } catch (error) {
      logger.error('Error in getTalentDescription:', error);
      return '';
    }
  };

  const getFigureUrls = async () => {
    try {
      await clickTabByName('Preview');

      let figures = await row.findElements(
        By.css('.wds-tab__content.wds-is-current figure.thumb')
      );

      if (figures.length === 0) {
        figures = await row.findElements(By.css('figure.thumb'));
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
  };

  const getTalentScaling = async () => {
    try {
      const tabFound = await clickTabByName('Attribute Scaling');

      if (!tabFound) {
        return {};
      }

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
  };

  return {
    description: await getTalentDescription(),
    figureUrls: await getFigureUrls(),
    scaling: await getTalentScaling(),
  };
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
    logger.error('No characters found');
    return;
  }

  await scrapeCharactersInDetail(characters, force);
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
    const filePath = path.join(detailedDir, `${name}.json`);

    if (!force && savedCharacters.includes(`${name}.json`)) {
      const isComplete = await isCharacterFileComplete(filePath);
      if (isComplete) {
        logger.info(`${char.name} already saved and complete`);
        continue;
      } else {
        logger.warn(
          `${char.name} file exists but is incomplete, re-scraping...`
        );
      }
    }

    try {
      const desc = await scrapeCharacterDetailed(name);
      await saveJson({ ...char, ...desc }, detailedDir, name);
    } catch (error) {
      logger.error(`Error scraping ${char.name}:`, error);
    }
  }
}

/**
 * Checks all characters from characters.json against individual character files
 * and reports missing properties for each character
 */
export async function checkCharacterCoverage(): Promise<void> {
  logger.cyan('\n=== Checking Character Coverage ===\n');

  const characters =
    await loadFromPublic<BaseCharacterSchema[]>(CHARACTERS_FILE_NAME);

  if (!characters) {
    logger.error('No characters found in characters.json');
    return;
  }

  const detailedDir = path.join(PUBLIC_DIR, 'characters');
  let allCovered = true;
  let totalChecked = 0;
  let totalComplete = 0;
  const incompleteCharacters: string[] = [];

  for (const char of characters) {
    const name = parseCharacterName(char.name);
    const filePath = path.join(detailedDir, `${name}.json`);
    totalChecked++;

    try {
      const content = await fs.readFile(filePath, 'utf-8');
      const data = JSON.parse(content);

      const result = advancedCharacterSchema.safeParse(data);

      if (!result.success) {
        allCovered = false;
        incompleteCharacters.push(char.name);
        logger.warn(`${char.name} is missing properties:`);
        result.error.issues.forEach((issue) => {
          logger.error(`  - ${issue.path.join('.')}: ${issue.message}`);
        });
      } else {
        totalComplete++;
      }
    } catch (error) {
      allCovered = false;
      incompleteCharacters.push(char.name);
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        logger.error(`${char.name} - file not found`);
      } else {
        logger.error(`${char.name} - error reading file:`, error);
      }
    }
  }

  logger.info(`Total characters checked: ${totalChecked}`);
  logger.success(`Complete characters: ${totalComplete}`);

  if (allCovered) {
    logger.success('\nAll characters covered!\n');
  } else {
    logger.warn(
      `Incomplete/Missing (${incompleteCharacters.length}): ${incompleteCharacters.join(', ')}\n`
    );
  }
}

/**
 * Scrapes character roles from the Character_Role wiki page.
 * Updates primitives.json with role definitions and character files with their roles.
 */
export async function scrapeCharacterRoles(): Promise<void> {
  const ROLE_URL = `${URL}/Character_Role`;

  const scrapeRoles = async (driver: WebDriver) => {
    logger.cyan('\n=== Scraping Character Roles ===\n');
    await driver.get(ROLE_URL);
    await driver.sleep(2000);

    // Step 1: Scrape role definitions from "List of Character Roles" table
    logger.info('Scraping role definitions...');
    const roleDefinitions: CharacterRole[] = [];

    try {
      const rolesTable = await getTableFromHeading(
        driver,
        'List of Character Roles',
        'h2'
      );
      const roleRows = await rolesTable.findElements(By.css('tbody tr'));

      for (const row of roleRows) {
        try {
          const cells = await row.findElements(By.css('td'));
          if (cells.length < 2) continue;

          // First cell has the icon
          const iconImg = await cells[0].findElement(By.css('img'));
          let iconUrl = await iconImg.getAttribute('data-src');
          if (!iconUrl) {
            iconUrl = await iconImg.getAttribute('src');
          }
          iconUrl = iconUrl?.split('/revision/')[0] || '';

          // Second cell has the role name
          const roleName = (await cells[1].getText()).trim();

          if (roleName && iconUrl) {
            roleDefinitions.push({ name: roleName, iconUrl });
            logger.debug(`  - Found role: ${roleName}`);
          }
        } catch (error) {
          logger.error('Error parsing role definition row:', error);
        }
      }

      logger.success(`Scraped ${roleDefinitions.length} role definitions`);
    } catch (error) {
      logger.error('Error scraping role definitions:', error);
    }

    // Step 2: Scrape character-role mappings from "Characters by Role" table
    logger.info('Scraping character role assignments...');
    const characterRolesMap = new Map<string, string[]>();

    try {
      const charactersTable = await getTableFromHeading(
        driver,
        'Characters by Role',
        'h2'
      );

      // Get header to determine role column indices
      const headerRow = await charactersTable.findElement(By.css('thead tr'));
      const headerCells = await headerRow.findElements(By.css('th'));
      const roleHeaders: string[] = [];

      // Skip first 2 columns (character name and element)
      for (let i = 2; i < headerCells.length; i++) {
        const headerText = (await headerCells[i].getText()).trim();
        roleHeaders.push(headerText);
      }

      logger.debug(`Role columns: ${roleHeaders.join(', ')}`);

      // Parse character rows
      const characterRows = await charactersTable.findElements(
        By.css('tbody tr')
      );

      for (const row of characterRows) {
        try {
          const cells = await row.findElements(By.css('td'));
          if (cells.length < 3) continue;

          // Get character name from first cell
          const characterCell = cells[0];
          const characterLink = await characterCell.findElement(By.css('a'));
          const characterName = (await characterLink.getText()).trim();

          // Skip Traveler characters
          if (
            characterName.toLowerCase().includes('traveler') ||
            characterName.toLowerCase().includes('aloy')
          ) {
            logger.debug(`  - Skipping: ${characterName}`);
            continue;
          }

          // Check role columns (skip element column at index 1)
          const roles: string[] = [];
          for (let i = 2; i < cells.length && i - 2 < roleHeaders.length; i++) {
            const cell = cells[i];
            const cellHtml = await cell.getAttribute('innerHTML');

            // Check for checkmark (✔) or "check-yes" class
            if (
              cellHtml.includes('check-yes') ||
              cellHtml.includes('✔') ||
              cellHtml.includes('data-sort-value="1"')
            ) {
              roles.push(roleHeaders[i - 2]);
            }
          }

          if (roles.length > 0) {
            characterRolesMap.set(characterName, roles);
            logger.debug(`  - ${characterName}: ${roles.join(', ')}`);
          }
        } catch (error) {
          logger.error('Error parsing character role row:', error);
        }
      }

      logger.success(`Scraped roles for ${characterRolesMap.size} characters`);
    } catch (error) {
      logger.error('Error scraping character roles:', error);
    }

    return { roleDefinitions, characterRolesMap };
  };

  const { roleDefinitions, characterRolesMap } =
    await withWebDriver(scrapeRoles);

  // Step 3: Update primitives.json with role definitions
  logger.info('Updating primitives.json with role definitions...');
  try {
    const primitives = await loadFromPublic<Primitives>('primitives');
    if (primitives) {
      primitives.roles = roleDefinitions;
      await saveToPublic(primitives, 'primitives');
      logger.success('Updated primitives.json with roles');
    }
  } catch (error) {
    logger.error('Error updating primitives.json:', error);
  }

  // Step 4: Update individual character files and characters.json
  logger.info('Updating character files with roles...');
  const detailedDir = path.join(PUBLIC_DIR, 'characters');

  // Update individual character files
  for (const [characterName, roles] of characterRolesMap) {
    const fileName = parseCharacterName(characterName);
    const filePath = path.join(detailedDir, `${fileName}.json`);

    try {
      const content = await fs.readFile(filePath, 'utf-8');
      const data = JSON.parse(content);
      data.roles = roles;
      await fs.writeFile(filePath, JSON.stringify(data, null, 4));
      logger.debug(`  - Updated ${fileName}.json`);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
        logger.error(`Error updating ${fileName}.json:`, error);
      }
    }
  }

  logger.info('Updating characters.json with roles...');
  try {
    const characters =
      await loadFromPublic<BaseCharacterSchema[]>(CHARACTERS_FILE_NAME);

    if (characters) {
      const updatedCharacters = characters.map((char) => {
        const roles = characterRolesMap.get(char.name);
        if (roles) {
          return { ...char, roles };
        }
        return char;
      });

      await saveToPublic(updatedCharacters, CHARACTERS_FILE_NAME);
      logger.success('Updated characters.json with roles');
    }
  } catch (error) {
    logger.error('Error updating characters.json:', error);
  }

  logger.success('\n=== Character roles scraping complete! ===\n');
}

async function main() {
  logger.info('Starting character scraping script...');
  const args = process.argv.slice(2);
  logger.info('Arguments:', args);

  if (args.length === 0) {
    console.dir('No arguments provided', {
      depth: null,
      colors: true,
    });

    logger.info('Usage: node characters.js --base --detailed --check --roles');
    return;
  }

  const scrapeCharactersBase = async (driver: WebDriver) => {
    await saveToPublic(
      await scrapeBaseCharactersTable(driver),
      CHARACTERS_FILE_NAME
    );
  };

  const saveCharactersDetailed = async () => {
    logger.info('Starting detailed character scraping...');
    await scrapeAndSaveDetailedCharacterInfo(false);
    logger.info('Detailed character scraping complete');
  };

  if (args.includes('--base')) {
    await withWebDriver(scrapeCharactersBase);
  }

  if (args.includes('--detailed')) {
    await saveCharactersDetailed();
  }

  if (args.includes('--check')) {
    await checkCharacterCoverage();
  }

  if (args.includes('--roles')) {
    await scrapeCharacterRoles();
  }
}

const isMainModule =
  process.argv[1] && import.meta.url.includes(path.basename(process.argv[1]));
if (isMainModule) {
  await main();
}
