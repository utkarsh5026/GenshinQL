import { saveJson, setupDriver, URL } from "./setup";
import { By, WebDriver } from "selenium-webdriver";
import { z } from "zod";
import { talentDaySchema } from "./schema";

const TALENT_URL = `${URL}/Character_Talent_Material`;

const locations = [
  "Mondstadt",
  "Liyue",
  "Inazuma",
  "Sumeru",
  "Fontaine",
  "Natlan",
] as const;
type Location = (typeof locations)[number];
type Talent = z.infer<typeof talentDaySchema>;

const parseUrl = (url: string) => url.split("/revision/")[0];

/**
 * Loads talent materials for all specified locations and saves them to a JSON file.
 * @param driver The WebDriver instance used to navigate and scrape the web page.
 */
async function loadTalents(driver: WebDriver) {
  const loc: Record<string, Talent[]> = {};
  for (const location of locations) {
    loc[location] = await findTalentsForRegion(location, driver);
  }

  try {
    await saveJson(loc, "talents", "dailyTalents");
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
async function findTalentsForRegion(
  region: Location,
  driver: WebDriver
): Promise<Talent[]> {
  const table = await driver
    .findElement(By.css(`span#${region}`))
    .findElement(By.xpath("./parent::*"))
    .findElement(By.xpath("./following-sibling::table"));

  const tableBody = await table.findElement(By.css("tbody"));
  const rows = await tableBody.findElements(By.css("tr"));

  const talents: Talent[] = [];

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

async function loadDailyTalents() {
  const driver = await setupDriver();
  await driver.get(TALENT_URL);
  try {
    await loadTalents(driver);
  } finally {
    await driver.quit();
  }
}

loadDailyTalents().then(() => console.log("Done!"));
