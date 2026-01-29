import { Builder, By, until, WebDriver } from "selenium-webdriver";
import * as chrome from "selenium-webdriver/chrome";
import * as fs from "node:fs/promises";
import * as path from "node:path";
import { BASE_DIR } from "./fileio.js";

/**
 * URL for the Genshin Impact Fandom wiki.
 */
export const URL = "https://genshin-impact.fandom.com/wiki";

/**
 * Sets up and returns a Selenium WebDriver for Chrome.
 */
export async function setupDriver(): Promise<WebDriver> {
  const options = new chrome.Options();
  options.addArguments("--ignore-certificate-errors");
  options.addArguments("--ignore-ssl-errors");
  return new Builder().forBrowser("chrome").setChromeOptions(options).build();
}

/**
 * Saves the scraped weapon data to a JSON file.
 */
export async function saveJson(
  data: unknown,
  subDir: string,
  fileName: string,
) {
  const basePath = path.join(BASE_DIR, subDir);
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

export async function loadJsonPath(subDir: string) {
  try {
    const filePath = path.join(BASE_DIR, subDir);
    await fs.access(filePath);
    return JSON.parse(await fs.readFile(filePath, "utf-8"));
  } catch {
    return null;
  }
}

/**
 * Lists all directories within a given directory.
 */
export async function listDirectories(dirPath: string): Promise<string[]> {
  try {
    const fullPath = path.join(BASE_DIR, dirPath);
    const entries = await fs.readdir(fullPath, { withFileTypes: true });
    return entries
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name);
  } catch (error) {
    console.error(`Error listing directories in ${dirPath}:`, error);
    return [];
  }
}

export function waitForElementCss(
  driver: WebDriver,
  css: string,
  timeout = 20000,
) {
  return driver.wait(until.elementLocated(By.css(css)), timeout);
}

export function waitForElementXpath(
  driver: WebDriver,
  xpath: string,
  timeout = 10000,
) {
  return driver.wait(until.elementLocated(By.xpath(xpath)), timeout);
}
