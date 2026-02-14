import path from 'node:path';

import { By, WebDriver, WebElement } from 'selenium-webdriver';

import { logger } from '../logger.js';
import { ensureDir, PUBLIC_DIR, saveJson } from './fileio.js';
import {
  type SpiralAbyssChamber,
  type SpiralAbyssEnemy,
  type SpiralAbyssFloor,
  type SpiralAbyssFloors,
  spiralAbyssFloorsSchema,
  type SpiralAbyssWave,
} from './schema.js';
import { getImageUrl, mapElements } from './scraping-helpers.js';
import { setupDriver } from './setup.js';
import { getTableFromHeading } from './utils.js';

const FLOORS = [11, 12] as const;
const CHAMBERS_PER_FLOOR = 3;

/**
 * Parses a single enemy card element
 * Extracts icon, name, count, and element
 */
async function parseEnemyCard(card: WebElement): Promise<SpiralAbyssEnemy> {
  const enemyImg = await card.findElement(
    By.css('span.card-image-container img')
  );
  const iconUrl = await getImageUrl(enemyImg, 'data-src');

  const elementImg = await card.findElement(By.css('span.card-icon img'));
  const element = await elementImg.getAttribute('alt');

  const captionEl = await card.findElement(By.css('span.card-caption a'));
  const name = await captionEl.getText();

  let count = 1;
  try {
    const countEl = await card.findElement(By.css('span.card-text'));
    const countText = await countEl.getText();
    count = parseInt(countText.trim().replace(/,/g, ''), 10) || 1;
  } catch {
    logger.warn(`Count not found for enemy ${name}, defaulting to 1`);
  }

  return { name, iconUrl, count, element };
}

/**
 * Parses waves from a table cell containing enemy data
 * Strategy: DOM traversal through child elements
 */
async function parseWaves(cellElement: WebElement): Promise<SpiralAbyssWave[]> {
  const waves: SpiralAbyssWave[] = [];

  try {
    const children = await cellElement.findElements(By.xpath('./*'));

    let currentWaveNumber = 1;
    let currentEnemies: SpiralAbyssEnemy[] = [];

    for (const child of children) {
      const tagName = await child.getTagName();

      if (tagName === 'b') {
        const text = await child.getText();
        const waveMatch = text.match(/Wave (\d+)/);
        if (waveMatch) {
          // Save previous wave if exists
          if (currentEnemies.length > 0) {
            waves.push({
              waveNumber: currentWaveNumber,
              enemies: currentEnemies,
            });
          }
          currentWaveNumber = parseInt(waveMatch[1], 10);
          currentEnemies = [];
        }
      } else if (tagName === 'span') {
        // Check for card-list-container
        const className = await child.getAttribute('class');
        if (className?.includes('card-list-container')) {
          // Parse all enemy cards in this container
          const cards = await child.findElements(By.css('div.card-container'));
          const enemies = await mapElements(cards, parseEnemyCard, {
            logErrors: false,
          });
          currentEnemies.push(...enemies);
        }
      } else if (tagName === 'hr') {
        // Wave separator - save current wave
        if (currentEnemies.length > 0) {
          waves.push({
            waveNumber: currentWaveNumber,
            enemies: currentEnemies,
          });
          currentEnemies = [];
          currentWaveNumber++;
        }
      }
    }

    // Push last wave if exists
    if (currentEnemies.length > 0) {
      waves.push({
        waveNumber: currentWaveNumber,
        enemies: currentEnemies,
      });
    }

    return waves;
  } catch (error) {
    logger.warn('Failed to parse waves:', error);
    return [];
  }
}

/**
 * Parses a chamber block from table rows
 * Chamber occupies 4 consecutive rows:
 * - Row 0: Chamber header
 * - Row 1: Enemy level
 * - Row 2: First Half enemies
 * - Row 3: Second Half enemies
 */
async function parseChamber(
  rows: WebElement[],
  startIndex: number
): Promise<SpiralAbyssChamber | null> {
  const getRowText = async (index: number) => {
    const row = rows[index];
    const cell = await row.findElement(By.css('td'));
    return cell.getText();
  };

  try {
    const headerRow = rows[startIndex];
    const headerText = await headerRow.getText();
    const chamberMatch = headerText.match(/Chamber (\d+)/);
    if (!chamberMatch) {
      logger.warn(`Could not parse chamber number from: ${headerText}`);
      return null;
    }
    const chamber = parseInt(chamberMatch[1], 10);

    const levelText = await getRowText(startIndex + 1);
    const level = parseInt(levelText.trim(), 10);

    const challenge = await getRowText(startIndex + 2);

    const firstHalfRow = rows[startIndex + 3];
    const firstHalfCell = await firstHalfRow.findElement(By.css('td'));
    const firstHalfWaves = await parseWaves(firstHalfCell);

    const secondHalfRow = rows[startIndex + 4];
    const secondHalfCell = await secondHalfRow.findElement(By.css('td'));
    const secondHalfWaves = await parseWaves(secondHalfCell);

    return {
      chamber,
      challenge,
      level,
      firstHalf: { waves: firstHalfWaves },
      secondHalf: { waves: secondHalfWaves },
    };
  } catch (error) {
    logger.error(`Failed to parse chamber at row ${startIndex}:`, error);
    return null;
  }
}

