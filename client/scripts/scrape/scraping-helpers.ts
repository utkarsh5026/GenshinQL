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
  if (!images) return [];
  return await Promise.all(images.map((img) => getImageUrl(img, attr)));
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

  return await Promise.all(
    cards.map(async (card) => {
      try {
        const img = await card.findElement(By.css('img'));
        const imageUrl = await getImageUrl(img);
        const caption = await card
          .findElement(By.css('span.card-caption'))
          .getText();

        // Try to get count if present
        let count: number | undefined;
        try {
          const countText = await card
            .findElement(By.css('span.card-text'))
            .getText();
          count = parseInt(countText.replace(/,/g, ''), 10);
        } catch {
          // Count is optional
        }

        return { url: imageUrl, caption, count: count ?? 0 };
      } catch (error) {
        logger.debug('Failed to parse material card:', error);
        return { url: '', caption: '', count: 0 };
      }
    })
  );
}

/**
 * Generic table scraping utility
 * Finds a table by heading, extracts rows, and parses them using the provided parser
 * @param driver - WebDriver instance
 * @param heading - Heading text to locate the table
 * @param headingLevel - HTML heading level ('h2' or 'h3')
 * @param parseRow - Function to parse each row into type T
 * @param filter - Optional filter function to apply to results
 * @returns Array of parsed and filtered results
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
    const results = await Promise.all(rows.map(parseRow));
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
 * Generic function to extract data from wiki page aside elements
 * Automatically extracts title (h2) and images (from figures), plus custom section data
 *
 * @param driver - Selenium WebDriver instance
 * @param sectionFunctionMap - Map of section index to parser function
 *   - Key: section index as number (0 = first section, 1 = second section, etc.)
 *   - Value: async function that receives the section WebElement and returns parsed data
 * @returns Object containing title, images array, and section data keyed by index
 *
 * @example
 * // Extract only title and images (no sections)
 * const { title, images } = await extractAside(driver, {});
 *
 * @example
 * // Extract banner duration from first section
 * const result = await extractAside<{ '0': { start: string; end: string } }>(driver, {
 *   0: async (section) => {
 *     const tbody = await section.findElement(By.css('table tbody'));
 *     const start = await tbody.findElement(By.css('td[data-source="time_start"]')).getText();
 *     const end = await tbody.findElement(By.css('td[data-source="time_end"]')).getText();
 *     return { start: start.trim(), end: end.trim() };
 *   }
 * });
 * const duration = result.sections['0'];
 */
export async function extractAside<T extends Record<string, unknown>>(
  driver: WebDriver,
  sectionFunctionMap: Record<
    number,
    (section: WebElement) => Promise<unknown>
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

  const images: string[] = [];
  try {
    const figures = await aside.findElements(
      By.css('figure.pi-item.pi-image[data-source="image"]')
    );

    logger.info(`Found ${figures.length} aside figures`);

    for (const figure of figures) {
      try {
        // Find the <a class="image image-thumbnail"> child
        const link = await figure.findElement(
          By.css('a.image.image-thumbnail')
        );
        const href = await link.getAttribute('href');

        if (href) {
          const cleanUrl = parseUrl(href);
          images.push(cleanUrl);
        }
      } catch (error) {
        logger.debug('Failed to extract image from figure:', error);
      }
    }

    logger.info(`Extracted ${images.length} aside images`);
  } catch (error) {
    logger.debug('No figures found in aside:', error);
  }

  // Step 4: Find all sections in aside
  const sections: Record<string, unknown> = {};
  let allSections: WebElement[] = [];

  try {
    allSections = await aside.findElements(By.css('section'));
    logger.info(`Found ${allSections.length} sections in aside`);
  } catch (error) {
    logger.debug('No sections found in aside:', error);
  }

  // Step 5: Process each section based on sectionFunctionMap
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
  };
}

/**
 * Extracts gallery images from .wikia-gallery-item containers
 * These are typically found in wiki gallery sections
 * @param driver - Selenium WebDriver instance
 * @returns Array of image URLs from gallery items
 */
export async function extractGalleryImages(
  driver: WebDriver
): Promise<string[]> {
  try {
    const galleryItems = await driver.findElements(
      By.css('.wikia-gallery-item')
    );

    logger.info(`Found ${galleryItems.length} gallery items`);

    const images: string[] = [];

    for (const item of galleryItems) {
      try {
        const img = await item.findElement(By.css('img'));
        const imageUrl = await getImageUrl(img, 'data-src');

        if (imageUrl) {
          images.push(imageUrl);
        }
      } catch (error) {
        logger.debug('Failed to extract image from gallery item:', error);
      }
    }

    logger.info(`Extracted ${images.length} gallery images`);
    return images;
  } catch (error) {
    logger.warn('Failed to extract gallery images:', error);
    return [];
  }
}
