import { By, WebDriver, WebElement } from 'selenium-webdriver';

import { logger } from '../logger.js';
import { getTableFromHeading } from './utils.js';

/**
 * Result type for aside extraction
 * @template T - Record type mapping section indices to their parsed data types
 */
export interface AsideData<T extends Record<string, unknown>> {
  /** The h2 heading text from inside the aside element */
  title: string;

  /** Array of image URLs extracted from aside figure elements */
  images: string[];

  /** Parsed section data keyed by section index as string ('0', '1', etc.) */
  sections: T;

  /** Parsed pi-data items keyed by data-source attribute */
  data: Record<string, unknown>;
}

/**
 * Parses a URL by removing the revision suffix
 * @param url - URL to parse
 * @returns Cleaned URL without revision suffix
 */
export const parseUrl = (url: string): string =>
  url?.split('/revision/')[0] || '';

/**
 * Extracts image URL from a WebElement with fallback handling
 * Tries data-src first, then falls back to src attribute
 * @param element - WebElement containing the image
 * @param attr - Primary attribute to try ('data-src', 'src', or 'href')
 * @returns Cleaned image URL
 */
export async function getImageUrl(
  element: WebElement,
  attr: 'data-src' | 'src' | 'href' = 'data-src'
): Promise<string> {
  let url = await element.getAttribute(attr);
  if (!url && attr === 'data-src') {
    url = await element.getAttribute('src');
  }
  return parseUrl(url);
}

export async function findImageElUrls(
  container: WebElement,
  attr: 'data-src' | 'src' | 'href' = 'data-src'
) {
  const images = await container.findElements(By.css('img'));
  return await mapElements(images, (img) => getImageUrl(img, attr));
}

/**
 * Parses material cards from a container element
 * Extracts image URL, caption, and optional count from card elements
 * @param container - Parent element containing material cards
 * @param selector - CSS selector for card elements
 * @returns Array of material data with url, caption, and optional count
 */
export async function parseMaterialCards(
  container: WebElement,
  selector: string = 'div.card-container'
): Promise<Array<{ url: string; caption: string; count: number }>> {
  const cards = await container.findElements(By.css(selector));

  const parseCount = async (card: WebElement): Promise<number> => {
    try {
      const countText = await card
        .findElement(By.css('span.card-text'))
        .getText();
      return Number.parseInt(countText.replace(/,/g, ''), 10);
    } catch {
      return 0;
    }
  };

  return await mapElements(
    cards,
    async (card) => {
      const img = await card.findElement(By.css('img'));
      const imageUrl = await getImageUrl(img);
      const caption = await card
        .findElement(By.css('span.card-caption'))
        .getText();

      return { url: imageUrl, caption, count: await parseCount(card) };
    },
    { fallback: { url: '', caption: '', count: 0 } }
  );
}

/**
 * Generic table scraping utility
 * Finds a table by heading, extracts rows, and parses them using the provided parser
 */
export async function scrapeTable<T>(
  driver: WebDriver,
  heading: string,
  headingLevel: 'h2' | 'h3',
  parseRow: (row: WebElement, index: number) => Promise<T | null>
): Promise<T[]> {
  try {
    const table = await getTableFromHeading(driver, heading, headingLevel);
    const rows = await table.findElements(By.css('tbody tr'));
    const results = await mapElements(rows, parseRow);
    return results.filter((r) => r !== null) as T[];
  } catch (error) {
    logger.warn(`Table "${heading}" not found:`, error);
    return [];
  }
}

/**
 * Attempts multiple extraction strategies in sequence
 * Returns the first successful result or null if all fail
 * @param attempts - Array of async functions to try in order
 * @returns First successful result or null
 */
export async function tryExtract<T>(
  attempts: Array<() => Promise<T>>
): Promise<T | null> {
  for (const attempt of attempts) {
    try {
      return await attempt();
    } catch {
      // Try next attempt
    }
  }
  return null;
}

/**
 * Safely executes an async function with error handling
 * @param fn - Async function to execute
 * @param errorMsg - Error message to log on failure
 * @param fallback - Fallback value to return on error
 * @returns Result of fn or fallback value
 */
export async function safeExecute<T>(
  fn: () => Promise<T>,
  errorMsg: string,
  fallback: T
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    logger.error(errorMsg, error);
    return fallback;
  }
}

/**
 * Safely processes an array of WebElements concurrently using Promise.allSettled
 * Handles errors gracefully and filters out failed results, null values, or uses fallback values
 */
export async function mapElements<T>(
  elements: WebElement[],
  parseElement: (element: WebElement, index: number) => Promise<T | null>,
  options?: {
    fallback?: T;
    logErrors?: boolean;
  }
): Promise<T[]> {
  const { fallback, logErrors = true } = options ?? {};

  const results = await Promise.allSettled(
    elements.map((el, idx) => parseElement(el, idx))
  );

  return results
    .map((result, idx) => {
      if (result.status === 'fulfilled') {
        return result.value;
      } else {
        if (logErrors) {
          logger.debug(
            `Failed to process element at index ${idx}:`,
            result.reason
          );
        }
        return fallback;
      }
    })
    .filter((r): r is T => r !== undefined && r !== null);
}

