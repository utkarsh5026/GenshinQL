import {Builder, By, until, WebDriver} from "selenium-webdriver";
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
    options.addArguments("--ignore-certificate-errors");
    options.addArguments("--ignore-ssl-errors");
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
            await fs.mkdir(basePath, {recursive: true});
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
        const filePath = path.join(DATA_PATH, subDir);
        await fs.access(filePath);
        return JSON.parse(await fs.readFile(filePath, "utf-8"));
    } catch {
        return null;
    }
}

/**
 * Lists all directories within a given directory.
 *
 * @param dirPath - The path to the directory to list.
 * @returns A Promise that resolves to an array of directory names.
 */
export async function listDirectories(dirPath: string): Promise<string[]> {
    try {
        const fullPath = path.join(DATA_PATH, dirPath);
        const entries = await fs.readdir(fullPath, {withFileTypes: true});
        return entries
            .filter((entry) => entry.isDirectory())
            .map((entry) => entry.name);
    } catch (error) {
        console.error(`Error listing directories in ${dirPath}:`, error);
        return [];
    }
}

/**
 * Lists only files (not directories) in a directory
 *
 * @param dirPath - Path to the directory
 * @returns Promise resolving to array of filenames
 */
export async function listFiles(dirPath: string): Promise<string[]> {
    try {
        const fullPath = path.join(DATA_PATH, dirPath);
        const entries = await fs.readdir(fullPath, {withFileTypes: true});
        const files = entries
            .filter((entry) => entry.isFile())
            .map((entry) => entry.name);
        return files;
    } catch (error) {
        console.error(`Error reading directory ${dirPath}:`, error);
        return [];
    }
}

export function waitForElementCss(driver: WebDriver, css: string, timeout = 10000) {
    return driver.wait(until.elementLocated(By.css(css)), timeout);
}

export function waitForElementXpath(driver: WebDriver, xpath: string, timeout = 10000) {
    return driver.wait(until.elementLocated(By.xpath(xpath)), timeout);
}