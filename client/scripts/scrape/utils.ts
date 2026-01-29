import { By, WebDriver, WebElement, until } from 'selenium-webdriver';
import { waitForElementCss } from './setup.js';
import chalk from 'chalk';

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