/**
 * Extracts tab labels paired with their content elements from a tabbed container
 * Used within section parsers to handle wds-tabber sections
 * @param container - WebElement containing the wds-tabber (typically a section)
 * @returns Array of tab label + content WebElement pairs
 */
export async function extractTabs(
  container: WebElement
): Promise<Array<{ label: string; content: WebElement }>> {
  const tabItems = await container.findElements(
    By.css('ul.wds-tabs > li.wds-tabs__tab')
  );
  const tabContents = await container.findElements(
    By.css('div.wds-tab__content')
  );

  logger.info(
    `Found ${tabItems.length} tabs and ${tabContents.length} tab contents`
  );

  return await mapElements(tabItems, async (tab, index) => {
    const labelEl = await tab.findElement(By.css('div.wds-tabs__tab-label'));
    const label = (await labelEl.getText()).trim();
    const content = tabContents[index];
    if (!content) return null;
    return { label, content };
  });
}

/**
 * Generic function to extract data from wiki page aside elements
 * Automatically extracts title (h2) and images (from figures), plus custom section and pi-data
 */
export async function extractAside<T extends Record<string, unknown>>(
  driver: WebDriver,
  sectionFunctionMap: Record<
    number,
    (section: WebElement) => Promise<unknown>
  > = {},
  divPiDataFunctionMap: Record<
    string,
    (div: WebElement) => Promise<unknown>
  > = {}
): Promise<AsideData<T>> {
  const aside = await driver.findElement(By.css('aside'));

  let title = '';
  try {
    const h2 = await aside.findElement(By.css('h2'));
    title = (await h2.getText()).trim();
  } catch (error) {
    logger.debug('H2 heading not found in aside:', error);
  }

  let images: string[] = [];
  try {
    const figures = await aside.findElements(
      By.css('figure.pi-item.pi-image[data-source="image"]')
    );

    logger.info(`Found ${figures.length} aside figures`);

    images = await mapElements(figures, async (figure) => {
      const link = await figure.findElement(By.css('a.image.image-thumbnail'));
      const href = await link.getAttribute('href');
      return parseUrl(href);
    });

    logger.info(`Extracted ${images.length} aside images`);
  } catch (error) {
    logger.debug('No figures found in aside:', error);
  }

  // Extract div.pi-item.pi-data elements (direct children of aside only)
  const data: Record<string, unknown> = {};
  if (Object.keys(divPiDataFunctionMap).length > 0) {
    try {
      const piDataItems = await aside.findElements(
        By.xpath(
          './div[contains(@class, "pi-item") and contains(@class, "pi-data")]'
        )
      );
      logger.info(`Found ${piDataItems.length} pi-data items in aside`);

      for (const item of piDataItems) {
        const dataSource = await item.getAttribute('data-source');
        if (dataSource && divPiDataFunctionMap[dataSource]) {
          try {
            data[dataSource] = await divPiDataFunctionMap[dataSource](item);
          } catch (error) {
            logger.warn(`Failed to parse pi-data item "${dataSource}":`, error);
            data[dataSource] = null;
          }
        }
      }
    } catch (error) {
      logger.debug('No pi-data items found in aside:', error);
    }
  }

  // Find top-level sections in aside (pi-group only, excludes nested sections)
  const sections: Record<string, unknown> = {};
  let allSections: WebElement[] = [];

  try {
    allSections = await aside.findElements(
      By.xpath(
        './section[contains(@class, "pi-item") and contains(@class, "pi-group")]'
      )
    );
    logger.info(`Found ${allSections.length} sections in aside`);
  } catch (error) {
    logger.debug('No sections found in aside:', error);
  }

  // Process each section based on sectionFunctionMap
  for (const [indexStr, parseFunction] of Object.entries(sectionFunctionMap)) {
    const index = parseInt(indexStr, 10);

    if (index >= 0 && index < allSections.length) {
      try {
        const sectionData = await parseFunction(allSections[index]);
        sections[indexStr] = sectionData;
      } catch (error) {
        logger.warn(`Failed to parse section ${index}:`, error);
        sections[indexStr] = null;
      }
    } else {
      logger.warn(
        `Section index ${index} out of range (0-${allSections.length - 1})`
      );
      sections[indexStr] = null;
    }
  }

  return {
    title,
    images,
    sections: sections as T,
    data,
  };
}

/**
 * Extracts gallery images from .wikia-gallery-item containers
 * These are typically found in wiki gallery sections
 * @param driver - Selenium WebDriver instance
 * @returns Array of image URLs from gallery items (full resolution)
 */
export async function extractGalleryImages(
  driver: WebDriver
): Promise<string[]> {
  try {
    const galleryItems = await driver.findElements(
      By.css('.wikia-gallery-item')
    );

    logger.info(`Found ${galleryItems.length} gallery items`);

    const images = await mapElements(galleryItems, async (item) => {
      const img = await item.findElement(By.css('img'));
      return await getImageUrl(img, 'data-src');
    });

    logger.info(`Extracted ${images.length} gallery images`);
    return images;
  } catch (error) {
    logger.warn('Failed to extract gallery images:', error);
    return [];
  }
}
