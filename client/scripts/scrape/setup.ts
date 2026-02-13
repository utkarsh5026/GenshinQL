import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

import { Builder, By, until, WebDriver } from 'selenium-webdriver';
import * as chrome from 'selenium-webdriver/chrome.js';

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
 * Reads mode from NODE_ENV environment variable - if 'production', runs in headless mode
 * @param forceVisible - If true, forces visible browser mode regardless of NODE_ENV
 */
export async function setupDriver(
  forceVisible: boolean = false
): Promise<WebDriver> {
  const isHeadless = !forceVisible && process.env.NODE_ENV === 'production';

  logger.info('🚀 Setting up Chrome WebDriver...');
  logger.cyan(
    `   Mode: ${isHeadless ? 'Headless (Production)' : 'Visible Browser (Development)'}`
  );

  const options = new chrome.Options();
  options.addArguments('--ignore-certificate-errors');
  options.addArguments('--ignore-ssl-errors');

  // Run in headless mode for production
  if (isHeadless) {
    options.addArguments('--headless=new'); // Use new headless mode
  }

  options.addArguments('--disable-gpu');
  options.addArguments('--no-sandbox');
  options.addArguments('--disable-dev-shm-usage');
  options.addArguments('--window-size=1920,1080');
  options.addArguments(
    '--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36'
  );

  options.addArguments('--log-level=3'); // Only fatal errors
  options.addArguments('--silent');
  options.addArguments('--disable-logging');

  options.addArguments('--disable-blink-features=AutomationControlled');
  options.excludeSwitches('enable-automation');
  options.addArguments('--disable-web-security');
  options.addArguments('--disable-features=IsolateOrigins,site-per-process');
  options.setUserPreferences({
    'profile.default_content_setting_values.notifications': 2,
    'profile.managed_default_content_settings.images': 1,
  });

  logger.debug('   Initializing ChromeDriver...');
  const service = new chrome.ServiceBuilder(getChromedriverPath()).setStdio(
    'ignore'
  );
  const driver = await new Builder()
    .forBrowser('chrome')
    .setChromeOptions(options)
    .setChromeService(service)
    .build();

  // Set global timeouts for the driver
  logger.debug('   Configuring timeouts...');
  await driver.manage().setTimeouts({
    // Maximum time to wait for a page to load (5 minutes for slow pages)
    pageLoad: 300000,
    // Maximum time for executeScript/executeAsyncScript to complete
    script: 60000,
    // Implicit wait time when locating elements (0 recommended, use explicit waits instead)
    implicit: 0,
  });
  logger.cyan('   ↳ Page load timeout: 5 minutes');
  logger.cyan('   ↳ Script timeout: 60 seconds');

  // Enhanced anti-detection JavaScript
  await driver.executeScript(`
    // Override webdriver property
    Object.defineProperty(navigator, 'webdriver', {get: () => undefined});

    // Override plugins and mimeTypes
    Object.defineProperty(navigator, 'plugins', {get: () => [1, 2, 3, 4, 5]});
    Object.defineProperty(navigator, 'mimeTypes', {get: () => [1, 2, 3, 4]});

    // Override permissions
    const originalQuery = window.navigator.permissions.query;
    window.navigator.permissions.query = (parameters) => (
      parameters.name === 'notifications' ?
        Promise.resolve({ state: Notification.permission }) :
        originalQuery(parameters)
    );

    // Override chrome property
    window.chrome = { runtime: {} };
  `);

  logger.success('✓ WebDriver ready!\n');
  return driver;
}

export async function withWebDriver<T = void>(
  fn: (driver: WebDriver) => Promise<T>,
  forceVisible: boolean = false
): Promise<T> {
  const driver = await setupDriver(forceVisible);
  try {
    logger.info('▶ Starting scraping operation...\n');
    const result = await fn(driver);
    logger.success('\nScraping completed successfully!');
    return result;
  } catch (error) {
    logger.error('\nError during scraping:');
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
  timeout = 60000 // Increased to 60 seconds
) {
  return driver.wait(until.elementLocated(By.css(css)), timeout);
}

export function waitForElementXpath(
  driver: WebDriver,
  xpath: string,
  timeout = 60000 // Increased to 60 seconds
) {
  return driver.wait(until.elementLocated(By.xpath(xpath)), timeout);
}

/**
 * Waits for the page to be fully loaded by checking document.readyState
 * and waiting for any pending network requests to complete.
 */
export async function waitForPageLoad(
  driver: WebDriver,
  timeout = 60000 // Increased to 60 seconds
): Promise<void> {
  await driver.wait(
    async () => {
      const readyState = await driver.executeScript(
        'return document.readyState'
      );
      return readyState === 'complete';
    },
    timeout,
    'Page did not finish loading'
  );

  await driver.sleep(2000);
}

/**
 * Checks if Cloudflare CAPTCHA is present and waits for user to solve it
 */
export async function handleCloudflareChallenge(
  driver: WebDriver
): Promise<void> {
  try {
    // Check if we're on a Cloudflare challenge page
    const pageSource = await driver.getPageSource();
    const isCloudflare =
      pageSource.includes('Cloudflare') &&
      (pageSource.includes('Verify you are human') ||
        pageSource.includes('Just a moment'));

    if (isCloudflare) {
      logger.warn('🛡️  Cloudflare challenge detected!');
      logger.warn('   Please solve the CAPTCHA in the browser window...');
      logger.warn('   Waiting for challenge to complete (max 60 seconds)...\n');

      // Wait for Cloudflare challenge to be solved (URL should change or page should load)
      const startTime = Date.now();
      const maxWait = 60000; // 60 seconds

      while (Date.now() - startTime < maxWait) {
        await driver.sleep(1000);
        const currentSource = await driver.getPageSource();

        // Check if we're past the challenge
        const stillOnChallenge =
          currentSource.includes('Cloudflare') &&
          currentSource.includes('Verify you are human');

        if (!stillOnChallenge) {
          logger.success('✓ Cloudflare challenge passed!\n');
          await driver.sleep(2000); // Wait for page to fully load
          return;
        }
      }

      logger.error('✗ Cloudflare challenge not solved within 60 seconds');
      throw new Error('Cloudflare challenge timeout');
    }
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === 'Cloudflare challenge timeout'
    ) {
      throw error;
    }
    // If we can't detect Cloudflare, just continue
    logger.debug('  ↳ No Cloudflare challenge detected');
  }
}
