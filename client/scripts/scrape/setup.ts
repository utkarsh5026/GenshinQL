import { Builder, By, until, WebDriver } from 'selenium-webdriver';
import * as chrome from 'selenium-webdriver/chrome';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import { logger } from '../logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * URL for the Genshin Impact Fandom wiki.
 */
export const URL = 'https://genshin-impact.fandom.com/wiki';

/**
 * Gets the path to the local ChromeDriver binary.
 */
function getChromedriverPath(): string {
  const chromedriverPath = path.join(
    __dirname,
    '..',
    '..',
    'node_modules',
    'chromedriver',
    'lib',
    'chromedriver',
    process.platform === 'win32' ? 'chromedriver.exe' : 'chromedriver'
  );
  return chromedriverPath;
}

/**
 * Sets up and returns a Selenium WebDriver for Chrome.
 * Uses the local ChromeDriver from node_modules for better portability.
 * @param mode - If 'prod', runs in headless mode; otherwise shows the browser
 */
export async function setupDriver(mode?: string): Promise<WebDriver> {
  const isHeadless = mode === 'prod';

  logger.info('🚀 Setting up Chrome WebDriver...');
  logger.cyan(
    `   Mode: ${isHeadless ? 'Headless (Production)' : 'Visible Browser (Development)'}`
  );

  const options = new chrome.Options();
  options.addArguments('--ignore-certificate-errors');
  options.addArguments('--ignore-ssl-errors');

  // Run in headless mode for production
  if (isHeadless) {
    options.addArguments('--headless');
  }

  options.addArguments('--disable-gpu');
  options.addArguments('--no-sandbox');
  options.addArguments('--disable-dev-shm-usage');
  options.addArguments('--window-size=1920,1080');
  options.addArguments(
    '--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  );

  options.addArguments('--disable-blink-features=AutomationControlled');
  options.excludeSwitches('enable-automation');
  options.addArguments('--disable-web-security');

  logger.debug('   Initializing ChromeDriver...');
  const service = new chrome.ServiceBuilder(getChromedriverPath());

  const driver = await new Builder()
    .forBrowser('chrome')
    .setChromeOptions(options)
    .setChromeService(service)
    .build();

  await driver.executeScript(
    "Object.defineProperty(navigator, 'webdriver', {get: () => undefined})"
  );

  logger.success('✓ WebDriver ready!\n');
  return driver;
}

export async function withWebDriver(
  fn: (driver: WebDriver) => Promise<void>,
  mode?: string
) {
  const driver = await setupDriver(mode);
  try {
    logger.info('▶ Starting scraping operation...\n');
    await fn(driver);
    logger.success('\n✓ Scraping completed successfully!');
  } catch (error) {
    logger.error('\n✗ Error during scraping:');
    logger.error(`   ${error}`);
    throw error;
  } finally {
    logger.debug('🔄 Closing WebDriver...');
    await driver.quit();
    logger.debug('✓ WebDriver closed\n');
  }
}


export function waitForElementCss(
  driver: WebDriver,
  css: string,
  timeout = 20000
) {
  return driver.wait(until.elementLocated(By.css(css)), timeout);
}

export function waitForElementXpath(
  driver: WebDriver,
  xpath: string,
  timeout = 10000
) {
  return driver.wait(until.elementLocated(By.xpath(xpath)), timeout);
}
