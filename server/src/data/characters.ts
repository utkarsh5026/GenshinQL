import { WebDriver, until, By } from "selenium-webdriver";
import {
  URL,
  saveJson,
  setupDriver,
  loadJsonPath,
  listDirectories,
} from "./setup";
import path from "path";
import { constrainedMemory } from "process";

const CHARACTER_DIR_NAME = "characters";

interface Talent {
  name: string;
  type: string;
  description: string;
}

interface Constellation {
  name: string;
  level: number;
  description: string;
}

/**
 * Scrapes character data from the main characters page.
 *
 * @param driver - The WebDriver instance used for browser automation.
 * @returns A Promise that resolves to an array of character data rows, or undefined if an error occurs.
 */
async function scrapeCharacters(
  driver: WebDriver
): Promise<string[][] | undefined> {
  const charactersUrl = `${URL}/Character`;
  try {
    await driver.get(charactersUrl);
    const tableSelector = `table.article-table[data-index-number='1']`;
    await driver.wait(until.elementLocated(By.css(tableSelector)), 10000);

    const rowElements = await driver.findElements(
      By.css(`${tableSelector} tr`)
    );
    const rows = await Promise.all(
      rowElements.slice(1).map(async (row) => {
        const cells = await row.findElements(By.css("td"));
        const texts = await Promise.all(cells.map((cell) => cell.getText()));

        const iconUrl = await cells[0]
          .findElement(By.css("img"))
          .getAttribute("data-src");

        texts[0] = iconUrl;
        const rarity = await cells[2]
          .findElement(By.css("img"))
          .getAttribute("alt");
        texts[2] = rarity;
        try {
          const elementUrl = await cells[3]
            .findElement(By.css("img"))
            .getAttribute("data-src");

          texts.push(elementUrl);
        } catch (error) {
          texts.push("");
        }

        return texts;
      })
    );

    return rows;
  } catch (error) {
    console.error("Error scraping characters:", error);
    return undefined;
  }
}

async function scrapeCharacter(driver: WebDriver, character: string) {
  const characterUrl = `${URL}/${character}`;

  try {
    await driver.get(characterUrl);
    const talents = await getTalents(driver);
    const constellations = await getConstellations(driver);
    return {
      talents,
      constellations,
    };
  } catch (error) {
    console.error(error);
  }
}

async function parseTable(
  driver: WebDriver,
  tableName: string,
  dataIdx: number
) {
  const tableSelector = `table.${tableName}`;
  await driver.wait(until.elementLocated(By.css(tableSelector)), 10000);

  const rowElements = await driver.findElements(By.css(`${tableSelector} tr`));
  const rows = await Promise.all(
    rowElements.map(async (row) => {
      const cells = await row.findElements(By.css("td"));
      const texts = await Promise.all(
        cells.map(async (cell) => {
          const text = await cell.getText();
          return text.split("▼")[0];
        })
      );
      return texts.filter(Boolean);
    })
  );

  return rows.filter((row) => row.length > 0);
}

/**
 * Scrapes and retrieves talent information for a character from the webpage.
 *
 * @param driver - The WebDriver instance used for browser automation.
 * @returns A Promise that resolves to an array of Talent objects.
 */
async function getTalents(driver: WebDriver): Promise<Talent[]> {
  const rows = await parseTable(driver, "talent-table", 3);
  const talents: Talent[] = [];
  for (let i = 0; i < rows.length; i += 2) {
    const [name, type] = rows[i];
    const [description] = rows[i + 1];
    talents.push({ name, type, description });
  }
  return talents;
}

/**
 * Scrapes and retrieves constellation information for a character from the webpage.
 *
 * @param driver - The WebDriver instance used for browser automation.
 * @returns A Promise that resolves to an array of Constellation objects.
 */
async function getConstellations(driver: WebDriver): Promise<Constellation[]> {
  const rows = await parseTable(driver, "constellation-table", 12);
  const constellations: Constellation[] = [];
  for (let i = 0; i < rows.length; i += 2) {
    const [name, level] = rows[i];
    const [description] = rows[i + 1];
    constellations.push({ name, level: parseInt(level), description });
  }
  return constellations;
}

/**
 * Scrapes character information and saves it to a JSON file.
 *
 * @param driver - The WebDriver instance used for browser automation.
 * @returns A Promise that resolves when the characters have been saved.
 */
async function saveCharacters(driver: WebDriver) {
  const characters = await scrapeCharacters(driver);

  console.log(characters);
  const charactersTable = characters?.map((character) => {
    return {
      iconUrl: character[0],
      name: character[1],
      rarity: character[2],
      element: character[3],
      weaponType: character[4],
      region: character[5],
      elementUrl: character[7],
    };
  });
  console.log(JSON.stringify(charactersTable, null, 2));
  await saveJson(charactersTable, "characters", "characters");
  return charactersTable;
}

/**
 * Loads character data from a JSON file.
 *
 * @returns {Promise<any>} A promise that resolves to the loaded character data.
 */
const loadCharacters = async () => {
  const characters = await loadJsonPath(
    path.join(CHARACTER_DIR_NAME, "characters.json")
  );
  return characters;
};

/**
 * Scrapes and saves detailed character information for characters that haven't been processed yet.
 *
 * @param {WebDriver} driver - The Selenium WebDriver instance.
 * @returns {Promise<void>} A promise that resolves when all characters have been processed.
 */
const scrapeAndSaveDetailedCharacterInfo = async (driver: WebDriver) => {
  const characters = await loadCharacters();
  const savedCharacters = await listDirectories(path.join(CHARACTER_DIR_NAME));

  if (characters) {
    for (const char of characters) {
      const name = char.name.split(" ").join("_");
      if (savedCharacters.includes(name)) {
        console.log(`${char.name} already saved`);
        continue;
      }

      try {
        const name = char.name.split(" ").join("_");
        const desc = await scrapeCharacter(driver, name);

        const fullDesc = {
          ...char,
          ...desc,
        };

        saveJson(fullDesc, path.join("characters", name), name);
      } catch (error) {
        console.error(`Error scraping ${char.name}:`, error);
      }
    }
  }
};

async function main() {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    console.dir("No arguments provided", {
      depth: null,
      colors: true,
    });

    console.log("Usage: node characters.js --base --detailed");
    return;
  }

  const driver = await setupDriver();

  if (args.includes("--base")) await saveCharacters(driver);

  if (args.includes("--detailed"))
    await scrapeAndSaveDetailedCharacterInfo(driver);

  await driver.quit();
}

main();
