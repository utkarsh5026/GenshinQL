import chalk from 'chalk';
import { By, until, WebDriver, WebElement } from 'selenium-webdriver';

import { GenshinImageSchema } from './schema.js';
import { getImageUrl } from './scraping-helpers.js';
import { waitForElementCss } from './setup.js';

const TIME_TO_WAIT_FOR_ELEMENT_MS = 10000;

export const underScore = (str: string) => str.split(' ').join('_');

export const parseCharacterName = (name: string) => name.split(' ').join('_');

export const toOriginalName = (name: string) => name.split('_').join(' ');

export const parseUrl = (url: string) => url.split('/revision/')[0];

export const findImageInCell = async (cell: WebElement) => {
  try {
    return await cell.findElement(By.css('img')).getAttribute('data-src');
  } catch {
    return '';
  }
};

export const waitForElement = async (
  driver: WebDriver,
  cssSelector: string
) => {
  await driver.wait(
    until.elementLocated(By.css(cssSelector)),
    TIME_TO_WAIT_FOR_ELEMENT_MS
  );
};

export const waitAndGetElement = async (
  driver: WebDriver,
  cssSelector: string
): Promise<WebElement> => {
  await waitForElement(driver, cssSelector);
  return driver.findElement(By.css(cssSelector));
};

export const findImageAltInCell = async (cell: WebElement) => {
  try {
    return await cell.findElement(By.css('img')).getAttribute('alt');
  } catch {
    return '';
  }
};

/**
 * Finds the next table sibling element after the parent of a specified element
 */
export async function getParentNextTableSibling(
  driver: WebDriver,
  selector: string
): Promise<WebElement> {
  return await getParentNextSibling(driver, selector, 'table');
}

/**
 * Finds the next div sibling element after the parent of a specified element
 */
export const getParentNextDivSibling = async (
  driver: WebDriver,
  selector: string
): Promise<WebElement> => getParentNextSibling(driver, selector, 'div');

/**
 * Finds the next sibling element of a specified type after the parent of a specified element
 */
export async function getParentNextSibling(
  driver: WebDriver,
  selector: string,
  element: string
): Promise<WebElement> {
  await waitForElementCss(driver, selector);
  return driver
    .findElement(By.css(selector))
    .findElement(By.xpath('..'))
    .findElement(By.xpath(`following-sibling::${element}`));
}

export const getTableFromHeading = async (
  driver: WebDriver,
  headingTitle: string,
  heading: 'h2' | 'h3' = 'h2'
) => {
  const id = headingTitle.split(' ').join('_');
  const tableSelector = `//${heading}[*[@id='${id}'] or normalize-space(.)='${headingTitle}']/following-sibling::table[1]`;
  console.log(
    chalk.yellow('Looking for table with XPath:'),
    chalk.gray(tableSelector)
  );
  await driver.wait(
    until.elementLocated(By.xpath(tableSelector)),
    TIME_TO_WAIT_FOR_ELEMENT_MS
  );
  console.log(chalk.green('Table found successfully!'));
  return driver.findElement(By.xpath(tableSelector));
};

/**
 * Finds a wikia-gallery element after a heading and extracts all image URLs and captions.
 * Follows the same pattern as getTableFromHeading but targets gallery elements.
 * Uses Promise.allSettled for durability - continues even if individual items fail to extract.
 *
 * @param driver - Selenium WebDriver instance
 * @param headingTitle - The heading text to search for (e.g., "Character Gallery")
 * @param heading - The heading level to search for ('h2' or 'h3', defaults to 'h2')
 * @returns Array of image objects with url and caption properties
 *
 * @example
 * const images = await getImagesFromHeading(driver, 'Gallery', 'h2');
 * // Returns: [{ url: '...', caption: 'Image 1' }, { url: '...', caption: 'Image 2' }]
 */
