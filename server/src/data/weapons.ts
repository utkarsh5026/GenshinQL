import { By, until, WebDriver } from "selenium-webdriver";
import {
  loadJsonPath,
  saveJson,
  setupDriver,
  URL,
  waitForElementCss,
} from "./setup";
import { parseUrl, underScore } from "./utils";
import { weaponSchema, weaponTypeSchema } from "./schema";
import { z } from "zod";
import path from "path";

type WeaponType = z.infer<typeof weaponTypeSchema>;
type Weapon = z.infer<typeof weaponSchema>;

const WEAPON_TYPES: WeaponType[] = [
  "Sword",
  "Claymore",
  "Polearm",
  "Bow",
  "Catalyst",
] as const;

/**
 * Array of weapon types in Genshin Impact.
 */

/**
 * Scrapes weapon data from the Genshin Impact wiki for a specific weapon type.
 * @param {WebDriver} driver - The Selenium WebDriver instance.
 * @param {WeaponType} weapon - The weapon type to scrape.
 * @returns {Promise<{headers: string[], rows: string[][]} | null>} A Promise that resolves to an object containing headers and rows of weapon data, or null if an error occurs.
 */
async function scrapeWeapons(driver: WebDriver, weapon: WeaponType) {
  const weaponUrl = `${URL}/${weapon}`;
  try {
    await driver.get(weaponUrl);
    const dataIndex = weapon === "Bow" ? 3 : 1;
    const tableSelector = `table.article-table[data-index-number='${dataIndex}']`;
    await driver.wait(until.elementLocated(By.css(tableSelector)), 10000);

    const table = await driver
      .findElement(By.css(`span#List_of_${weapon}s`))
      .findElement(By.xpath(".."))
      .findElement(By.xpath("following-sibling::table"));

    console.log(table.getTagName(), await table.getAttribute("class"));

    const headerElements = await table.findElements(By.css("th"));
    const headers = await Promise.all(headerElements.map((el) => el.getText()));

    // Extract rows
    const rowElements = await table.findElements(By.css("tr"));
    const rows = await Promise.all(
      rowElements.slice(1).map(async (row) => {
        const cells = await row.findElements(By.css("td"));
        const image = await cells[0]
          .findElement(By.css("img"))
          .getAttribute("data-src");
        const texts = await Promise.all(cells.map((cell) => cell.getText()));

        const quality = await cells[2]
          .findElement(By.css("img"))
          .getAttribute("alt");

        texts[2] = quality;
        texts[0] = parseUrl(image);
        return texts;
      })
    );

    return {
      headers,
      rows,
    };
  } catch (error) {
    console.error(`Error scraping ${weapon}:`, error);
    return null;
  }
}

/**
 * Extracts detailed weapon data including material images and captions from a weapon's page.
 * @param {WebDriver} driver - The Selenium WebDriver instance.
 * @param {string} weaponName - The name of the weapon to extract data for.
 * @returns {Promise<{materials: {url: string, caption: string}[]}>} A Promise that resolves to an object containing the weapon's material data.
 */
async function extractEachWeaponData(driver: WebDriver, weaponName: string) {
  const name = encodeURIComponent(underScore(weaponName));
  const url = `${URL}/${name}`;

  console.log(url);
  await driver.get(url);

  const selector = "span.card-list-container";
  await waitForElementCss(driver, selector);

  const container = await driver.findElement(By.css(selector));
  const materials = await Promise.all(
    (
      await container.findElements(By.css("div.card-container"))
    ).map(async (card) => {
      const imageUrl = await card
        .findElement(By.css("img"))
        .getAttribute("data-src");

      const caption = await card
        .findElement(By.css("span.card-caption"))
        .getText();

      return {
        url: parseUrl(imageUrl),
        caption,
      };
    })
  );

  const tabSelector = "li.wds-tabs__tab";
  const tabs = await driver.findElements(By.css(tabSelector));

  const passives = [];
  console.log(tabs.length);

  for (const tab of tabs.slice(4, tabs.length)) {
    await driver.executeScript("arguments[0].click();", tab);
    const weaponContent = await driver
      .findElement(By.css("div.wds-tab__content.wds-is-current td"))
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
  const selector = "div.pi-image-collection";
  await waitForElementCss(driver, selector);

  const imageContainer = await driver.findElement(By.css(selector));
  const imageElements = await imageContainer.findElements(By.css("img"));

  console.log(imageElements.length, await imageContainer.getAttribute("class"));

  const images = await Promise.all(
    imageElements.map(async (imageElement) => {
      const image = await imageElement.getAttribute("src");
      return parseUrl(image);
    })
  );

  try {
    const weaponDetailsImage = await driver.findElement(
      By.css("img[alt='Weapon Details Announcement']")
    );
    const weaponDetailsImageUrl = await weaponDetailsImage.getAttribute(
      "data-src"
    );
    images.push(parseUrl(weaponDetailsImageUrl));
  } catch (error) {
    console.error("Error getting weapon details image:", error);
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
      const data = await loadJsonPath(
        path.join("weapons", `${weapon}s_new.json`)
      );
      for (const weapon of data) {
        try {
          console.log("\n==Scraping", weapon.name, "==\n");
          const { materials, passives, images } = await extractEachWeaponData(
            driver,
            weapon.name
          );
          weapon.materials = materials;
          weapon.passives = passives;
          weapon.images = images;
          result.push(weapon);
        } catch (error) {
          console.error("Error extracting weapon data for", weapon.name, error);
        }
      }
      weaponData[weapon] = result;
    }

    await saveJson(weaponData, "weapons", "weapons_new");
  } finally {
    await driver.quit();
  }
}

async function addMaterialCount() {
  const result = (await loadJsonPath(
    path.join("weapons", "wep.json")
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
  await saveJson(result, "weapons", "weaper");
}

/**
 * Main function to scrape and save weapon data for all weapon types.
 */
async function main() {
  const driver = await setupDriver();

  // for (const weapon of WEAPON_TYPES) {
  //   const data = await scrapeWeapons(driver, weapon);
  //   const weaponData = data?.rows.map((row) => {
  //     const stars = parseInt(row[2].split(" ")[0]);
  //     const attack = parseInt(row[3].split(" ")[0]);
  //     const substat = row[4].split("\n")[0];
  //     const iconUrl = parseUrl(row[0]);

  //     return {
  //       name: row[1],
  //       rarity: stars,
  //       attack: attack,
  //       subStat: substat,
  //       effect: row[5],
  //       iconUrl,
  //     };
  //   });

  //   await saveJson(weaponData, "weapons", `${weapon}s_new`);
  // }
  await driver.quit();
  await loadWeapons();
}

if (require.main === module) {
  main().then(() => console.log("Done loading weapons!"));
}
