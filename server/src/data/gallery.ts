import { By, WebDriver, WebElement } from "selenium-webdriver";
import { setupDriver, URL, waitForElementCss } from "./setup";
import { AnimationSchema, GallerySchema, GenshinImageSchema } from "./schema";
import { CHARACTER_DIR, GALLERY_FILE, loadJsonData, saveFile } from "./fileio";
import { getParentNextDivSibling, parseCharacterName } from "./utils";
import { loadCharacters, loadCharactersGallery } from "./load";

const parseUrl = (url: string) => url.split("/revision/")[0];

/**
 * Loads and saves gallery images for all characters.
 * Processes characters from characters.json and saves results to gallery_op.json.
 * Skips already processed characters unless force flag is set.
 *
 * @param {WebDriver} driver - Selenium WebDriver instance
 * @param {boolean} [force=false] - Force re-scraping of already saved characters
 * @returns {Promise<void>}
 */
async function getCharacterGallery(
  driver: WebDriver,
  force: boolean = false
): Promise<void> {
  type CharacterGalleryMap = Record<string, GallerySchema>;
  const characters = await loadCharacters();

  if (!characters) throw new Error("Characters not found");
  console.log(characters?.length);

  const alreadySaved = await loadCharactersGallery();
  console.log(alreadySaved);
  if (!alreadySaved) throw new Error("Gallery file not found");

  const charGalleryMap: CharacterGalleryMap = {};
  for (const char of characters) {
    try {
      const name = parseCharacterName(char.name);
      if (!force && name in alreadySaved) continue;

      console.log(`Scraping ${char.name}`);
      charGalleryMap[name] = await getCharacterGalleryImages(driver, name);
      console.log(`Scraped ${char.name}`);
    } catch (error) {
      console.error(`Error scraping ${char.name}:`, error);
    }
  }

  await saveFile(charGalleryMap, CHARACTER_DIR, GALLERY_FILE, force);
}

/**
 * Scrapes all gallery images for a specific character.
 * Includes screen animations, name cards, and attack animations.
 *
 * @param {WebDriver} driver - Selenium WebDriver instance
 * @param {string} character - Character name in URL-friendly format
 * @returns {Promise<GallerySchema>}
 */
export async function getCharacterGalleryImages(
  driver: WebDriver,
  character: string
): Promise<GallerySchema> {
  const galleryUrl = `${URL}/${character}/Gallery`;
  await driver.get(galleryUrl);

  const screenAnimations = await getCharacterScreenAnimations(driver);
  const nameCards = await getCharacterNameCard(driver);
  const attackTypes = [
    "Normal_Attack",
    "Elemental_Burst",
    "Elemental_Skill",
  ] as const;

  const attackAnimations = await Promise.all(
    attackTypes.map(async (skill) => {
      return {
        skill,
        animations: await getCharacterAttackAnimations(driver, skill),
      };
    })
  );

  return {
    screenAnimations,
    nameCards,
    attackAnimations,
    detailedImages: await getImagesAfterHeading(
      driver,
      "span#Character_Details"
    ),
    stickers: await getImagesAfterHeading(
      driver,
      'span[id="Paimon\'s_Paintings"]'
    ),
  };
}

/**
 * Scrapes character screen animations from the gallery page.
 * Locates and extracts image URLs and captions from figure elements.
 *
 * @param {WebDriver} driver - Selenium WebDriver instance
 * @returns {Promise<Array<AnimationSchema>>}
 */
async function getCharacterScreenAnimations(
  driver: WebDriver
): Promise<AnimationSchema[]> {
  const cssSelector = "span#Character_Screen_Animations";
  await waitForElementCss(driver, cssSelector);

  const galleryContainer = await driver
    .findElement(By.css(cssSelector))
    .findElement(By.xpath("./parent::*"))
    .findElement(By.xpath("./following-sibling::div"));

  const figures = await galleryContainer.findElements(By.css("figure"));
  return await parseFigures(figures);
}

/**
 * Scrapes character name card images.
 * Locates and extracts image URLs and captions from the name card section.
 *
 * @param {WebDriver} driver - Selenium WebDriver instance
 * @returns {Promise<Array<GenshinImageSchema>>}
 */
