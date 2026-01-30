import * as fs from 'node:fs/promises';
import path from 'node:path';

import chalk from 'chalk';
import { By, WebDriver, WebElement } from 'selenium-webdriver';
import { z } from 'zod';

import { logger } from '../logger.js';
import {
  cleanupTempFiles,
  listFiles,
  loadFromPublic,
  loadJsonData,
  PUBLIC_DIR,
  saveFileWithNewVersion,
  saveJson,
  saveToPublic,
  saveToTemp,
} from './fileio.js';
import { weaponSchema, weaponTypeSchema } from './schema.js';
import {
  handleCloudflareChallenge,
  setupDriver,
  URL,
  waitForElementCss,
  waitForPageLoad,
  withWebDriver,
} from './setup.js';
import {
  findImageInCell,
  getTableFromHeading,
  parseCharacterName,
  parseUrl,
  underScore,
} from './utils.js';

const WEAPON_FILE_NAME = 'weapons';

type WeaponType = z.infer<typeof weaponTypeSchema>;
type Weapon = z.infer<typeof weaponSchema>;
type BaseWeaponType = Omit<Weapon, 'passives' | 'materials' | 'images'>;

const WEAPON_TYPES: WeaponType[] = [
  'Sword',
  'Claymore',
  'Polearm',
  'Bow',
  'Catalyst',
] as const;

const nations = [
  'Mondstadt',
  'Liyue',
  'Inazuma',
  'Sumeru',
  'Fontaine',
  'Natlan',
  'NodKrai',
] as const;
type Nation = (typeof nations)[number];

type MaterialCalendar = {
  day: string;
  images: { url: string; caption: string }[];
  weapons: string[];
};

/**
 * Scrapes weapon ascension material data from the Genshin Impact wiki.
 * This function loads the material farming schedule for each nation, including:
 * - Which days the materials are available
 * - Images and names of the materials
 * - List of weapons that use those materials
 *
 * The data is organized by nation (Mondstadt, Liyue, etc) and then by day of the week.
 *
 * @returns {Promise<Record<Nation, MaterialCalendar[]>>} A Promise that resolves to an object mapping each nation to their material calendar data.
 * Each nation's calendar contains an array of material groups, with each group containing:
 * - day: The days these materials are available (e.g. "Monday/Thursday")
 * - images: Array of material images with URLs and captions
 * - weapons: Array of weapon names that use these materials
 */
export async function loadMaterialCalendar(): Promise<
  Record<Nation, MaterialCalendar[]>
> {
  const driver = await setupDriver();
  const url =
    'https://genshin-impact.fandom.com/wiki/Weapon_Ascension_Material';
  await driver.get(url);

  const result: Record<Nation, MaterialCalendar[]> = {
    Mondstadt: [],
    Liyue: [],
    Inazuma: [],
    Sumeru: [],
    Fontaine: [],
    Natlan: [],
    NodKrai: [],
  };

  for (const nation of nations) {
    const selector = `span#${nation}`;
    await waitForElementCss(driver, selector);
    const table = await driver
      .findElement(By.css(selector))
      .findElement(By.xpath('..'))
      .findElement(By.xpath('following-sibling::table'));

    const rows = await table.findElements(By.css('tr'));
    result[nation] = (
      await Promise.all(
        rows.map(async (row: WebElement) => {
          const cells = await row.findElements(By.css('td'));
          if (cells.length === 3) {
            const day = await cells[0].getText();
            const materialImages = await cells[1].findElements(By.css('img'));
            const images = (
              await Promise.all(
                materialImages.map(async (img: WebElement) => {
                  const src = await img.getAttribute('data-src');
                  return {
                    url: parseUrl(src),
                    caption: await img.getAttribute('alt'),
                  };
                })
              )
            ).filter((item) => !item.caption.includes('Quality'));

            const weapons = await cells[2].findElements(By.css('a'));
            const weaponNames = await Promise.all(
              weapons.map(async (weapon: WebElement) =>
                weapon.getAttribute('title')
              )
            );

            return {
              day,
              images,
              weapons: weaponNames,
            };
          }
          return undefined;
        })
      )
    ).filter((item): item is MaterialCalendar => item !== undefined);
  }

  await driver.quit();
  return result;
}

