import { By, WebDriver, WebElement } from "selenium-webdriver";
import { waitForElementCss } from "./setup.js";

export const underScore = (str: string) => str.split(" ").join("_");

export const parseCharacterName = (name: string) => name.split(" ").join("_");

export const toOriginalName = (name: string) => name.split("_").join(" ");

export const parseUrl = (url: string) => url.split("/revision/")[0];

/**
 * Finds the next table sibling element after the parent of a specified element
 */
export async function getParentNextTableSibling(
  driver: WebDriver,
  selector: string,
): Promise<WebElement> {
  return await getParentNextSibling(driver, selector, "table");
}

/**
 * Finds the next div sibling element after the parent of a specified element
 */
export const getParentNextDivSibling = async (
  driver: WebDriver,
  selector: string,
): Promise<WebElement> => getParentNextSibling(driver, selector, "div");

/**
 * Finds the next sibling element of a specified type after the parent of a specified element
 */
export async function getParentNextSibling(
  driver: WebDriver,
  selector: string,
  element: string,
): Promise<WebElement> {
  await waitForElementCss(driver, selector);
  return driver
    .findElement(By.css(selector))
    .findElement(By.xpath(".."))
    .findElement(By.xpath(`following-sibling::${element}`));
}
