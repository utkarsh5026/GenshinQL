import { Builder, until, WebDriver, By } from "selenium-webdriver";
import chrome from "selenium-webdriver/chrome";
import fs from "fs/promises";
import path from "path";

const DATA_PATH = path.join(__dirname, "..", "..", "data");

/**
 * URL for the Genshin Impact Fandom wiki.
 */
export const URL = "https://genshin-impact.fandom.com/wiki";

/**
 * Sets up and returns a Selenium WebDriver for Chrome.
 * @returns {Promise<WebDriver>} A Promise that resolves to a WebDriver instance.
 */
export async function setupDriver(): Promise<WebDriver> {
  const options = new chrome.Options();
  return new Builder().forBrowser("chrome").setChromeOptions(options).build();
}

/**
 * Saves the scraped weapon data to a JSON file.
 * @param {any} data - The weapon data to save.
 * @param {string} subDir - The subdirectory to save the data in.
 * @param {string} fileName - The filename to save the data as.
 */
export async function saveJson(data: any, subDir: string, fileName: string) {
  const basePath = path.join(DATA_PATH, subDir);
  try {
    try {
      await fs.access(basePath);
    } catch {
      await fs.mkdir(basePath, { recursive: true });
      console.log(`Created directory: ${basePath}`);
    }
    const jsonData = JSON.stringify(data, null, 4);
    await fs.writeFile(path.join(basePath, `${fileName}.json`), jsonData);
  } catch (error) {
    console.error(`Error saving ${fileName}:`, error);
  }
}