/**
 * Extracts detailed weapon data including material images and captions from a weapon's page.
 * @param {WebDriver} driver - The Selenium WebDriver instance.
 * @param {string} weaponName - The name of the weapon to extract data for.
 */
async function extractEachWeaponData(driver: WebDriver, weaponName: string) {
  const name = encodeURIComponent(underScore(weaponName));
  const url = `${URL}/${name}`;

  await driver.get(url);
  logger.debug(`  ↳ Navigated to ${weaponName} page`);

  // Wait for the page to fully load before looking for elements
  await waitForPageLoad(driver);
  logger.debug(`  ↳ Page loaded completely`);

  // Check for and handle Cloudflare challenge
  await handleCloudflareChallenge(driver);

  // Scroll down to trigger any lazy-loaded content
  await driver.executeScript(
    'window.scrollTo(0, document.body.scrollHeight / 2);'
  );
  await driver.sleep(1000);
  logger.debug(`  ↳ Scrolled to trigger lazy loading`);

  const selector = 'span.card-list-container';
  await waitForElementCss(driver, selector);

  const container = await driver.findElement(By.css(selector));
  const materials = await Promise.all(
    (await container.findElements(By.css('div.card-container'))).map(
      async (card) => {
        const imageUrl = await card
          .findElement(By.css('img'))
          .getAttribute('data-src');

        const caption = await card
          .findElement(By.css('span.card-caption'))
          .getText();

        return {
          url: parseUrl(imageUrl),
          caption,
        };
      }
    )
  );
  logger.debug(`  ↳ Extracted ${materials.length} materials`);

  const tabSelector = 'li.wds-tabs__tab';
  const tabs = await driver.findElements(By.css(tabSelector));

  const passives = [];
  const refinementTabs = tabs.slice(4, tabs.length);
  logger.debug(`  ↳ Found ${refinementTabs.length} refinement levels`);

  for (const tab of refinementTabs) {
    await driver.executeScript('arguments[0].click();', tab);
    const weaponContent = await driver
      .findElement(By.css('div.wds-tab__content.wds-is-current td'))
      .getText();
    passives.push(weaponContent);
  }
  logger.debug(`  ↳ Extracted ${passives.length} passive descriptions`);

  const images = await getWeaponImages(driver);
  logger.debug(`  ↳ Collected ${images.length} images`);

  // Extract ascension data
  logger.info(`  ↳ Extracting ascension data...`);
  const ascension = await extractWeaponAscensionData(driver, weaponName);
  if (ascension) {
    logger.success(`  ↳ Extracted ${ascension.phases.length} ascension phases`);
  } else {
    logger.warn(
      `  ↳ No ascension data found (may be expected for some weapons)`
    );
  }

  return {
    materials,
    passives,
    images,
    ascension,
  };
}

/**
 * Retrieves a list of image URLs associated with a weapon from the web page.
 * This function navigates through the weapon's image collection on the page,
 * extracts the URLs of all images, and includes a specific image for weapon details.
 *
 * @param {WebDriver} driver - The Selenium WebDriver instance used to interact with the web page.
 * @returns {Promise<string[]>} A promise that resolves to an array of image URLs.
 */
async function getWeaponImages(driver: WebDriver): Promise<string[]> {
  const selector = 'div.pi-image-collection';
  await waitForElementCss(driver, selector);

  const imageContainer = await driver.findElement(By.css(selector));
  const imageElements = await imageContainer.findElements(By.css('img'));

  logger.debug(`    ↳ Found ${imageElements.length} images in collection`);

  const images = await Promise.all(
    imageElements.map(async (imageElement) => {
      const image = await imageElement.getAttribute('src');
      return parseUrl(image);
    })
  );

  try {
    const weaponDetailsImage = await driver.findElement(
      By.css("img[alt='Weapon Details Announcement']")
    );
    const weaponDetailsImageUrl =
      await weaponDetailsImage.getAttribute('data-src');
    images.push(parseUrl(weaponDetailsImageUrl));
    logger.debug(`    ↳ Added weapon details announcement image`);
  } catch {
    logger.debug(`    ↳ No weapon details announcement image found`);
  }

  return images;
}