export const getImagesFromHeading = async (
  driver: WebDriver,
  headingTitle: string,
  heading: 'h2' | 'h3' = 'h2'
): Promise<GenshinImageSchema[]> => {
  try {
    const id = headingTitle.split(' ').join('_');
    const gallerySelector = `//${heading}[*[@id='${id}'] or normalize-space(.)='${headingTitle}']/following-sibling::*[descendant::div[contains(@class, 'wikia-gallery')]][1]`;

    console.log(
      chalk.yellow('Looking for gallery with XPath:'),
      chalk.gray(gallerySelector)
    );

    await driver.wait(
      until.elementLocated(By.xpath(gallerySelector)),
      TIME_TO_WAIT_FOR_ELEMENT_MS
    );

    console.log(chalk.green('Gallery found successfully!'));

    const container = await driver.findElement(By.xpath(gallerySelector));
    const galleryItems = await container.findElements(
      By.css('.wikia-gallery-item')
    );

    console.log(chalk.cyan(`Found ${galleryItems.length} gallery items`));

    const results = await Promise.allSettled(
      galleryItems.map(async (item): Promise<GenshinImageSchema> => {
        const img = await item.findElement(By.css('img'));
        const url = await getImageUrl(img, 'data-src');

        const captionEl = await item.findElement(By.css('.lightbox-caption'));
        const caption = await captionEl.getText();

        return {
          url: parseUrl(url),
          caption: caption.trim(),
        };
      })
    );

    const images = results
      .filter(
        (result): result is PromiseFulfilledResult<GenshinImageSchema> => {
          if (result.status === 'rejected') {
            return false;
          }
          return true;
        }
      )
      .map((result) => result.value);

    console.log(chalk.green(`Successfully extracted ${images.length} images`));
    return images;
  } catch (error) {
    console.log(
      chalk.yellow(`Gallery not found for heading "${headingTitle}"`),
      chalk.gray(error instanceof Error ? error.message : String(error))
    );
    return [];
  }
};

export async function safeGet<T>(
  fn: () => Promise<T>,
  defaultValue: T
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    console.error(`Error in safeGet:`, error);
    return defaultValue;
  }
}

/**
 * Executes an array of async functions in batches to avoid overwhelming Selenium
 * with too many concurrent WebDriver instances.
 * Prevents MaxListenersExceededWarning by limiting concurrency.
 *
 * @param tasks - Array of async functions that return a result
 * @param batchSize - Number of concurrent tasks to run (default: 3)
 * @param onBatchComplete - Optional callback after each batch completes
 * @returns Array of results from all tasks
 */
export async function launchDriverInBatch<T>(
  tasks: Array<() => Promise<T>>,
  batchSize: number = 3,
  onBatchComplete?: (batchIndex: number, totalBatches: number) => void
): Promise<T[]> {
  const results: T[] = [];
  const totalBatches = Math.ceil(tasks.length / batchSize);

  for (let i = 0; i < tasks.length; i += batchSize) {
    const batch = tasks.slice(i, i + batchSize);
    const batchIndex = Math.floor(i / batchSize) + 1;

    const batchResults = await Promise.all(batch.map((task) => task()));
    results.push(...batchResults);

    onBatchComplete?.(batchIndex, totalBatches);
  }

  return results;
}

/**
 * Executes an array of async functions in batches, handling errors gracefully.
 * Failed tasks return undefined instead of throwing.
 *
 * @param tasks - Array of async functions that return a result
 * @param batchSize - Number of concurrent tasks to run (default: 3)
 * @param onBatchComplete - Optional callback after each batch completes
 * @returns Array of results (undefined for failed tasks)
 */
export async function launchDriverInBatchSafe<T>(
  tasks: Array<() => Promise<T>>,
  batchSize: number = 3,
  onBatchComplete?: (batchIndex: number, totalBatches: number) => void
): Promise<Array<T | undefined>> {
  const wrappedTasks = tasks.map((task) => async (): Promise<T | undefined> => {
    try {
      return await task();
    } catch (error) {
      console.error('Task failed in batch:', error);
      return undefined;
    }
  });

  return launchDriverInBatch(wrappedTasks, batchSize, onBatchComplete);
}
