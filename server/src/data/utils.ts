import { By, WebDriver, WebElement } from "selenium-webdriver";
import { waitForElementCss } from "./setup";

export const underScore = (str: string) => str.split(" ").join("_");

export const parseCharacterName = (name: string) => name.split(" ").join("_");

export const toOriginalName = (name: string) => name.split("_").join(" ");

export const parseUrl = (url: string) => url.split("/revision/")[0];

/**
 * Finds the next table sibling element after the parent of a specified element
 * @param driver - The Selenium WebDriver instance
 * @param selector - CSS selector to find the initial element
 * @returns {Promise<WebElement>} Promise resolving to the found table element
 */
export const getParentNextTableSibling = async (
  driver: WebDriver,
  selector: string,
): Promise<WebElement> => {
  await waitForElementCss(driver, selector);
  return driver
    .findElement(By.css(selector))
    .findElement(By.xpath(".."))
    .findElement(By.xpath("following-sibling::table"));
};
