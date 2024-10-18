import { until, WebDriver, By } from "selenium-webdriver";
import { setupDriver, URL, saveJson } from "./setup";

/**
 * Array of weapon types in Genshin Impact.
 */
const weapons = ["Sword", "Claymore", "Polearm", "Bow", "Catalyst"] as const;

/**
 * Scrapes weapon data from the Genshin Impact wiki for a specific weapon type.
 * @param {WebDriver} driver - The Selenium WebDriver instance.
 * @param {(typeof weapons)[number]} weapon - The weapon type to scrape.
 * @returns {Promise<{headers: string[], rows: string[][]} | null>} A Promise that resolves to an object containing headers and rows of weapon data, or null if an error occurs.
 */
async function scrapeWeapons(
  driver: WebDriver,
  weapon: (typeof weapons)[number]
) {
  const weaponUrl = `${URL}/${weapon}`;
  try {
    await driver.get(weaponUrl);
    const dataIndex = weapon === "Bow" ? 2 : 1;
    const tableSelector = `table.article-table[data-index-number='${dataIndex}']`;
    await driver.wait(until.elementLocated(By.css(tableSelector)), 10000);

    const headerElements = await driver.findElements(
      By.css(`${tableSelector} th`)
    );
    const headers = await Promise.all(headerElements.map((el) => el.getText()));

    // Extract rows
    const rowElements = await driver.findElements(
      By.css(`${tableSelector} tr`)
    );
    const rows = await Promise.all(
      rowElements.slice(1).map(async (row) => {
        const cells = await row.findElements(By.css("td"));
        const texts = await Promise.all(cells.map((cell) => cell.getText()));

        const quality = await cells[2]
          .findElement(By.css("img"))
          .getAttribute("alt");

        texts[2] = quality;
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
 * Main function to scrape and save weapon data for all weapon types.
 */
async function main() {
  const driver = await setupDriver();

  for (const weapon of weapons) {
    const data = await scrapeWeapons(driver, weapon);
    const weaponData = data?.rows.map((row) => {
      const stars = parseInt(row[2].split(" ")[0]);
      const attack = parseInt(row[3].split(" ")[0]);
      const substat = row[4].split("\n")[0];

      return {
        name: row[1],
        rarity: stars,
        attack: attack,
        subStat: substat,
        effect: row[5],
      };
    });

    await saveJson(weaponData, "weapons", weapon);
  }
  await driver.quit();
}

main();