/**
 * Parses stat values that may contain percentages or decimals
 * Examples: "44.1%", "198", "9.6%"
 */
function parseStatValue(text: string): number {
  const cleaned = text.trim().replace('%', '');
  return parseFloat(cleaned);
}

/**
 * Extracts ascension materials and mora cost from a cost cell
 */
async function extractAscensionCost(
  driver: WebDriver,
  costCell: WebElement
): Promise<{
  mora: number;
  materials: Array<{ url: string; caption: string; count: number }>;
}> {
  try {
    // Expand collapsible section if needed
    const collapsed = await costCell.getAttribute('class');
    if (collapsed?.includes('mw-collapsed')) {
      try {
        const toggle = await costCell.findElement(
          By.css('.mw-collapsible-toggle')
        );
        await driver.executeScript('arguments[0].click();', toggle);
        await driver.sleep(500); // Wait for expansion
      } catch {
        logger.debug(`    ↳ No collapsible toggle found or couldn't click`);
      }
    }

    // Extract Mora amount
    const fullText = await costCell.getText();
    const moraMatch = fullText.match(/(\d{1,3}(?:,\d{3})*)\s*Mora/i);
    const mora = moraMatch ? parseInt(moraMatch[1].replace(/,/g, '')) : 0;

    // Extract material cards
    const materialCards = await costCell.findElements(
      By.css('div.card-container, span.card-wrapper')
    );

    const materials: Array<{ url: string; caption: string; count: number }> =
      [];

    for (const card of materialCards) {
      try {
        // Get image
        const img = await card.findElement(By.css('img'));
        const imageUrl =
          (await img.getAttribute('data-src')) ||
          (await img.getAttribute('src'));

        // Get caption/name
        const caption = await img.getAttribute('alt');

        // Get count from card text (e.g., "×5" or "x3")
        const cardText = await card.getText();
        const countMatch = cardText.match(/[×x](\d+)/i);
        const count = countMatch ? parseInt(countMatch[1]) : 1;

        // Skip Mora card (already extracted)
        if (caption.toLowerCase().includes('mora')) continue;

        materials.push({
          url: parseUrl(imageUrl),
          caption: caption.replace(/[×x]\d+/gi, '').trim(),
          count,
        });
      } catch (error) {
        logger.debug(`    ⚠ Failed to parse material card: ${error}`);
      }
    }

    return { mora, materials };
  } catch (error) {
    logger.debug(`  ⚠ Error extracting materials: ${error}`);
    return { mora: 0, materials: [] };
  }
}

/**
 * Parses a single ascension row to extract level and stat data
 */
async function parseAscensionRow(
  cells: WebElement[],
  phaseNumber: number
): Promise<{
  phase: number;
  levelRange: string;
  baseAttack: { min: number; max: number };
  subStat: { min?: number; max?: number };
  mora?: number;
  materials?: Array<{ url: string; caption: string; count: number }>;
} | null> {
  try {
    // Expected structure: [Phase, Level, Base ATK, Sub-stat]
    // But we need to handle rowspan for phase column

    let cellIndex = 0;

    // Check if this row has a phase indicator (rowspan=2)
    const hasPhaseCell = await cells[0].getAttribute('rowspan');
    if (hasPhaseCell) cellIndex = 1;

    // Extract level range (e.g., "1/20", "20/20")
    const levelRange = await cells[cellIndex].getText();

    // Extract base ATK
    const baseAtkText = await cells[cellIndex + 1].getText();
    const baseAtk = parseFloat(baseAtkText);

    // Extract sub-stat (may be percentage or flat value)
    let subStat: number | undefined;
    if (cells.length > cellIndex + 2) {
      const subStatText = await cells[cellIndex + 2].getText();
      subStat = subStatText ? parseStatValue(subStatText) : undefined;
    }

    return {
      phase: phaseNumber,
      levelRange,
      baseAttack: { min: baseAtk, max: baseAtk },
      subStat: { min: subStat, max: subStat },
      mora: undefined,
      materials: undefined,
    };
  } catch (error) {
    logger.debug(`  ⚠ Error parsing row: ${error}`);
    return null;
  }
}