async function getCharacterNameCard(
  driver: WebDriver
): Promise<GenshinImageSchema[]> {
  const cssSelector = "span#Namecard";
  await waitForElementCss(driver, cssSelector);

  const images = await driver
    .findElement(By.css(cssSelector))
    .findElement(By.xpath("./parent::*"))
    .findElement(By.xpath("./following-sibling::div"))
    .findElements(By.css("img"));

  return await parseImages(images);
}

/**
 * Scrapes animation images for a specific attack type.
 *
 * @param {WebDriver} driver - Selenium WebDriver instance
 * @param {string} skill - Attack type ("Normal_Attack", "Elemental_Burst", or "Elemental_Skill")
 * @returns {Promise<Array<AnimationSchema>>}
 */
async function getCharacterAttackAnimations(
  driver: WebDriver,
  skill: string
): Promise<AnimationSchema[]> {
  const cssSelector = `span#${skill}`;
  await waitForElementCss(driver, cssSelector);

  const galleryContainer = await driver
    .findElement(By.css(cssSelector))
    .findElement(By.xpath("./parent::*"))
    .findElement(By.xpath("./following-sibling::div"));

  const figures = await galleryContainer.findElements(By.css("figure"));
  return await parseFigures(figures);
}

/**
 * Parses figure elements to extract image URLs, captions, and video details.
 * Handles errors by returning empty strings for failed extractions.
 *
 * @param {WebElement[]} figures - Array of WebElement objects representing figures
 * @returns {Promise<Array<{url: string, caption: string, videoUrl: string, videoType: string}>>}
 */
async function parseFigures(
  figures: WebElement[]
): Promise<
  Array<{ url: string; caption: string; videoUrl: string; videoType: string }>
> {
  return await Promise.all(
    figures.map(async (figure) => {
      try {
        const img = await figure
          .findElement(By.css("img"))
          .getAttribute("data-src");
        const caption = await figure
          .findElement(By.css("figcaption"))
          .getText();
        const videoSource = await figure.findElement(By.css("video source"));

        const videoUrl = await videoSource.getAttribute("data-src");
        const videoType = await videoSource.getAttribute("type");
        return {
          url: parseUrl(img),
          caption,
          videoUrl: parseUrl(videoUrl),
          videoType,
        };
      } catch {
        return {
          url: "",
          caption: "",
          videoUrl: "",
          videoType: "",
        };
      }
    })
  );
}

/**
 * Parses image elements to extract URLs and captions.
 * Handles errors by returning empty strings for failed extractions.
 *
 * @param {WebElement[]} images - Array of WebElement objects representing images
 * @returns {Promise<Array<GenshinImageSchema>>}
 */
async function parseImages(
  images: WebElement[]
): Promise<GenshinImageSchema[]> {
  return await Promise.all(
    images.map(async (img) => {
      try {
        const url = await img.getAttribute("data-src");
        const caption = await img.getAttribute("alt");
        return {
          url: parseUrl(url),
          caption,
        };
      } catch {
        return {
          url: "",
          caption: "",
        };
      }
    })
  );
}

/**
 * Retrieves and parses images that appear after a specified heading in the DOM.
 *
 * @param driver - Selenium WebDriver instance for browser automation
 * @param headingSelector - CSS selector string to find the heading element
 * @returns Promise resolving to array of image objects with urls and captions
 * @throws Error if heading element cannot be found or images cannot be parsed
 */
async function getImagesAfterHeading(
  driver: WebDriver,
  headingSelector: string
): Promise<GenshinImageSchema[]> {
  try {
    await waitForElementCss(driver, headingSelector);
    const container = await getParentNextDivSibling(driver, headingSelector);
    const imgs = await container.findElements(By.css("img"));
    return await parseImages(imgs);
  } catch (error) {
    console.error(`Error getting images after ${headingSelector}:`, error);
    return [];
  }
}

/**
 * Main entry point for the scraper.
 * Sets up the WebDriver, runs the scraping process, and ensures cleanup.
 *
 * @returns {Promise<void>}
 */
async function main(): Promise<void> {
  const driver = await setupDriver();
  const args = process.argv.slice(2);
  const force = args.includes("--force");
  try {
    await getCharacterGallery(driver, force);
  } finally {
    await driver.quit();
  }
}

if (require.main === module) {
  main()
    .then(() => console.log("Done"))
    .catch(console.error);
}
