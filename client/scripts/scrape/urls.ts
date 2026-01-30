import { WebDriver } from 'selenium-webdriver';

/**
 * URL for the Genshin Impact Fandom wiki.
 */
export const BASE_URL = 'https://genshin-impact.fandom.com/wiki';

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

/**
 * Opens a new browser tab with the specified URL using the provided WebDriver.
 * Switches the driver's context to the newly opened tab.
 */
export async function openInNewTab(driver: WebDriver, url: string) {
  await driver.executeScript(`window.open('${url}', '_blank');`);
  const handles = await driver.getAllWindowHandles();
  const newTabHandle = handles.at(-1);
  if (!newTabHandle) {
    throw new Error('New tab handle is undefined');
  }
  await driver.switchTo().window(newTabHandle);
}
