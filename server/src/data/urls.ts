import { WebDriver } from "selenium-webdriver";

/**
 * URL for the Genshin Impact Fandom wiki.
 */
export const BASE_URL = "https://genshin-impact.fandom.com/wiki";

/**
 * URL for the Character Talent Material page.
 */
export const TALENT_URL = `${BASE_URL}/Character_Talent_Material`;

/**
 * URL for the Character Gallery page.
 */
export const charGalleryUrl = (charName: string) => {
  return `${BASE_URL}/${charName}/Gallery`;
};

export async function openInNewTab(driver: WebDriver, url: string) {
  // Open new tab using JavaScript
  await driver.executeScript(`window.open('${url}', '_blank');`);

  // Get all window handles
  const handles = await driver.getAllWindowHandles();
  // Switch to the latest window (new tab)
  await driver.switchTo().window(handles[handles.length - 1]);
}