/**
 * Extracts weapon ascension table data from the wiki page
 * @param driver - Selenium WebDriver instance
 * @param weaponName - Name of the weapon for logging
 * @returns Ascension data with all 7 phases, or null if extraction fails
 */
async function extractWeaponAscensionData(
  driver: WebDriver,
  weaponName: string
): Promise<{
  phases: Array<{
    phase: number;
    levelRange: string;
    baseAttack: { min: number; max: number };
    subStat: { min?: number; max?: number };
    mora?: number;
    materials?: Array<{ url: string; caption: string; count: number }>;
  }>;
} | null> {
  try {
    logger.debug('  ↳ Locating ascension table...');

    // Find table with "Ascension" heading
    const table = await getTableFromHeading(driver, 'Ascension');
    const rows = await table.findElements(By.css('tbody tr'));

    logger.debug(`  ↳ Found ${rows.length} table rows`);

    const phases: Array<{
      phase: number;
      levelRange: string;
      baseAttack: { min: number; max: number };
      subStat: { min?: number; max?: number };
      mora?: number;
      materials?: Array<{ url: string; caption: string; count: number }>;
    }> = [];
    let currentPhase = 0;

    // Parse rows in pairs (min level + max level for each phase)
    for (let i = 0; i < rows.length; i++) {
      const cells = await rows[i].findElements(By.css('td'));

      // Skip header rows and ascension cost rows
      if (cells.length === 0 || cells.length === 1) continue;

      // Check if this row has a phase indicator (rowspan=2)
      const hasPhaseCell = await cells[0].getAttribute('rowspan');

      if (hasPhaseCell === '2') {
        // This is the min level row for a new phase
        const minData = await parseAscensionRow(cells, currentPhase);

        // Get the next row for max level
        i++;
        if (i >= rows.length) break;

        const maxCells = await rows[i].findElements(By.css('td'));
        const maxData = await parseAscensionRow(maxCells, currentPhase);

        if (minData && maxData) {
          // Combine min and max data into a single phase
          const phaseData = {
            phase: currentPhase,
            levelRange: `${minData.levelRange}/${maxData.levelRange.split('/')[1]}`,
            baseAttack: {
              min: minData.baseAttack.min,
              max: maxData.baseAttack.max,
            },
            subStat: {
              min: minData.subStat.min,
              max: maxData.subStat.max,
            },
            mora: undefined as number | undefined,
            materials: undefined as
              | Array<{ url: string; caption: string; count: number }>
              | undefined,
          };

          // Check if next row is ascension cost
          if (i + 1 < rows.length) {
            const nextCells = await rows[i + 1].findElements(By.css('td'));
            if (nextCells.length === 1) {
              // This is an ascension cost row
              const materials = await extractAscensionCost(
                driver,
                nextCells[0]
              );
              phaseData.mora = materials.mora;
              phaseData.materials = materials.materials;
              i++; // Skip the cost row
            }
          }

          phases.push(phaseData);
          currentPhase++;
        }
      }
    }

    // Validate phase count
    if (phases.length < 7) {
      logger.warn(
        `  ⚠ Expected 7 phases, got ${phases.length} for ${weaponName}`
      );
    }

    // Validate each phase has required data
    phases.forEach((phase, idx) => {
      if (!phase.baseAttack.min || !phase.baseAttack.max) {
        logger.error(`  ✗ Phase ${idx} missing base ATK data`);
      }
    });

    logger.success(`  ↳ Extracted ${phases.length} ascension phases`);
    return { phases };
  } catch (error) {
    logger.error(`  ✗ Failed to extract ascension data: ${error}`);
    return null;
  }
}

