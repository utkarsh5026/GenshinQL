import * as fs from 'node:fs/promises';
import path from 'node:path';

import chalk from 'chalk';
import { By, WebDriver, WebElement } from 'selenium-webdriver';
import { z } from 'zod';

import { logger } from '../logger.js';
import {
  cleanupTempFiles,
  ensureDir,
  listFiles,
  loadFromPublic,
  loadJsonData,
  PUBLIC_DIR,
  saveJson,
  saveToPublic,
  saveToTemp,
} from './fileio.js';
import {
  weaponAscensionPhaseSchema,
  weaponSchema,
  weaponTypeSchema,
} from './schema.js';
import {
  getImageUrl,
  parseMaterialCards,
  parseUrl,
  safeExecute,
  scrapeTable,
} from './scraping-helpers.js';
import {
  handleCloudflareChallenge,
  setupDriver,
  URL,
  waitForPageLoad,
  withWebDriver,
} from './setup.js';
import {
  findImageInCell,
  getTableFromHeading,
  parseCharacterName,
  underScore,
  waitAndGetElement,
} from './utils.js';

const WEAPON_FILE_NAME = 'weapons';
const WEAPON_CALENDAR_FILE_NAME = 'weaponCalendar';

type WeaponType = z.infer<typeof weaponTypeSchema>;
type WeaponAscensionPhase = z.infer<typeof weaponAscensionPhaseSchema>;
type Weapon = z.infer<typeof weaponSchema>;
type BaseWeaponType = Omit<Weapon, 'passives' | 'materials' | 'images'>;

type WeaponsFileData = {
  nations: string[];
  days: string[];
  weapons: Record<string, OptimizedWeaponData[]>;
};

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
  weapons: { name: string; url: string }[];
};

type OptimizedWeaponData = BaseWeaponType & {
  nation?: number;
  weekdays?: number;
};

