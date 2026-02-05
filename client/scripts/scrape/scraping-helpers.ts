import { By, WebDriver, WebElement } from 'selenium-webdriver';

import { logger } from '../logger.js';
import { getTableFromHeading } from './utils.js';

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
): Promise<Array<{ url: string; caption: string; count?: number }>> {
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

        return { url: imageUrl, caption, ...(count && { count }) };
      } catch (error) {
        logger.debug('Failed to parse material card:', error);
        return { url: '', caption: '' };
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