/**
 * Scrapes detailed weapon data from a weapon's individual wiki page.
 * Creates a new WebDriver instance for each weapon scrape.
 * Uses visible browser mode to avoid anti-bot detection.
 *
 * @param weaponName - The name of the weapon to scrape detailed data for
 * @returns Promise resolving to detailed weapon data including materials, passives, and images
 */
export async function scrapeWeaponDetailed(weaponName: string) {
  // Force visible browser mode to avoid anti-bot detection
  return await withWebDriver(async (driver: WebDriver) => {
    const name = encodeURIComponent(underScore(weaponName));
    const weaponUrl = `${URL}/${name}`;

    try {
      logger.cyan(`🔍 Scraping: ${weaponName}`);
      await driver.get(weaponUrl);

      const { materials, passives, images } = await extractEachWeaponData(
        driver,
        weaponName
      );

      logger.success(`✓ ${weaponName} scraped successfully`);

      return {
        materials,
        passives,
        images,
      };
    } catch (error) {
      logger.error(`✗ Error scraping ${weaponName}:`, error);
      throw error;
    }
  }, true); // Force visible mode
}

/**
 * Scrapes detailed information for each weapon and saves it to individual files.
 * After scraping all weapons, combines the files into a single detailed weapons file.
 * Each weapon gets its own WebDriver instance for isolated scraping.
 *
 * @param weapons - Array of base weapon data to scrape details for
 * @param force - If true, scrapes all weapons even if they were previously saved.
 *               If false, skips weapons that already have saved data.
 * @returns Promise that resolves when all weapons have been scraped and saved
 */
export async function scrapeWeaponsInDetail(
  weapons: BaseWeaponType[],
  force: boolean = false
) {
  const detailedDir = path.join(PUBLIC_DIR, 'weapons');

  // Ensure the weapons directory exists
  try {
    await fs.access(detailedDir);
    logger.debug(`📁 Using existing directory: ${detailedDir}`);
  } catch {
    await fs.mkdir(detailedDir, { recursive: true });
    logger.info(`📁 Created directory: ${detailedDir}`);
  }

  const savedWeapons = await listFiles(detailedDir);
  const toScrape = force
    ? weapons
    : weapons.filter((w) => !savedWeapons.includes(parseCharacterName(w.name)));

  logger.info(`\n📊 Processing: ${toScrape.length}/${weapons.length} weapons`);
  if (!force && savedWeapons.length > 0) {
    logger.debug(
      `⏭️  Skipping ${weapons.length - toScrape.length} already saved weapons`
    );
  }

  let successCount = 0;
  let errorCount = 0;

  for (let i = 0; i < toScrape.length; i++) {
    const weapon = toScrape[i];
    const name = parseCharacterName(weapon.name);

    try {
      logger.cyan(`\n[${i + 1}/${toScrape.length}] ${weapon.name}`);
      const detailedData = await scrapeWeaponDetailed(weapon.name);

      const fullWeaponData = {
        ...weapon,
        ...detailedData,
      };

      await saveJson(fullWeaponData, detailedDir, name);
      logger.success(`💾 Saved: ${weapon.name}`);
      successCount++;
    } catch (error) {
      logger.error(`✗ Failed to scrape ${weapon.name}:`, error);
      errorCount++;
    }
  }

  logger.info(`\n📈 Summary: ${successCount} succeeded, ${errorCount} failed`);
  await morphAllFilesIntoOne();
}

/**
 * Combines all individual weapon detail files into a single file.
 * Reads each weapon's detailed data file from the weapons subdirectory,
 * combines them into a single object keyed by weapon name,
 * and saves the combined data to a versioned file.
 *
 * @remarks
 * The individual files are read from PUBLIC_DIR/weapons/
 * The combined file is saved to PUBLIC_DIR/weapons_detailed{version}.json
 *
 * @returns Promise that resolves when the combined file has been saved
 */
