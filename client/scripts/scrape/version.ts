import path from 'path';
import { By, until, WebDriver, WebElement } from 'selenium-webdriver';

import { logger } from '../logger.js';
import { PUBLIC_DIR, saveJson } from './fileio.js';
import { getImageUrl } from './scraping-helpers.ts';
import { URL, withWebDriver } from './setup.js';

const TIME_TO_WAIT_FOR_ELEMENT_MS = 10000;

/**
 * Finds a <dt> element by its text content and returns the next sibling of its parent <dl> element
 * @param driver - Selenium WebDriver instance
 * @param dtTextContent - The text content of the dt tag to find (e.g., "New Characters")
 * @returns The next sibling element after the parent <dl> tag
 */
async function getNextElementByDtText(
  driver: WebDriver,
  dtTextContent: string
): Promise<WebElement> {
  // XPath: Find dt with matching text, go to parent dl, get its first following sibling
  const xpath = `//dt[normalize-space(.)='${dtTextContent}']/parent::dl/following-sibling::*[1]`;

  await driver.wait(
    until.elementLocated(By.xpath(xpath)),
    TIME_TO_WAIT_FOR_ELEMENT_MS
  );

  return driver.findElement(By.xpath(xpath));
}

interface NewCharacter {
  name: string;
  icon: string;
  description: string;
  rarity?: string;
  element?: string;
  weaponType?: string;
}

/**
 * Scrapes new characters from the version page
 * @param driver - Selenium WebDriver instance
 * @returns Array of new character data
 */
async function scrapeNewCharacters(driver: WebDriver): Promise<NewCharacter[]> {
  const parseCharacterListItem = async (
    listItem: WebElement
  ): Promise<NewCharacter | null> => {
    try {
      const img = await listItem.findElement(By.css('img'));
      const icon = await getImageUrl(img, 'data-src');
      const fullText = await listItem.getText();

      const nameLink = await listItem.findElement(
        By.css('a[href^="/wiki/"]:not(.mw-file-description)')
      );
      const name = await nameLink.getText();
      const descriptionMatch = fullText.match(/"([^"]+)"/);
      const description = descriptionMatch ? descriptionMatch[1] : '';

      const infoMatch = fullText.match(/\((\d)-Star\s+(\w+)\s+(\w+)\)/);
      const rarity = infoMatch ? `${infoMatch[1]}-Star` : undefined;
      const element = infoMatch ? infoMatch[2] : undefined;
      const weaponType = infoMatch ? infoMatch[3] : undefined;

      return {
        name,
        icon,
        description,
        rarity,
        element,
        weaponType,
      };
    } catch (error) {
      logger.error('Failed to parse character list item:', error);
      return null;
    }
  };

  try {
    const ulElement = await getNextElementByDtText(driver, 'New Characters');
    const listItems = await ulElement.findElements(By.css('li'));

    logger.info(`Found ${listItems.length} new characters`);

    const characters = await Promise.all(
      listItems.map((item) => parseCharacterListItem(item))
    );

    return characters.filter((char) => char !== null) as NewCharacter[];
  } catch (error) {
    logger.error('Failed to scrape new characters:', error);
    return [];
  }
}

/**
 * Main scraping function
 */
async function scrapeVersionData(driver: WebDriver) {
  await driver.get(`${URL}/Version/Luna_IV`);

  const newCharacters = await scrapeNewCharacters(driver);
  const versionDir = path.join(PUBLIC_DIR, 'version');
  await saveJson({ newCharacters }, versionDir, 'latest.json');

  logger.success(`✅ Scraped ${newCharacters.length} new characters`);
}

/**
 * Main execution function
 */
async function main() {
  logger.cyan('\n=== Scraping Version Data ===\n');

  await withWebDriver(async (driver) => {
    await scrapeVersionData(driver);
  });

  logger.success('\n=== Version data scraped successfully! ===\n');
}

const isMainModule =
  process.argv[1] && import.meta.url.includes(path.basename(process.argv[1]));

if (isMainModule) {
  await main();
}
