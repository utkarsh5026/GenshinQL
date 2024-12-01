import { By, until, WebDriver, WebElement } from "selenium-webdriver";
import { setupDriver, URL } from "./setup";
import path from "path";
import { getParentNextTableSibling, parseCharacterName } from "./utils";
import {
  CHARACTER_DIR,
  listFiles,
  loadJsonData,
  saveFileWithNewVersion,
  saveJson,
} from "./fileio";
import {
  AdvancedCharacterSchema,
  BaseCharacterSchema,
  ConstellationSchema,
  TalentSchema,
} from "./schema";

const parseUrl = (url: string) => url.split("/revision/")[0];

const waitForElement = async (driver: WebDriver, cssSelector: string) => {
  await driver.wait(until.elementLocated(By.css(cssSelector)), 10000);
};

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

    return await Promise.all(
      rowElements.slice(1).map(async (row) => {
        const cells = await row.findElements(By.css("td"));
        const texts = await Promise.all(cells.map((cell) => cell.getText()));

        texts[0] = await cells[0]
          .findElement(By.css("img"))
          .getAttribute("data-src");

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
export async function scrapeCharacterDetailed(
  driver: WebDriver,
  character: string
) {
  const characterUrl = `${URL}/${character}`;

  try {
    await driver.get(characterUrl);
    const imageUrls = await getCharacterImages(driver);
    const talents = await getTalents(driver);
    const constellations = await getConstellations(driver);
    const version = await getCharacterVersion(driver);
    return {
      talents,
      constellations,
      imageUrls,
      version,
    };
  } catch (error) {
    console.error(error);
  }
}

/**
 * Retrieves the version number when a character was first released.
 * Finds the Character Event Wishes table and extracts the version from the last cell
 * of the first banner row.
 *
 * @param driver - The WebDriver instance used for browser automation
 * @returns Promise resolving to the version string (e.g. "1.0")
 */
async function getCharacterVersion(driver: WebDriver) {
  const selector = "span#Character_Event_Wishes";
  const table = await getParentNextTableSibling(driver, selector);
  const rows = await table.findElements(By.css("tr"));

  const cells = await rows[1].findElements(By.css("td"));
  return await cells[cells.length - 1].getText();
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
 * Extracts figure URLs and captions from talent description figures
 *
 * @param driver - The WebDriver instance
 * @param descRow - The row element containing the figures
 * @returns Promise resolving to array of figure URLs and captions
 */
async function getFigureUrls(driver: WebDriver, descRow: WebElement) {
  const figures = await descRow.findElements(By.css("figure.thumb.tnone"));
  return Promise.all(
    figures.map(async (figure) => {
      try {
        const image = await figure.findElement(By.css("a img"));
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
      } catch (error) {
        console.log("Error getting figure urls:", error);
        return { url: "", caption: "" };
      }
    })
  );
}

/**
 * Scrapes and retrieves talent scaling information from a character's talent row.
 *
 * @param driver - The WebDriver instance used for browser automation
 * @param row - The WebElement representing the talent row containing scaling data
 * @returns A Record mapping stat names to arrays of scaling values. For example:
 *          {
 *            "Normal Attack DMG": ["100%", "110%", "120%"],
 *            "Charged Attack DMG": ["150%", "165%", "180%"],
 *            "CD": ["12s"]
 *          }
 *          Returns empty object if scaling data cannot be retrieved.
 */
async function getTalentScaling(driver: WebDriver, row: WebElement) {
  try {
    const containerSelector =
      '.giw-collapsible[data-expandtext="▼Attribute Scaling▼"]';
    await waitForElement(driver, containerSelector);

    // Force show the content
    await driver.executeScript(`
      const containers = document.querySelectorAll('${containerSelector}');
      containers.forEach(container => {
        if (container.querySelector('.mw-collapsible-content')) {
          container.querySelector('.mw-collapsible-content').style.display = 'block';
        }
      });
    `);

    // Get the wikitable directly
    const tables = await row.findElements(
      By.css(`${containerSelector} table.wikitable`)
    );
    const scaling: Record<string, string[]> = {};

    for (const table of tables) {
      const rows = await table.findElements(By.css("tbody tr"));

      let currentSection = "";

      for (const scalingRow of rows) {
        const headings = await scalingRow.findElements(By.css("th"));

        // Check if it's a section header (th that spans all columns)
        if (headings.length === 1) {
          const colspan = await headings[0].getAttribute("colspan");
          if (colspan === "12") {
            currentSection = await headings[0].getText();
            continue;
          }
        }

        // Get the stat name and values
        if (headings.length > 0) {
          const statName = await headings[0].getText();
          if (!statName.trim()) continue;

          const values = await scalingRow.findElements(By.css("td"));
          const valueTexts = await Promise.all(
            values.map((value) => value.getText())
          );

          if (valueTexts.length > 0) {
            scaling[statName] = valueTexts;
          }
        }
      }
    }

    return scaling;
  } catch (error) {
    console.error("Error in getTalentScaling:", error);
    return {};
  }
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
async function getTalents(driver: WebDriver): Promise<TalentSchema[]> {
  const talentSelector = "table.talent-table";
  await waitForElement(driver, talentSelector);

  const rows = await driver.findElements(By.css(`${talentSelector} tr`));
  console.log(rows.length);

  const talents: TalentSchema[] = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const cells = await row.findElements(By.css("td"));

    if (cells.length == 3) {
      try {
        const talentIcon = parseUrl(
          await cells[0].findElement(By.css("a img")).getAttribute("data-src")
        );
        const talentName = await cells[1].getText();
        const talentType = await cells[2].getText();

        const descRow = rows[i + 1];
        const descCells = await descRow.findElement(By.css("td"));
        const description = (await descCells.getText()).split("▼")[0];

        const figureUrls = await getFigureUrls(driver, descRow);
        const scaling = await getTalentScaling(driver, descRow);

        talents.push({
          talentIcon,
          talentName,
          talentType,
          description,
          figureUrls,
          scaling,
        });
      } catch (error) {
        console.log("Error scraping talent:", error);
      }
    }
  }

  console.log("---------------Scraped talents---------------\n");
  return talents;
}

/**
 * Scrapes and retrieves constellation information for a character from the webpage.
 *
 * @param driver - The WebDriver instance used for browser automation.
 * @returns A Promise that resolves to an array of Constellation objects.
 */
async function getConstellations(
  driver: WebDriver
): Promise<ConstellationSchema[]> {
  const tableSelector = "table.constellation-table";
  await waitForElement(driver, tableSelector);

  const rows = await driver.findElements(By.css(`${tableSelector} tr`));
  const constellations: ConstellationSchema[] = [];
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
 * Scrapes character data from the main characters page and processes it into a structured format.
 *
 * @param driver - The WebDriver instance used for browser automation.
 * @returns A Promise that resolves to an array of character objects, excluding "Aloy" and "Traveler".
 */
export async function scrapeCharacterTable(
  driver: WebDriver
): Promise<BaseCharacterSchema[]> {
  const characters = await scrapeCharacters(driver);

  return (
    characters
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
        (character) =>
          character.name !== "Aloy" && character.name !== "Traveler"
      ) ?? []
  );
}

/**
 /**
 * Scrapes character information and saves it to a JSON file.
 *
 * @param driver - The WebDriver instance used for browser automation.
 * @returns A Promise that resolves when the characters have been saved.
 */
async function saveCharacters(driver: WebDriver) {
  const charactersTable = await scrapeCharacterTable(driver);
  const filePath = path.join(CHARACTER_DIR, "characters.json");
  await saveFileWithNewVersion(charactersTable, CHARACTER_DIR, "characters");
  return charactersTable;
}

/**
 * Scrapes and saves detailed character information for characters that haven't been processed yet.
 *
 * @param {WebDriver} driver - The Selenium WebDriver instance.
 * @param {boolean} force - Whether to force the scraping of characters even if they have already been processed.
 * @returns {Promise<void>} A promise that resolves when all characters have been processed.
 */
const scrapeAndSaveDetailedCharacterInfo = async (
  driver: WebDriver,
  force: boolean = false
): Promise<void> => {
  const characters = await loadJsonData<BaseCharacterSchema[]>(
    path.join(CHARACTER_DIR, "characters.json")
  );

  if (!characters) {
    console.error("No characters found");
    return;
  }

  await scrapeCharactersInDetail(driver, characters, force);
};

/**
 * Scrapes detailed information for each character and saves it to individual files.
 * After scraping all characters, combines the files into a single detailed characters file.
 *
 * @param driver - The Selenium WebDriver instance used for browser automation
 * @param characters - Array of base character data to scrape details for
 * @param force - If true, scrapes all characters even if they were previously saved.
 *               If false, skips characters that already have saved data.
 * @returns Promise that resolves when all characters have been scraped and saved
 */
export async function scrapeCharactersInDetail(
  driver: WebDriver,
  characters: BaseCharacterSchema[],
  force: boolean = false
) {
  const detailedDir = path.join(CHARACTER_DIR, "detailed_1");
  const savedCharacters = await listFiles(detailedDir);

  for (const char of characters) {
    const name = parseCharacterName(char.name);
    if (!force && savedCharacters.includes(name)) {
      console.log(`${char.name} already saved`);
      continue;
    }

    try {
      console.log(`Scraping ${name}`);
      const desc = await scrapeCharacterDetailed(driver, name);

      const fullDesc = {
        ...char,
        ...desc,
      };

      await saveJson(fullDesc, detailedDir, name);
    } catch (error) {
      console.error(`Error scraping ${char.name}:`, error);
    }
  }

  await morphAllFilesIntoOne();
}

/**
 * Combines all individual character detail files into a single file.
 * Reads each character's detailed data file from the detailed subdirectory,
 * combines them into a single object keyed by character name,
 * and saves the combined data to a versioned file.
 *
 * @remarks
 * The individual files are read from CHARACTER_DIR/detailed/
 * The combined file is saved to CHARACTER_DIR/characters_detailed{version}.json
 *
 * @returns Promise that resolves when the combined file has been saved
 */
async function morphAllFilesIntoOne() {
  let charactersDetailed: Record<string, AdvancedCharacterSchema> = {};
  const charDir = path.join(CHARACTER_DIR, "detailed_1");
  const files = await listFiles(charDir);

  for (const file of files) {
    const char = await loadJsonData<AdvancedCharacterSchema>(
      path.join(charDir, file)
    );

    if (char)
      charactersDetailed = {
        ...charactersDetailed,
        [char.name]: char,
      };
  }

  await saveFileWithNewVersion(
    charactersDetailed,
    CHARACTER_DIR,
    "characters_detailed"
  );
}

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

if (require.main === module) {
  main().then(() => console.log("Completed"));
}
