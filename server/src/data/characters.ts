import { WebDriver, until, By } from "selenium-webdriver";
import {
  URL,
  saveJson,
  setupDriver,
  loadJsonPath,
  listDirectories,
} from "./setup";
import path from "path";

const CHARACTER_DIR_NAME = "characters";

const parseUrl = (url: string) => url.split("/revision/")[0];

const waitForElement = async (driver: WebDriver, cssSelector: string) => {
  await driver.wait(until.elementLocated(By.css(cssSelector)), 10000);
};

interface Talent {
  name: string;
  type: string;
  description: string;
}

interface Constellation {
  name: string;
  level: number;
  description: string;
  iconUrl: string;
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

          const regionUrl = await cells[5]
            .findElement(By.css("img"))
            .getAttribute("data-src");

          texts.push(elementUrl, regionUrl);
        } catch (error) {
          texts.push("", "");
        }

        const weaponUrl = await cells[4]
          .findElement(By.css("img"))
          .getAttribute("data-src");

        texts.push(weaponUrl);

        return texts;
      })
    );

    return rows;
  } catch (error) {
    console.error("Error scraping characters:", error);
    return undefined;
  }
}

/**
 * Scrapes character details from their wiki page including images, talents and constellations.
 *
 * @param driver - The WebDriver instance used for browser automation
 * @param character - The character name to scrape details for
 * @returns A Promise that resolves to an object containing:
 *          - talents: Array of character talent information
 *          - constellations: Array of character constellation information
 *          - imageUrls: Record containing character image URLs
 *          Returns undefined if scraping fails
 */
async function scrapeCharacter(driver: WebDriver, character: string) {
  const characterUrl = `${URL}/${character}`;

  try {
    await driver.get(characterUrl);
    const imageUrls = await getCharacterImages(driver);
    const talents = await getTalents(driver);
    const constellations = await getConstellations(driver);
    return {
      talents,
      constellations,
      imageUrls,
    };
  } catch (error) {
    console.error(error);
  }
}

/**
 * Scrapes and retrieves character image URLs from the character's wiki page.
 *
 * @param driver - The WebDriver instance used for browser automation
 * @returns A record containing URLs for different character images:
 *          - card: Character's card image
 *          - wish: Character's wish banner image
 *          - inGame: Character's in-game portrait
 *          - nameCard: Character's namecard item image
 */
async function getCharacterImages(driver: WebDriver) {
  const selector = "a.image.image-thumbnail";
  await driver.wait(until.elementLocated(By.css(selector)), 10000);

  const characterUrls = await driver.findElements(By.css(selector));
  const urls = await Promise.all(
    characterUrls.map(async (url) => {
      return parseUrl(await url.getAttribute("href"));
    })
  );

  const urlMap: Record<string, string> = {};

  for (const url of urls) {
    const lowerUrl = url.toLowerCase();
    if (lowerUrl.includes("card")) urlMap.card = url;
    else if (lowerUrl.includes("wish")) urlMap.wish = url;
    else if (lowerUrl.includes("game")) urlMap.inGame = url;
  }

  const nameCardContainer = await driver.findElement(
    By.css('div[data-source="namecard"]')
  );
  const nameCardUrl = await nameCardContainer
    .findElement(By.css("img"))
    .getAttribute("data-src");

  urlMap.nameCard = parseUrl(nameCardUrl);

  return urlMap;
}

/**
 * Scrapes and retrieves talent information for a character from their wiki page.
 *
 * @param driver - The WebDriver instance used for browser automation
 * @returns A Promise that resolves to an array of talent objects containing:
 *          - talentIcon: URL of the talent icon image
 *          - talentName: Name of the talent
 *          - talentType: Type of talent (Normal Attack, Elemental Skill, etc)
 *          - description: Description text of the talent
 *          - figureUrls: Array of preview images and captions for the talent
 */
async function getTalents(driver: WebDriver) {
  const talentSelector = "table.talent-table";
  await waitForElement(driver, talentSelector);

  const rows = await driver.findElements(By.css(`${talentSelector} tr`));
  console.log(rows.length);

  const talents = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const cells = await row.findElements(By.css("td"));

    if (cells.length == 3) {
      console.log("Found attack animation");
      const talentIcon = parseUrl(
        await cells[0].findElement(By.css("a img")).getAttribute("data-src")
      );
      const talentName = await cells[1].getText();
      const talentType = await cells[2].getText();

      const descRow = rows[i + 1];
      const descCells = await descRow.findElement(By.css("td"));
      const description = (await descCells.getText()).split("▼")[0];

      const figures = await descRow.findElements(By.css("figure.thumb.tnone"));
      const figureUrls = await Promise.all(
        figures.map(async (figure) => {
          const image = await figure.findElement(By.css("a > img"));
          const url = parseUrl(await image.getAttribute("data-src"));
          let caption = "";

          try {
            caption = await driver.executeScript(
              `
              const fig = arguments[0];
              const captionEl = fig.querySelector('figcaption p.caption');
              return captionEl ? captionEl.textContent.trim() : '';
            `,
              figure
            );

            if (caption) {
              console.log("Caption found:", caption);
            }
          } catch (e) {
            try {
              caption = await driver.executeScript(
                `
                const fig = arguments[0];
                const figcaption = fig.querySelector('figcaption');
                return figcaption ? figcaption.textContent.trim() : '';
              `,
                figure
              );
            } catch (err) {
              console.log("No caption found");
            }
          }

          return { url, caption };
        })
      );

      talents.push({
        talentIcon,
        talentName,
        talentType,
        description,
        figureUrls,
      });
    }
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
  const tableSelector = "table.constellation-table";
  await waitForElement(driver, tableSelector);

  const rows = await driver.findElements(By.css(`${tableSelector} tr`));
  const constellations: Constellation[] = [];
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const cells = await row.findElements(By.css("td"));

    if (cells.length === 3) {
      const iconUrl = parseUrl(
        await cells[0].findElement(By.css("a img")).getAttribute("data-src")
      );
      const name = await cells[1].getText();
      const level = await cells[2].getText();

      const description = await rows[i + 1].findElement(By.css("td")).getText();

      constellations.push({
        iconUrl,
        name,
        level: parseInt(level),
        description,
      });
    }
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

  const charactersTable = characters
    ?.map((character) => {
      return {
        iconUrl: parseUrl(character[0]),
        name: character[1],
        rarity: character[2],
        element: character[3],
        weaponType: character[4],
        region: character[5],
        elementUrl: parseUrl(character[7]),
        weaponUrl: parseUrl(character[9]),
        regionUrl: parseUrl(character[8]),
      };
    })
    .filter(
      (character) => character.name !== "Aloy" && character.name !== "Traveler"
    );
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
 * @param {boolean} force - Whether to force the scraping of characters even if they have already been processed.
 * @returns {Promise<void>} A promise that resolves when all characters have been processed.
 */
const scrapeAndSaveDetailedCharacterInfo = async (
  driver: WebDriver,
  force = false
) => {
  const characters = await loadCharacters();
  const savedCharacters = await listDirectories(path.join(CHARACTER_DIR_NAME));

  if (characters) {
    for (const char of characters) {
      const name = char.name.split(" ").join("_");
      if (!force && savedCharacters.includes(name)) {
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

        saveJson(fullDesc, path.join("characters", "detailed"), name).then(
          () => {
            console.log(`Saved ${name}`);
          }
        );
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
    await scrapeAndSaveDetailedCharacterInfo(driver, true);

  await driver.quit();
}

main();