type WeaponMapping = {
  nation: string;
  day: string;
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
 */
async function loadMaterialCalendar(): Promise<
  Record<Nation, MaterialCalendar[]>
> {
  const driver = await setupDriver();
  await driver.get(
    'https://genshin-impact.fandom.com/wiki/Weapon_Ascension_Material'
  );

  const extractMaterialData = async (row: WebElement) => {
    const cells = await row.findElements(By.css('td'));
    if (cells.length !== 3) {
      return undefined;
    }

    const day = await cells[0].getText();
    const imgs = await cells[1].findElements(By.css('img'));
    const images = (
      await Promise.all(
        imgs.map(async (img) => {
          const caption = await img.getAttribute('alt');
          return {
            url: await getImageUrl(img),
            caption,
          };
        })
      )
    ).filter((item) => !item.caption.includes('Quality'));

    const weapons = await cells[2].findElements(By.css('a'));
    const weaponData = await Promise.all(
      weapons.map(async (weapon: WebElement) => {
        const name = await weapon.getAttribute('title');
        const img = await weapon.findElement(By.css('img'));
        return {
          name,
          url: await getImageUrl(img),
        };
      })
    );

    return {
      day,
      images,
      weapons: weaponData,
    };
  };

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
    const table = await getTableFromHeading(
      driver,
      nation === 'NodKrai' ? 'Nod-Krai' : nation,
      'h3'
    );

    const rows = await table.findElements(By.css('tr'));
    result[nation] = (await Promise.all(rows.map(extractMaterialData))).filter(
      (item): item is MaterialCalendar => item !== undefined
    );
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
  const extractWeaponPassives = async () => {
    const tabs = await driver.findElements(By.css('li.wds-tabs__tab'));
    const passives = [];
    for (const tab of tabs.slice(4, tabs.length)) {
      await driver.executeScript('arguments[0].click();', tab);
      const weaponContent = await driver
        .findElement(By.css('div.wds-tab__content.wds-is-current td'))
        .getText();
      passives.push(weaponContent);
    }
    return passives;
  };

  const extractWeaponMaterials = async () => {
    const container = await waitAndGetElement(
      driver,
      'span.card-list-container'
    );
    return await parseMaterialCards(container, 'div.card-container');
  };

  const getWeaponImages = async () => {
    const imageContainer = await waitAndGetElement(
      driver,
      'div.pi-image-collection'
    );
    const imageElements = await imageContainer.findElements(By.css('img'));
    const images = await Promise.all(
      imageElements.map((img) => getImageUrl(img, 'src'))
    );

    const detailsImage = await safeExecute(
      async () => {
        const img = await driver.findElement(
          By.css("img[alt='Weapon Details Announcement']")
        );
        return await getImageUrl(img);
      },
      'No weapon details announcement image found',
      null
    );
    return detailsImage ? [...images, detailsImage] : images;
  };

  await waitForPageLoad(driver);

  await handleCloudflareChallenge(driver);
  await driver.executeScript(
    'window.scrollTo(0, document.body.scrollHeight / 2);'
  );
  await driver.sleep(1000);

  const [materials, passives, images, ascension] = await Promise.all([
    extractWeaponMaterials(),
    extractWeaponPassives(),
    getWeaponImages(),
    extractWeaponAscensionData(driver, weaponName),
  ]);

  logger.debug(`Extracted ${passives.length} passive descriptions`);
  logger.debug(`Extracted ${materials.length} materials`);
  logger.debug(`Collected ${images.length} images`);

  return {
    materials,
    passives,
    images,
    ascension,
  };
}

/**
 * Extracts ascension materials and mora cost from a cost cell
 */
async function extractAscensionCost(costCell: WebElement): Promise<{
  mora: number;
  materials: Array<{ url: string; caption: string; count: number }>;
}> {
  const parseMaterial = async (matCell: WebElement) => {
    return await safeExecute(
      async () => {
        const img = await matCell.findElement(By.css('img'));
        const [caption, cardCount] = await Promise.all([
          img.getAttribute('alt'),
          matCell.findElement(By.css('span.card-text')),
        ]);

        const url = await getImageUrl(img);
        const count = Number.parseInt(await cardCount.getText());

        return {
          url,
          caption: caption.replace(/[×x]\d+/gi, '').trim(),
          count,
        };
      },
      'Failed to parse material card',
      null
    );
  };

  const extractMora = async (moraCard: WebElement) => {
    return await safeExecute(
      async () => {
        const moraCountText = await moraCard
          .findElement(By.css('span.card-text'))
          .getText();
        return Number.parseInt(moraCountText.replace(/,/g, ''));
      },
      'Failed to parse mora card',
      0
    );
  };

  const scrape = async () => {
    const matCards = await costCell.findElements(By.css('div.card-container'));
    const mora = matCards.length > 0 ? await extractMora(matCards[0]) : 0;

    const materials = (
      await Promise.all(matCards.slice(1).map(parseMaterial))
    ).filter(
      (m): m is { url: string; caption: string; count: number } => m !== null
    );

    return { mora, materials };
  };

  return await safeExecute(scrape, 'Error extracting ascension materials', {
    mora: 0,
    materials: [],
  });
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
  const parseStatValue = (text: string) => {
    const cleaned = text.trim().replace('%', '');
    return parseFloat(cleaned);
  };

  try {
    let cellIndex = 0;
    const hasPhaseCell = await cells[0].getAttribute('rowspan');
    if (hasPhaseCell) cellIndex = 1;

    const levelRange = await cells[cellIndex].getText();
    const baseAtkText = await cells[cellIndex + 1].getText();
    const baseAtk = parseFloat(baseAtkText);

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
    logger.debug(`Error parsing row: ${error}`);
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
  phases: Array<WeaponAscensionPhase>;
} | null> {
  try {
    logger.debug('Locating ascension table...');

    const table = await getTableFromHeading(driver, 'Ascensions and Stats');
    const rows = await table.findElements(By.css('tbody tr'));

    logger.debug(`  ↳ Found ${rows.length} table rows`);
    const phases: Array<WeaponAscensionPhase> = [];
    let currentPhase = 0;

    for (let i = 0; i < rows.length; i++) {
      const cells = await rows[i].findElements(By.css('td'));
      if (cells.length === 0 || cells.length === 1) continue;
      const hasPhaseCell = await cells[0].getAttribute('rowspan');

      if (hasPhaseCell === '2') {
        const minData = await parseAscensionRow(cells, currentPhase);
        i++;
        if (i >= rows.length) break;

        const maxCells = await rows[i].findElements(By.css('td'));
        const maxData = await parseAscensionRow(maxCells, currentPhase);

        if (minData && maxData) {
          const phaseData: Partial<WeaponAscensionPhase> = {
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
          };

          if (i + 1 < rows.length) {
            const nextCells = await rows[i + 1].findElements(By.css('td'));
            if (nextCells.length === 1) {
              const materials = await extractAscensionCost(nextCells[0]);
              phaseData.mora = materials.mora;
              phaseData.materials = materials.materials;
              i++;
            }
          }

          phases.push(phaseData as WeaponAscensionPhase);
          currentPhase++;
        }
      }
    }

    if (phases.length < 7) {
      logger.warn(
        `  ⚠ Expected 7 phases, got ${phases.length} for ${weaponName}`
      );
    }

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
  const getWeaponsToScrape = async (weaponsDir: string) => {
    const savedWeapons = (await listFiles(weaponsDir)).map((f) =>
      f.replace(/\.json$/, '')
    );
    const toScrape = force
      ? weapons
      : weapons.filter(
          (w) => !savedWeapons.includes(parseCharacterName(w.name))
        );

    logger.info(`\nProcessing: ${toScrape.length}/${weapons.length} weapons`);
    if (!force && savedWeapons.length > 0) {
      logger.debug(
        `  Skipping ${weapons.length - toScrape.length} already saved weapons`
      );
    }
    return toScrape;
  };

  const morphAllFilesIntoOne = async (weaponsDir: string) => {
    let weaponsDetailed: Record<string, Weapon> = {};
    const files = await listFiles(weaponsDir);
    let cnt = 0;
    for (const file of files) {
      const weapon = await loadJsonData<Weapon>(path.join(weaponsDir, file));

      if (weapon) {
        weaponsDetailed = {
          ...weaponsDetailed,
          [weapon.name]: weapon,
        };
        cnt++;
      } else {
        logger.warn(`⚠️  Failed to load ${file}`);
      }
    }

    logger.debug(`Successfully loaded ${cnt}/${files.length} weapon files`);
    await saveToPublic(weaponsDetailed, 'weapons-detailed');
    logger.success(`✨ Combined ${cnt} weapons into weapons_detailed.json!`);
  };

  const scrape = async (weaponName: string) => {
    return await withWebDriver(async (driver: WebDriver) => {
      const name = encodeURIComponent(underScore(weaponName));
      const weaponUrl = `${URL}/${name}`;

      try {
        logger.cyan(`🔍 Scraping: ${weaponName}`);
        await driver.get(weaponUrl);
        const scraped = await extractEachWeaponData(driver, weaponName);
        logger.success(`✓ ${weaponName} scraped successfully`);
        return { ...scraped };
      } catch (error) {
        logger.error(`✗ Error scraping ${weaponName}:`, error);
        throw error;
      }
    }, true);
  };

  const detailedDir = await ensureDir(path.join(PUBLIC_DIR, 'weapons'));
  const toScrape = await getWeaponsToScrape(detailedDir);
  let successCount = 0;
  let errorCount = 0;

  for (let i = 0; i < toScrape.length; i++) {
    const weapon = toScrape[i];
    const name = parseCharacterName(weapon.name);

    try {
      await saveJson(
        { ...weapon, ...(await scrape(weapon.name)) },
        detailedDir,
        name
      );
      successCount++;
    } catch (error) {
      logger.error(`Failed to scrape ${weapon.name}:`, error);
      errorCount++;
    }
  }

  logger.info(`\n📈 Summary: ${successCount} succeeded, ${errorCount} failed`);
  await morphAllFilesIntoOne(detailedDir);
}

/**
 * Scrapes weapon data from the Genshin Impact wiki for a specific weapon type.
 * @param {WebDriver} driver - The Selenium WebDriver instance.
 * @param {WeaponType} weaponType - The weapon type to scrape.
 */
async function scrapeWeaponsTable(driver: WebDriver, weaponType: WeaponType) {
  await driver.get(`${URL}/${weaponType}`);

  const parseRow = async (row: WebElement): Promise<BaseWeaponType | null> => {
    const cells = await row.findElements(By.css('td'));
    if (cells.length < 6) return null;

    const texts = await Promise.all(cells.map((cell) => cell.getText()));
    const [image, quality] = await Promise.all([
      findImageInCell(cells[0]),
      cells[2].findElement(By.css('img')).getAttribute('alt'),
    ]);
    const iconUrl = parseUrl(image);

    return {
      name: texts[1],
      rarity: Number.parseInt(quality.split(' ')[0]),
      attack: Number.parseInt(texts[3].split(' ')[0]),
      subStat: texts[4].split('\n')[0],
      effect: texts[5],
      iconUrl,
    };
  };

  const rows = await scrapeTable<BaseWeaponType>(
    driver,
    `List of ${weaponType}s`,
    'h2',
    parseRow
  );

  logger.success(`✓ Scraped ${rows.length} ${weaponType} weapons`);
  return rows.length > 0 ? rows : null;
}

/**
 * Scrapes and saves detailed weapon information for weapons that haven't been processed yet.
 */
const scrapeAndSaveDetailedWeaponInfo = async (
  force: boolean = false
): Promise<void> => {
  logger.info('📂 Loading weapons data from weapons.json...');
  const weaponsData = await loadFromPublic<WeaponsFileData>(WEAPON_FILE_NAME);

  if (!weaponsData) {
    logger.error(
      '❌ No weapons found in weapons.json. Run with --base flag first.'
    );
    return;
  }

  const { weapons } = weaponsData;
  const allWeapons: BaseWeaponType[] = [];
  for (const weaponType of WEAPON_TYPES) {
    if (weapons[weaponType]) {
      allWeapons.push(...weapons[weaponType]);
      logger.debug(`  ↳ ${weaponType}: ${weapons[weaponType].length} weapons`);
    }
  }

  logger.info(`🗡️  Found ${allWeapons.length} total weapons to process`);
  await scrapeWeaponsInDetail(allWeapons, force);
};

/**
 * Optimizes weapons data by adding nation and weekday indices from the calendar.
 * Creates a backup of the original file before overwriting.
 */
async function optimizeWeaponsData(): Promise<void> {
  const normalizeDay = (day: string) => {
    return day.replace(/\n/g, '').trim();
  };

  const backupOriginalFile = async () => {
    const originalPath = path.join(PUBLIC_DIR, 'weapons.json');
    const backupPath = path.join(
      PUBLIC_DIR,
      `weapons.backup-${Date.now()}.json`
    );

    try {
      await fs.copyFile(originalPath, backupPath);
      logger.success(`Backup created: ${path.basename(backupPath)}`);
    } catch (error) {
      logger.warn(`Could not create backup: ${error}`);
    }
  };

  const transformWeapons = (
    weaponsData: Record<WeaponType, BaseWeaponType[]>,
    weaponMapping: Map<string, WeaponMapping>,
    nationsList: string[],
    daysList: string[]
  ): Record<string, OptimizedWeaponData[]> => {
    let foundCount = 0;
    let notFoundCount = 0;

    const transformed: Record<string, OptimizedWeaponData[]> = {};
    const weaponEntries = Object.entries(weaponsData);

    for (const [weaponType, weapons] of weaponEntries) {
      transformed[weaponType] = weapons.map((weapon) => {
        const mapping = weaponMapping.get(weapon.name);

        if (mapping) {
          foundCount++;
          return {
            ...weapon,
            nation: nationsList.indexOf(mapping.nation),
            weekdays: daysList.indexOf(mapping.day),
          };
        } else {
          notFoundCount++;
          return {
            ...weapon,
            nation: -1,
            weekdays: -1,
          };
        }
      });
    }

    logger.info(
      `  ↳ Mapped ${foundCount} weapons, ${notFoundCount} not in calendar (set to -1)`
    );

    return transformed;
  };

  const buildWeaponMapping = (calendar: Record<Nation, MaterialCalendar[]>) => {
    const mapping = new Map<string, WeaponMapping>();

    for (const [nation, schedules] of Object.entries(calendar)) {
      schedules.forEach(({ day, weapons }) => {
        for (const weapon of weapons) {
          if (mapping.has(weapon.name)) {
            continue;
          }

          mapping.set(weapon.name, {
            nation,
            day: normalizeDay(day),
          });
        }
      });
    }

    return mapping;
  };

  const extractNations = (calendar: Record<Nation, MaterialCalendar[]>) =>
    Object.keys(calendar);

  const extractDays = (calendar: Record<Nation, MaterialCalendar[]>) => {
    const days = new Set<string>();
    for (const schedules of Object.values(calendar)) {
      for (const schedule of schedules) {
        days.add(normalizeDay(schedule.day));
      }
    }
    return Array.from(days).sort();
  };

  logger.log('\n' + chalk.bold.cyan('⚔️  Weapon Data Optimization') + '\n');

  const calendar =
    await loadFromPublic<Record<Nation, MaterialCalendar[]>>('weaponCalendar');
  if (!calendar) {
    logger.error('❌ Failed to load weaponCalendar.json');
    return;
  }

  const weaponMapping = buildWeaponMapping(calendar);
  const nationsList = extractNations(calendar);
  const daysList = extractDays(calendar);
  logger.success(
    `Found ${nationsList.length} nations: ${nationsList.join(', ')}`
  );
  logger.success(
    `Found ${daysList.length} day schedules: ${daysList.join(', ')}`
  );

  const currentData =
    await loadFromPublic<Record<WeaponType, BaseWeaponType[]>>('weapons');

  if (!currentData) {
    logger.error('❌ Failed to load weapons.json');
    return;
  }
  await backupOriginalFile();

  const weapons = {
    nations: nationsList,
    days: daysList,
    weapons: transformWeapons(
      currentData,
      weaponMapping,
      nationsList,
      daysList
    ),
  };

  await saveToPublic(weapons, 'weapons');
}

/**
 * Main function to scrape and save weapon data.
 * Supports CLI flags:
 * --base: Scrapes basic weapon data from weapon type tables
 * --detailed: Scrapes detailed data for individual weapons
 */
async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    logger.warn('⚠️  No arguments provided\n');
    return;
  }

  logger.info(`📋 Running with flags: ${args.join(', ')}\n`);

  const scrapeWeaponsBase = async (driver: WebDriver) => {
    const tempLocations: Array<[WeaponType, string]> = [];
    let totalWeapons = 0;

    const scrapeWeaponType = async (weapon: WeaponType) => {
      const data = await scrapeWeaponsTable(driver, weapon);

      if (!data) {
        logger.error(`No data scraped for weapon type: ${weapon}`);
        return;
      }

      totalWeapons += data.length;
      const tempLoc = await saveToTemp(data, `weapon-${weapon}`);
      tempLocations.push([weapon, tempLoc]);
      logger.debug(`  ↳ Saved to temp: ${tempLoc}`);
    };

    logger.info(`🔄 Scraping ${WEAPON_TYPES.length} weapon types...\n`);
    for (let i = 0; i < WEAPON_TYPES.length; i++) {
      const wepType = WEAPON_TYPES[i];
      logger.cyan(`[${i + 1}/${WEAPON_TYPES.length}] ${wepType}`);
      await scrapeWeaponType(wepType);
    }

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
    logger.info('🔍 PHASE 2: Detailed Weapon Data Scraping');
    await scrapeAndSaveDetailedWeaponInfo(false);
    logger.success('\n✨ Detailed scraping complete!\n');
  };

  const startTime = Date.now();

  if (args.includes('--base')) {
    await withWebDriver(scrapeWeaponsBase);
  }

  if (args.includes('--detailed')) {
    await saveWeaponsDetailed();
  }

  if (args.includes('--calendar')) {
    logger.info('📅 PHASE 3: Weapon Material Calendar Scraping');
    const calendarData = await loadMaterialCalendar();
    await saveToPublic(calendarData, WEAPON_CALENDAR_FILE_NAME);
    logger.success(`💾 Saved to public/${WEAPON_CALENDAR_FILE_NAME}.json`);
    logger.success('\n✨ Calendar scraping complete!\n');
  }

  if (args.includes('--base') && args.includes('--calendar')) {
    await optimizeWeaponsData();
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