/**
 * Parses a single floor table (Floor 11 or Floor 12)
 */
async function parseFloorTable(
  driver: WebDriver,
  floorNumber: number
): Promise<SpiralAbyssFloor | null> {
  try {
    logger.info(`Parsing Floor ${floorNumber}...`);

    const table = await getTableFromHeading(
      driver,
      `Floor ${floorNumber}`,
      'h3'
    );
    const tbody = await table.findElement(By.css('tbody'));
    const rows = await tbody.findElements(By.css('tr'));

    logger.info(`Found ${rows.length} rows in Floor ${floorNumber} table`);

    const chambers: SpiralAbyssChamber[] = [];
    for (let chamberNum = 1; chamberNum <= CHAMBERS_PER_FLOOR; chamberNum++) {
      const startIndex = (chamberNum - 1) * 4;
      const chamber = await parseChamber(rows, startIndex);
      if (chamber) {
        chambers.push(chamber);
        logger.success(`✅ Parsed Chamber ${chamberNum}`);
      }
    }

    if (chambers.length === 0) {
      logger.warn(`No chambers parsed for Floor ${floorNumber}`);
      return null;
    }

    return {
      floorNumber,
      chambers,
    };
  } catch (error) {
    logger.error(`Failed to parse Floor ${floorNumber}:`, error);
    return null;
  }
}

/**
 * Extracts the update date from the page h1 title
 * @returns Date string in YYYY-MM-DD format
 */
async function extractUpdateDate(driver: WebDriver): Promise<string> {
  try {
    const h1 = await driver.findElement(
      By.css('h1.page-header__title span.mw-page-title-main')
    );
    const titleText = await h1.getText();

    // Match: "Spiral Abyss/Floors/2026-01-16"
    const dateMatch = titleText.match(
      /Spiral Abyss\/Floors\/(\d{4}-\d{2}-\d{2})/
    );

    if (!dateMatch) {
      throw new Error(`Could not extract date from title: ${titleText}`);
    }

    logger.info(`Extracted update date: ${dateMatch[1]}`);
    return dateMatch[1];
  } catch (error) {
    logger.error('Failed to extract update date:', error);
    throw error;
  }
}

/**
 * Saves Spiral Abyss floor data to the public folder
 */
async function saveFloorData(data: SpiralAbyssFloors): Promise<void> {
  const spiralAbyssDir = path.join(PUBLIC_DIR, 'spiral-abyss');
  await ensureDir(spiralAbyssDir);

  const dateFilename = `spiral-abyss-${data.updateDate}.json`;
  await saveJson(data, spiralAbyssDir, dateFilename);
  logger.success(`💾 Saved: ${dateFilename}`);

  await saveJson(data, spiralAbyssDir, 'spiral-abyss-latest.json');
  logger.success(`💾 Saved: spiral-abyss-latest.json`);
}

/**
 * Main scraping function for Spiral Abyss floors
 * Scrapes detailed floor/chamber/enemy data from the wiki page
 */
async function scrapeSpiralAbyssFloors(
  url: string
): Promise<SpiralAbyssFloors> {
  const driver = await setupDriver();

  try {
    logger.info(`🔍 Navigating to ${url}`);
    await driver.get(url);

    await driver.sleep(2000);
    const updateDate = await extractUpdateDate(driver);

    const floors: SpiralAbyssFloor[] = [];

    for (const floorNumber of FLOORS) {
      const floor = await parseFloorTable(driver, floorNumber);
      if (floor) {
        floors.push(floor);
      }
    }

    if (floors.length === 0) {
      throw new Error('Failed to parse any floors');
    }

    const floorsData: SpiralAbyssFloors = {
      updateDate,
      floors,
    };

    // Validate with schema
    const validationResult = spiralAbyssFloorsSchema.safeParse(floorsData);
    if (!validationResult.success) {
      logger.error('❌ Data validation failed:', validationResult.error.issues);
      throw new Error('Scraped data does not match schema');
    }

    logger.success('✅ Successfully scraped Spiral Abyss floors data');
    logger.info(
      `Floors parsed: ${floors.map((f) => f.floorNumber).join(', ')}`
    );

    // Save to file
    await saveFloorData(floorsData);

    return floorsData;
  } finally {
    await driver.quit();
  }
}

// CLI execution
if (
  process.argv[1] &&
  import.meta.url.includes(path.basename(process.argv[1]))
) {
  const url =
    process.argv[2] ||
    'https://genshin-impact.fandom.com/wiki/Spiral_Abyss/Floors/2026-01-16';

  scrapeSpiralAbyssFloors(url)
    .then(() => {
      logger.success('✅ Spiral Abyss Floors scraping complete!');
      process.exit(0);
    })
    .catch((error) => {
      logger.error('❌ Scraping failed:', error);
      process.exit(1);
    });
}

export { scrapeSpiralAbyssFloors };