async function morphAllFilesIntoOne() {
  let weaponsDetailed: Record<string, Weapon> = {};
  const weaponsDir = path.join(PUBLIC_DIR, 'weapons');

  // Ensure the weapons directory exists
  try {
    await fs.access(weaponsDir);
  } catch {
    await fs.mkdir(weaponsDir, { recursive: true });
    logger.info(`📁 Created directory: ${weaponsDir}`);
  }

  const files = await listFiles(weaponsDir);
  logger.info(
    `\n📦 Combining ${files.length} weapon files into weapons_detailed.json...`
  );

  let combinedCount = 0;
  for (const file of files) {
    const weapon = await loadJsonData<Weapon>(path.join(weaponsDir, file));

    if (weapon) {
      weaponsDetailed = {
        ...weaponsDetailed,
        [weapon.name]: weapon,
      };
      combinedCount++;
    } else {
      logger.warn(`⚠️  Failed to load ${file}`);
    }
  }

  logger.debug(
    `  ↳ Successfully loaded ${combinedCount}/${files.length} weapon files`
  );

  await saveFileWithNewVersion(weaponsDetailed, PUBLIC_DIR, 'weapons_detailed');

  logger.success(
    `✨ Combined ${combinedCount} weapons into weapons_detailed.json!`
  );
}

/**
 * Scrapes weapon data from the Genshin Impact wiki for a specific weapon type.
 * @param {WebDriver} driver - The Selenium WebDriver instance.
 * @param {WeaponType} weapon - The weapon type to scrape.
 */
async function scrapeWeaponsTable(driver: WebDriver, weapon: WeaponType) {
  logger.info(`⚔️  Scraping ${weapon} weapons...`);

  const getWeaponsTable = async () => {
    const weaponUrl = `${URL}/${weapon}`;
    await driver.get(weaponUrl);
    logger.debug(`  ↳ Navigating to ${weapon} page`);
    const table = await getTableFromHeading(driver, `List of ${weapon}s`);
    logger.debug(`  ↳ Found weapons table`);
    return table;
  };

  const parseTableRow = async (row: WebElement): Promise<BaseWeaponType> => {
    const cells = await row.findElements(By.css('td'));
    const texts = await Promise.all(cells.map((cell) => cell.getText()));
    const [image, quality] = await Promise.all([
      findImageInCell(cells[0]),
      cells[2].findElement(By.css('img')).getAttribute('alt'),
    ]);
    texts[0] = parseUrl(image);

    const weapon = {
      name: texts[1],
      rarity: Number.parseInt(quality.split(' ')[0]),
      attack: Number.parseInt(texts[3].split(' ')[0]),
      subStat: texts[4].split('\n')[0],
      effect: texts[5],
      iconUrl: parseUrl(texts[0]),
    };
    return weapon;
  };

  try {
    const table = await getWeaponsTable();
    const rowElements = await table.findElements(By.css('tr'));
    logger.debug(`  ↳ Parsing ${rowElements.length - 1} weapon rows`);
    const rows = await Promise.all(rowElements.slice(1).map(parseTableRow));
    logger.success(`✓ Scraped ${rows.length} ${weapon} weapons`);
    return rows;
  } catch (error) {
    logger.error(`✗ Error scraping ${weapon}:`, error);
    return null;
  }
}

/**
 * Scrapes and saves detailed weapon information for weapons that haven't been processed yet.
 */
const scrapeAndSaveDetailedWeaponInfo = async (
  force: boolean = false
): Promise<void> => {
  logger.info('📂 Loading weapons data from weapons.json...');
  const weaponsData =
    await loadFromPublic<Record<WeaponType, BaseWeaponType[]>>(
      WEAPON_FILE_NAME
    );

  if (!weaponsData) {
    logger.error(
      '❌ No weapons found in weapons.json. Run with --base flag first.'
    );
    return;
  }

  // Flatten all weapon types into a single array
  const allWeapons: BaseWeaponType[] = [];
  for (const weaponType of WEAPON_TYPES) {
    if (weaponsData[weaponType]) {
      allWeapons.push(...weaponsData[weaponType]);
      logger.debug(
        `  ↳ ${weaponType}: ${weaponsData[weaponType].length} weapons`
      );
    }
  }

  logger.info(`🗡️  Found ${allWeapons.length} total weapons to process`);
  await scrapeWeaponsInDetail(allWeapons, force);
};

