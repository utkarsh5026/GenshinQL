import { setupDriver } from "./setup";
import { By, WebDriver } from "selenium-webdriver";
import { TalentDaySchema } from "./schema";
import { getParentNextTableSibling } from "./utils";
import { TALENT_URL } from "./urls";
import { saveFile, TALENT_DIR, TALENT_FILE } from "./fileio";

const locations = [
  "Mondstadt",
  "Liyue",
  "Inazuma",
  "Sumeru",
  "Fontaine",
  "Natlan",
] as const;

const parseUrl = (url: string) => url.split("/revision/")[0];

/**
 * Loads talent materials for all specified locations and saves them to a JSON file.
 * @param driver The WebDriver instance used to navigate and scrape the web page.
 */
async function loadTalents(driver: WebDriver) {
  const loc: Record<string, TalentDaySchema[]> = {};

  try {
    for (const location of locations) {
      loc[location] = await findTalentsForRegion(location, driver);
    }
    await saveFile(loc, TALENT_DIR, TALENT_FILE);
  } catch (error) {
    console.error("Error saving talents:", error);
  }
}

/**
 * Finds and retrieves talent materials for a specific region.
 * @param region The region for which to find talent materials.
 * @param driver The WebDriver instance used to navigate and scrape the web page.
 * @returns A promise that resolves to an array of Talent objects.
 */
export async function findTalentsForRegion(
  region: string,
  driver: WebDriver
): Promise<TalentDaySchema[]> {
  const table = await getParentNextTableSibling(driver, `span#${region}`);

  const tableBody = await table.findElement(By.css("tbody"));
  const rows = await tableBody.findElements(By.css("tr"));

  const talents: TalentDaySchema[] = [];

  for (const row of rows) {
    const cells = await row.findElements(By.css("td"));
    if (cells.length !== 3) continue;
    const day = await cells[0].getText();

    const bookImages = await cells[1]
      .findElement(By.css("span.card-list-container"))
      .findElements(By.css("span.card-image-container img"));

    const books = await Promise.all(
      bookImages.map(async (book) => {
        const name = await book.getAttribute("alt");
        const url = await book.getAttribute("data-src");
        return { name, url: parseUrl(url) };
      })
    );

    const characterContainers = await cells[2].findElements(
      By.css("span.card-body")
    );

    const characters = await Promise.all(
      characterContainers.map(async (container) => {
        const name = await container
          .findElement(By.css("span.card-text"))
          .getText();
        const url = await container
          .findElement(By.css(`span.card-image-container img`))
          .getAttribute("data-src");
        return { name, url: parseUrl(url) };
      })
    );

    talents.push({ day, books, characters });
  }
  return talents;
}

async function main() {
  const args = process.argv.slice(2);

  const driver = await setupDriver();
  await driver.get(TALENT_URL);
  try {
    await loadTalents(driver);
  } finally {
    await driver.quit();
  }
}

if (require.main === module) {
  main().then(() => console.log("Done!"));
}
