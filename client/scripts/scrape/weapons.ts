import { By, WebDriver, WebElement } from 'selenium-webdriver';
import { setupDriver, URL, waitForElementCss, withWebDriver } from './setup';
import {
  findImageInCell,
  getTableFromHeading,
  parseUrl,
  underScore,
} from './utils.js';
import { weaponSchema, weaponTypeSchema } from './schema.js';
import { z } from 'zod';
import path from 'node:path';
import {
  cleanupTempFiles,
  loadJsonData,
  saveToPublic,
  saveToTemp,
} from './fileio.js';
import { logger } from '../logger';

type WeaponType = z.infer<typeof weaponTypeSchema>;
type BaseWeaponType = Omit<Weapon, 'passives' | 'materials'>;
type Weapon = z.infer<typeof weaponSchema>;

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
        rows.map(async (row) => {
          const cells = await row.findElements(By.css('td'));
          if (cells.length === 3) {
            const day = await cells[0].getText();
            const materialImages = await cells[1].findElements(By.css('img'));
            const images = (
              await Promise.all(
                materialImages.map(async (img) => {
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
              weapons.map(async (weapon) => weapon.getAttribute('title'))
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

  console.log(url);
  await driver.get(url);

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

  const tabSelector = 'li.wds-tabs__tab';
  const tabs = await driver.findElements(By.css(tabSelector));

  const passives = [];
  console.log(tabs.length);

  for (const tab of tabs.slice(4, tabs.length)) {
    await driver.executeScript('arguments[0].click();', tab);
    const weaponContent = await driver
      .findElement(By.css('div.wds-tab__content.wds-is-current td'))
      .getText();
    passives.push(weaponContent);
  }

  return {
    materials,
    passives,
    images: await getWeaponImages(driver),
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

  console.log(imageElements.length, await imageContainer.getAttribute('class'));

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
  } catch (error) {
    console.error('Error getting weapon details image:', error);
  }

  return images;
}

/**
 * Loads weapon data from JSON files and enriches it with additional material data.
 * For each weapon type (Sword, Claymore, etc.), loads the basic weapon data from JSON,
 * then fetches additional material data for each weapon using Selenium.
 * Finally saves the combined data to a new JSON file.
 *
 * The function:
 * 1. Sets up a Selenium WebDriver
 * 2. Initializes an object to store data for each weapon type
 * 3. For each weapon type:
 *    - Loads basic data from JSON
 *    - Fetches material data for each weapon
 *    - Combines the data
 * 4. Saves the complete dataset to a new JSON file
 * 5. Ensures the WebDriver is closed when done
 *
 * @returns {Promise<void>} A promise that resolves when all weapon data has been processed and saved
 */
async function loadWeapons(): Promise<void> {
  const driver = await setupDriver();
  const weaponData: Record<WeaponType, any> = {
    Sword: [],
    Claymore: [],
    Polearm: [],
    Bow: [],
    Catalyst: [],
  };

  try {
    for (const weapon of WEAPON_TYPES) {
      const result = [];
      const data = await loadJsonData('')
      for (const weapon of data) {
        try {
          console.log('\n==Scraping', weapon.name, '==\n');
          const { materials, passives, images } = await extractEachWeaponData(
            driver,
            weapon.name
          );
          weapon.materials = materials;
          weapon.passives = passives;
          weapon.images = images;
          result.push(weapon);
        } catch (error) {
          console.error('Error extracting weapon data for', weapon.name, error);
        }
      }
      weaponData[weapon] = result;
    }

    await saveToPublic(weaponData, 'weapons');
  } finally {
    await driver.quit();
  }
}

async function addMaterialCount() {
  const result = (await loadJsonPath(
    path.join('weapons', 'wep.json')
  )) as Record<WeaponType, Weapon[]>;

  const four_star_weapon = [150000, 3, 9, 9, 4, 15, 18, 27, 10, 15, 18];
  const five_star_weapon = [225000, 5, 14, 14, 6, 23, 27, 41, 15, 23, 27];

  for (const weaponType of WEAPON_TYPES) {
    const weapons = result[weaponType];
    for (const weapon of weapons) {
      const rarity = weapon.rarity;
      const materialCount = rarity === 4 ? four_star_weapon : five_star_weapon;

      const materials = weapon.materials;
      for (let i = 0; i < materials.length; i++) {
        materials[i].count = materialCount[i];
      }
    }
  }
  await saveToPublic(result, 'weapons-with-count');
}


/**
 * Scrapes weapon data from the Genshin Impact wiki for a specific weapon type.
 * @param {WebDriver} driver - The Selenium WebDriver instance.
 * @param {WeaponType} weapon - The weapon type to scrape.
 */
async function scrapeWeaponsTable(driver: WebDriver, weapon: WeaponType) {
  logger.info(`Starting to scrape ${weapon} weapons...`);

  const getWeaponsTable = async () => {
    const weaponUrl = `${URL}/${weapon}`;
    await driver.get(weaponUrl);
    const table = await getTableFromHeading(driver, `List of ${weapon}s`);
    logger.success(`table for the ${weapon} found`);
    return table;
  };

  const parseTableRow = async (row: WebElement): Promise<BaseWeaponType> => {
    const cells = await row.findElements(By.css('td'));
    const texts = await Promise.all(cells.map((cell) => cell.getText()));
    const [image, quality] = await Promise.all([
      findImageInCell(cells[0]),
      cells[2].findElement(By.css('img')).getAttribute('alt')
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
    const rows = await Promise.all(rowElements.slice(1).map(parseTableRow));
    logger.success(`Successfully scraped ${rows.length} ${weapon} weapons`);
    return rows
  } catch (error) {
    logger.error(`Error scraping ${weapon}:`, error);
    return null;
  }
}

/**
 * Main function to scrape and save weapon data for all weapon types.
 * Uses parallel execution with one WebDriver instance per weapon type for faster scraping.
 */
async function main() {
  const tempLocations: Array<[WeaponType, string]> = [];

  const scrapeWeaponType = (weapon: WeaponType) => {
    return withWebDriver(async (driver) => {
      logger.info(`Starting scrape for ${weapon}...`);
      const data = await scrapeWeaponsTable(driver, weapon);

      if (!data) {
        logger.error(`No data scraped for weapon type: ${weapon}`);
        return;
      }

      const tempLoc = await saveToTemp(data, `wepon-${weapon}`);
      tempLocations.push([weapon, tempLoc]);
      logger.success(`✓ Completed scrape for ${weapon}`);
    });
  };

  const mergeAllWeaponTypes = async () => {
    const weapons: Record<string, BaseWeaponType[]> = {};

    for (const [weaponType, location] of tempLocations) {
      const schema = await loadJsonData<BaseWeaponType[]>(location);
      if (!schema) continue;
      weapons[weaponType] = schema;
    }

    await saveToPublic(weapons, 'weapons');
    await cleanupTempFiles();
  };

  await Promise.all(WEAPON_TYPES.slice(0, 1).map(scrapeWeaponType)); // Testing with Bow (index 3)
  await mergeAllWeaponTypes();
  logger.info('\n=== Scraping Summary ===');
}

const isMainModule =
  process.argv[1] && import.meta.url.includes(path.basename(process.argv[1]));
if (isMainModule) {
  await main();
}
