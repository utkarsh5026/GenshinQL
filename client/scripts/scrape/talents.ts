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

  try {
    for (const location of locations) {
      logger.cyan(`   Processing ${location}...`);
      loc[location] = await findTalentsForRegion(location, driver);
      logger.success(`   ✓ ${location} completed (${loc[location].length} days)`);
    }

    logger.info('\n💾 Saving talent data...');
    await saveToPublic(loc, TALENT_FILE);
    logger.success(`✓ Saved to ${TALENT_FILE}.json`);
  } catch (error) {
    logger.error('✗ Error loading talents:');
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
  const table = await getTableFromHeading(driver, region, 'h3');
  const tableBody = await table.findElement(By.css('tbody'));
  const rows = await tableBody.findElements(By.css('tr'));

  const talents: TalentDaySchema[] = [];

  for (const row of rows) {
    const cells = await row.findElements(By.css('td'));
    if (cells.length !== 3) continue;
    const day = await cells[0].getText();

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

    const characterContainers = await cells[2].findElements(
      By.css('span.card-body')
    );

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

    talents.push({ day, books, characters });
  }
  return talents;
}

async function main() {
  await withWebDriver(async (driver) => {
    logger.info(`🌍 Navigating to ${TALENT_URL}\n`);
    await driver.get(TALENT_URL);
    await loadTalents(driver);
  });
}

const isMainModule =
  process.argv[1] && import.meta.url.includes(path.basename(process.argv[1]));
if (isMainModule) {
  await main();
}
