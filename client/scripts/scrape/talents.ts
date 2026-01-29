import { withWebDriver } from './setup.js';
import { By, WebDriver } from 'selenium-webdriver';
import { TalentDaySchema } from './schema.js';
import { getTableFromHeading } from './utils.js';
import { BASE_URL } from './urls.js';
import { saveToPublic } from './fileio.js';
import { logger } from '../logger.js';
import * as path from 'node:path';

const TALENT_FILE = 'dailyTalents';

/**
 * URL for the Character Talent Material page.
 */
const TALENT_URL = `${BASE_URL}/Character_Talent_Material`;

const locations = [
  'Mondstadt',
  'Liyue',
  'Inazuma',
  'Sumeru',
  'Fontaine',
  'Natlan',
  'Nod-Krai',
] as const;

const parseUrl = (url: string) => url.split('/revision/')[0];

/**
 * Loads talent materials for all specified locations and saves them to a JSON file.
 * @param driver The WebDriver instance used to navigate and scrape the web page.
 */
async function loadTalents(driver: WebDriver) {
  const loc: Record<string, TalentDaySchema[]> = {};

  logger.info('📚 Loading talent materials...\n');
  logger.info(`📍 Regions to process: ${locations.join(', ')}\n`);

  try {
    for (let i = 0; i < locations.length; i++) {
      const location = locations[i];
      logger.cyan(`\n[${i + 1}/${locations.length}] Processing ${location}...`);
      loc[location] = await findTalentsForRegion(location, driver);

      const totalCharacters = loc[location].reduce(
        (sum, day) => sum + day.characters.length,
        0
      );
      logger.success(
        `✓ ${location} completed: ${loc[location].length} days, ${totalCharacters} total characters`
      );
    }

    logger.info('\n💾 Saving talent data...');
    const totalDays = Object.values(loc).reduce(
      (sum, days) => sum + days.length,
      0
    );
    const totalChars = Object.values(loc).reduce(
      (sum, days) => sum + days.reduce((s, day) => s + day.characters.length, 0),
      0
    );
    logger.info(`   📊 Total: ${totalDays} days, ${totalChars} characters`);

    await saveToPublic(loc, TALENT_FILE);
    logger.success(`✓ Saved to public/${TALENT_FILE}.json`);
  } catch (error) {
    logger.error('\n✗ Error loading talents:');
    logger.error(`   ${error}`);
    throw error;
  }
}

/**
 * Finds and retrieves talent materials for a specific region.
 */
export async function findTalentsForRegion(
  region: string,
  driver: WebDriver
): Promise<TalentDaySchema[]> {
  logger.info(`   📖 Finding table for ${region}...`);
  const table = await getTableFromHeading(driver, region, 'h3');
  logger.success(`   ✓ Table found for ${region}`);

  const tableBody = await table.findElement(By.css('tbody'));
  const rows = await tableBody.findElements(By.css('tr'));
  logger.info(`   📊 Processing ${rows.length} rows...`);

  const talents: TalentDaySchema[] = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const cells = await row.findElements(By.css('td'));
    if (cells.length !== 3) {
      logger.warn(`   ⚠ Skipping row ${i + 1}: Expected 3 cells, found ${cells.length}`);
      continue;
    }

    const day = await cells[0].getText();
    logger.info(`   🗓️  Processing ${day}...`);

    try {
      const bookImages = await cells[1]
        .findElement(By.css('span.card-list-container'))
        .findElements(By.css('span.card-image-container img'));

      const books = await Promise.all(
        bookImages.map(async (book) => {
          const name = await book.getAttribute('alt');
          const url = await book.getAttribute('data-src');
          return { name, url: parseUrl(url) };
        })
      );
      logger.success(`      ✓ Found ${books.length} talent books`);

      const characterContainers = await cells[2].findElements(
        By.css('span.card-body')
      );
      logger.info(`      🔍 Extracting ${characterContainers.length} characters...`);

      const characters = await Promise.all(
        characterContainers.map(async (container) => {
          const img = await container.findElement(
            By.css('span.card-image-container img')
          );
          const name = await img.getAttribute('alt');
          const url = await img.getAttribute('data-src');
          return { name, url: parseUrl(url) };
        })
      );
      logger.success(`      ✓ Found ${characters.length} characters for ${day}`);

      talents.push({ day, books, characters });
    } catch (error) {
      logger.error(`      ✗ Error processing ${day}:`);
      logger.error(`        ${error}`);
      throw error;
    }
  }

  logger.success(`   ✓ Completed ${region}: ${talents.length} talent schedules extracted\n`);
  return talents;
}

async function main() {
  logger.info('🚀 Starting talent materials scraper...\n');

  await withWebDriver(async (driver) => {
    logger.info(`🌍 Navigating to ${TALENT_URL}`);
    await driver.get(TALENT_URL);
    logger.success('✓ Page loaded successfully\n');

    await loadTalents(driver);

    logger.success('\n✅ Talent scraping completed successfully!');
  });
}

const isMainModule =
  process.argv[1] && import.meta.url.includes(path.basename(process.argv[1]));
if (isMainModule) {
  await main();
}