/**
 * Main function to scrape and save weapon data.
 * Supports CLI flags:
 * --base: Scrapes basic weapon data from weapon type tables
 * --detailed: Scrapes detailed data for individual weapons
 */
async function main() {
  logger.log('\n' + chalk.bold.cyan('⚔️  Weapon Scraping Script') + '\n');
  const args = process.argv.slice(2);

  if (args.length === 0) {
    logger.warn('⚠️  No arguments provided\n');
    logger.log(chalk.white('Usage:'));
    logger.log(
      chalk.gray('  node weapons.js --base      ') +
        chalk.dim('# Scrape basic weapon data')
    );
    logger.log(
      chalk.gray('  node weapons.js --detailed  ') +
        chalk.dim('# Scrape detailed weapon data')
    );
    logger.log(
      chalk.gray('  node weapons.js --base --detailed') +
        chalk.dim('# Scrape both\n')
    );
    return;
  }

  logger.info(`📋 Running with flags: ${args.join(', ')}\n`);

  const scrapeWeaponsBase = async (driver: WebDriver) => {
    logger.info('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    logger.info('📊 PHASE 1: Base Weapon Data Scraping');
    logger.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    const tempLocations: Array<[WeaponType, string]> = [];
    let totalWeapons = 0;

    const scrapeWeaponType = async (weapon: WeaponType) => {
      const data = await scrapeWeaponsTable(driver, weapon);

      if (!data) {
        logger.error(`❌ No data scraped for weapon type: ${weapon}`);
        return;
      }

      totalWeapons += data.length;
      const tempLoc = await saveToTemp(data, `weapon-${weapon}`);
      tempLocations.push([weapon, tempLoc]);
      logger.debug(`  ↳ Saved to temp: ${tempLoc}`);
    };

    // Scrape all weapon types
    logger.info(`🔄 Scraping ${WEAPON_TYPES.length} weapon types...\n`);
    for (let i = 0; i < WEAPON_TYPES.length; i++) {
      const wepType = WEAPON_TYPES[i];
      logger.cyan(`[${i + 1}/${WEAPON_TYPES.length}] ${wepType}`);
      await scrapeWeaponType(wepType);
    }

    // Merge all weapon types into a single file
    logger.info(`\n📦 Merging ${tempLocations.length} weapon type files...`);
    const weapons: Record<string, BaseWeaponType[]> = {};
    for (const [weaponType, location] of tempLocations) {
      const schema = await loadJsonData<BaseWeaponType[]>(location);
      if (!schema) continue;
      weapons[weaponType] = schema;
      logger.debug(`  ↳ Loaded ${schema.length} ${weaponType} weapons`);
    }

    await saveToPublic(weapons, WEAPON_FILE_NAME);
    logger.success(`💾 Saved to public/${WEAPON_FILE_NAME}.json`);

    await cleanupTempFiles();
    logger.debug('🧹 Cleaned up temporary files');

    logger.success(
      `\n✨ Base scraping complete! Total weapons: ${totalWeapons}\n`
    );
  };

  const saveWeaponsDetailed = async () => {
    logger.info('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    logger.info('🔍 PHASE 2: Detailed Weapon Data Scraping');
    logger.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    await scrapeAndSaveDetailedWeaponInfo(true);

    logger.success('\n✨ Detailed scraping complete!\n');
  };

  const startTime = Date.now();

  if (args.includes('--base')) {
    await withWebDriver(scrapeWeaponsBase);
  }

  if (args.includes('--detailed')) {
    await saveWeaponsDetailed();
  }

  const duration = ((Date.now() - startTime) / 1000).toFixed(2);
  logger.success(`\n✅ All tasks completed in ${duration}s\n`);
}

const isMainModule =
  process.argv[1] && import.meta.url.includes(path.basename(process.argv[1]));
if (isMainModule) {
  main().catch((error) => {
    logger.error('\n❌ Fatal error:', error);
    process.exit(1);
  });
}
