import path from 'path';
import { By, until, WebDriver, WebElement } from 'selenium-webdriver';

import { logger } from '../logger.js';
import { scrapeArtifactDetails } from './artifacts.js';
import { PUBLIC_DIR, saveJson } from './fileio.js';
import type {
  EventWish,
  FeaturedCharacter,
  NewArea,
  NewEvent,
  NewWeapon,
  SpiralAbyssUpdate,
  VersionArtifact,
} from './schema.js';
import {
  extractAside,
  getImageUrl,
  parseMaterialCards,
  safeExecute,
} from './scraping-helpers.ts';
import { URL, waitForElementXpath, withWebDriver } from './setup.js';
import {
  getImagesFromHeading,
  getTableFromHeading,
  launchDriverInBatchSafe,
} from './utils.js';

const TIME_TO_WAIT_FOR_ELEMENT_MS = 10000;

/**
 * Extracts {name, url} pairs from an array of link WebElements,
 * normalizing relative URLs and filtering out empty entries.
 */
async function extractLinks(
  linkElements: WebElement[]
): Promise<{ name: string; url: string }[]> {
  const links: { name: string; url: string }[] = [];
  for (const el of linkElements) {
    const name = (await el.getText()).trim();
    let href = await el.getAttribute('href');
    if (!href.startsWith('http')) {
      href = `${URL}${href}`;
    }
    if (name && href) {
      links.push({ name, url: href });
    }
  }
  return links;
}

/**
 * Finds a <dt> element by its text content and returns the next sibling of its parent <dl> element
 * @param driver - Selenium WebDriver instance
 * @param dtTextContent - The text content of the dt tag to find (e.g., "New Characters")
 * @param siblingIndex - The index of which sibling to select (1 for immediate next, 2 for next next, etc.). Defaults to 1.
 * @returns The sibling element at the specified index after the parent <dl> tag
 */
async function getNextElementByDtText(
  driver: WebDriver,
  dtTextContent: string,
  siblingIndex: number = 1
): Promise<WebElement> {
  const xpath = `//dt[normalize-space(.)='${dtTextContent}']/parent::dl/following-sibling::*[${siblingIndex}]`;

  await driver.wait(
    until.elementLocated(By.xpath(xpath)),
    TIME_TO_WAIT_FOR_ELEMENT_MS
  );

  return driver.findElement(By.xpath(xpath));
}

interface NewCharacter {
  name: string;
  icon: string;
  description: string;
  rarity?: string;
  element?: string;
  weaponType?: string;
}

/**
 * Scrapes new characters from the version page
 * @param driver - Selenium WebDriver instance
 * @returns Array of new character data
 */
async function scrapeNewCharacters(driver: WebDriver): Promise<NewCharacter[]> {
  const parseCharacterListItem = async (
    listItem: WebElement
  ): Promise<NewCharacter | null> => {
    try {
      const img = await listItem.findElement(By.css('img'));
      const icon = await getImageUrl(img, 'data-src');
      const fullText = await listItem.getText();

      const nameLink = await listItem.findElement(
        By.css('a[href^="/wiki/"]:not(.mw-file-description)')
      );
      const name = await nameLink.getText();
      const descriptionMatch = fullText.match(/"([^"]+)"/);
      const description = descriptionMatch ? descriptionMatch[1] : '';

      const infoMatch = fullText.match(/\((\d)-Star\s+(\w+)\s+(\w+)\)/);
      const rarity = infoMatch ? `${infoMatch[1]}-Star` : undefined;
      const element = infoMatch ? infoMatch[2] : undefined;
      const weaponType = infoMatch ? infoMatch[3] : undefined;

      return {
        name,
        icon,
        description,
        rarity,
        element,
        weaponType,
      };
    } catch (error) {
      logger.error('Failed to parse character list item:', error);
      return null;
    }
  };

  try {
    const ulElement = await getNextElementByDtText(driver, 'New Characters');
    const listItems = await ulElement.findElements(By.css('li'));

    logger.info(`Found ${listItems.length} new characters`);

    const characters = await Promise.all(
      listItems.map((item) => parseCharacterListItem(item))
    );

    return characters.filter((char) => char !== null) as NewCharacter[];
  } catch (error) {
    logger.error('Failed to scrape new characters:', error);
    return [];
  }
}

/**
 * Scrapes new weapons from the version page
 * @param driver - Selenium WebDriver instance
 * @returns Array of new weapon data
 */
async function scrapeNewWeapons(driver: WebDriver): Promise<NewWeapon[]> {
  try {
    const firstNextSibling = await getNextElementByDtText(
      driver,
      'New Weapons'
    );

    let showcaseImage = '';
    try {
      const img = await firstNextSibling.findElement(By.css('img'));
      showcaseImage = await getImageUrl(img, 'data-src');
    } catch (error) {
      logger.warn('Failed to extract weapon showcase image:', error);
    }

    const secondNextSibling = await driver.executeScript<WebElement>(
      'return arguments[0].nextElementSibling;',
      firstNextSibling
    );

    if (!secondNextSibling) {
      logger.warn('Could not find weapon list element');
      return [];
    }

    const weaponLinks = await secondNextSibling.findElements(By.css('li a'));
    logger.info(`Found ${weaponLinks.length} new weapons`);

    const weapons: NewWeapon[] = [];
    for (const link of weaponLinks) {
      try {
        const name = (await link.getText()).trim();
        if (name) {
          weapons.push({
            name,
            showcaseImage,
          });
        }
      } catch (error) {
        logger.warn('Failed to extract weapon from link:', error);
      }
    }

    return weapons;
  } catch (error) {
    logger.error('Failed to scrape new weapons:', error);
    return [];
  }
}

/**
 * Scrapes new artifacts from the version page
 * Extracts showcase image and artifact links, then scrapes each artifact page
 * @param driver - Selenium WebDriver instance
 * @returns Array of version artifact data with showcase image
 */
async function scrapeNewArtifacts(
  driver: WebDriver
): Promise<VersionArtifact[]> {
  return await safeExecute(
    async () => {
      // Get first sibling (gallery with showcase image)
      const firstNextSibling = await getNextElementByDtText(
        driver,
        'New Artifacts'
      );

      // Extract showcase image from gallery
      let showcaseImage = '';
      try {
        const img = await firstNextSibling.findElement(By.css('img'));
        showcaseImage = await getImageUrl(img, 'data-src');
      } catch (error) {
        logger.warn('Failed to extract artifact showcase image:', error);
      }

      // Get second sibling (artifact links list)
      const secondNextSibling = await driver.executeScript<WebElement>(
        'return arguments[0].nextElementSibling;',
        firstNextSibling
      );

      if (!secondNextSibling) {
        logger.warn('Could not find artifact list element');
        return [];
      }

      // Extract artifact links
      const artifactLinkElements = await secondNextSibling.findElements(
        By.css('li a')
      );
      const artifactLinks = await extractLinks(artifactLinkElements);

      logger.info(`Found ${artifactLinks.length} new artifacts`);

      if (artifactLinks.length === 0) {
        return [];
      }

      // Batch scrape artifact details
      const artifactDetails = await batchScrapeItems(
        artifactLinks,
        async (driver, link) => {
          const details = await scrapeArtifactDetails(driver, link.url);
          if (!details) return null;

          return {
            ...details,
            showcaseImage,
          };
        },
        6,
        'new artifacts'
      );

      return artifactDetails;
    },
    'Failed to scrape new artifacts (section may not exist)',
    []
  );
}

// ============================================================================
// Event Wish / Banner Scraping
// ============================================================================

/**
 * Banner link structure
 */
interface BannerLink {
  name: string;
  url: string;
  phase: 'Phase I' | 'Phase II';
}

/**
 * Helper to extract value from CSS class pattern (e.g., "card-element-pyro" -> "pyro")
 */
function extractFromClass(classes: string, prefix: string): string | undefined {
  const match = classes.match(new RegExp(`${prefix}([\\w-]+)`));
  return match ? match[1] : undefined;
}

/**
 * Helper to extract rarity number from class (e.g., "card-quality-5" -> 5)
 */
function extractRarityFromClass(classes: string): number | undefined {
  const match = classes.match(/card-quality-(\d)/);
  return match ? parseInt(match[1], 10) : undefined;
}

/**
 * Extracts start/end dates and banner image from banner page aside
 */
async function extractBannerAsideData(
  driver: WebDriver
): Promise<{ start: string; end: string; bannerImage: string }> {
  try {
    const asideData = await extractAside<{
      '0': { start: string; end: string };
    }>(driver, {
      0: async (section) => {
        const tbody = await section.findElement(By.css('table tbody'));

        const startCell = await tbody.findElement(
          By.css('td[data-source="time_start"]')
        );
        const endCell = await tbody.findElement(
          By.css('td[data-source="time_end"]')
        );

        const start = (await startCell.getText()).trim();
        const end = (await endCell.getText()).trim();

        return { start, end };
      },
    });

    const duration = asideData.sections['0'] || { start: '', end: '' };
    const bannerImage = asideData.images[0] || '';

    return { ...duration, bannerImage };
  } catch (error) {
    logger.warn('Failed to extract banner aside data:', error);
    return { start: '', end: '', bannerImage: '' };
  }
}

/**
 * Parses a single character card to extract metadata
 */
async function parseCharacterCard(
  card: WebElement
): Promise<FeaturedCharacter | null> {
  // Extract character name from caption
  let name = '';
  try {
    const caption = await card.findElement(By.css('.card-caption a'));
    name = (await caption.getText()).trim();
  } catch {
    // Fallback: try image alt attribute
    try {
      const img = await card.findElement(By.css('img'));
      name = (await img.getAttribute('alt')).trim();
    } catch {
      logger.warn('Could not extract character name from card');
      return null;
    }
  }

  if (!name) return null;

  // Extract character icon using existing helper
  const img = await card.findElement(By.css('img'));
  const icon = await getImageUrl(img, 'data-src');

  // Extract metadata from CSS classes
  const containerClasses = await card
    .findElement(By.css('.card-image-container'))
    .getAttribute('class');

  const element = extractFromClass(containerClasses, 'card-element-');
  const weaponType = extractFromClass(containerClasses, 'card-weapon-');
  const rarity = extractRarityFromClass(containerClasses);

  return {
    name,
    icon,
    ...(element && { element }),
    ...(weaponType && { weaponType }),
    ...(rarity && { rarity }),
  };
}

/**
 * Extracts featured characters from banner page table
 */
async function extractFeaturedCharacters(
  driver: WebDriver
): Promise<FeaturedCharacter[]> {
  try {
    const table = await getTableFromHeading(
      driver,
      'Promoted or Featured with a Drop-Rate Boost',
      'h3'
    );

    const rows = await table.findElements(By.css('tbody tr'));
    if (rows.length < 2) {
      logger.warn('Character table has insufficient rows');
      return [];
    }

    const characterRow = rows[1];
    const cards = await characterRow.findElements(
      By.css('.card-container.mini-card')
    );

    logger.info(`Found ${cards.length} featured character cards`);

    const characters: FeaturedCharacter[] = [];

    for (const card of cards) {
      try {
        const character = await parseCharacterCard(card);
        if (character) {
          characters.push(character);
        }
      } catch (error) {
        logger.warn('Failed to extract character from card:', error);
      }
    }

    return characters;
  } catch (error) {
    logger.error('Failed to extract featured characters table:', error);
    return [];
  }
}

/**
 * Scrapes a single banner page to extract all banner data
 */
async function scrapeSingleBanner(
  driver: WebDriver,
  bannerLink: BannerLink
): Promise<EventWish | null> {
  try {
    await driver.get(bannerLink.url);
    logger.info(`Scraping banner: ${bannerLink.name}`);

    await driver.wait(
      until.elementLocated(By.css('aside')),
      TIME_TO_WAIT_FOR_ELEMENT_MS
    );

    const { start, end, bannerImage } = await extractBannerAsideData(driver);

    const featuredCharacters = await extractFeaturedCharacters(driver);

    return {
      bannerName: bannerLink.name,
      bannerUrl: bannerLink.url,
      bannerImage,
      phase: bannerLink.phase,
      duration: { start, end },
      featuredCharacters,
    };
  } catch (error) {
    logger.error(`Failed to scrape banner ${bannerLink.name}:`, error);
    return null;
  }
}

/**
 * Generic batch scraper for processing multiple items concurrently with WebDriver
 * @param items - Array of items to process (each must have a name property for logging)
 * @param scraperFn - Function that scrapes a single item using WebDriver
 * @param batchSize - Number of concurrent tasks per batch
 * @param itemTypeName - Name of item type for logging (e.g., "event wishes", "events")
 * @returns Array of successfully scraped results
 */
async function batchScrapeItems<TItem extends { name: string }, TResult>(
  items: TItem[],
  scraperFn: (driver: WebDriver, item: TItem) => Promise<TResult | null>,
  batchSize: number,
  itemTypeName: string
): Promise<TResult[]> {
  if (items.length === 0) {
    logger.warn(`No ${itemTypeName} found`);
    return [];
  }

  const tasks = items.map(
    (item) => () => withWebDriver((d) => scraperFn(d, item))
  );

  const results = await launchDriverInBatchSafe(
    tasks,
    batchSize,
    (batchIndex, totalBatches) => {
      logger.info(
        `${itemTypeName.charAt(0).toUpperCase() + itemTypeName.slice(1)} batch ${batchIndex}/${totalBatches} complete`
      );
    }
  );

  const validResults = results.filter(
    (result): result is TResult => result !== null && result !== undefined
  );

  logger.success(
    `✅ Scraped ${validResults.length}/${items.length} ${itemTypeName}`
  );

  return validResults;
}

/**
 * Main event wishes scraper with concurrent batch processing
 */
async function scrapeEventWishes(driver: WebDriver): Promise<EventWish[]> {
  /**
   * Extracts Phase I and Phase II banner links from Event Wishes section
   */
  const extractBannerLinks = async (
    driver: WebDriver
  ): Promise<BannerLink[]> => {
    try {
      const eventWishesElement = await getNextElementByDtText(
        driver,
        'Event Wishes',
        2
      );

      const phaseItems = await eventWishesElement.findElements(
        By.xpath('.//li[contains(text(), "Phase")]')
      );

      const bannerLinks: BannerLink[] = [];

      for (const phaseItem of phaseItems) {
        const phaseText = await phaseItem.getText();
        const phase = phaseText.includes('Phase I') ? 'Phase I' : 'Phase II';

        const bannerList = await phaseItem.findElement(By.xpath('./ul[1]'));
        const linkElements = await bannerList.findElements(By.css('li a'));

        const links = await extractLinks(linkElements);
        for (const link of links) {
          bannerLinks.push({ ...link, phase });
        }
      }

      logger.info(`Found ${bannerLinks.length} event wish banners`);
      return bannerLinks;
    } catch (error) {
      logger.error('Failed to extract banner links:', error);
      return [];
    }
  };

  try {
    const bannerLinks = await extractBannerLinks(driver);
    return await batchScrapeItems(
      bannerLinks,
      scrapeSingleBanner,
      4,
      'event wishes'
    );
  } catch (error) {
    logger.error('Failed to scrape event wishes:', error);
    return [];
  }
}

/**
 * Scrapes a single event page to extract all event data
 * @param driver - Selenium WebDriver instance
 * @param eventLink - Event link with name and URL
 * @returns Complete event data or null if scraping fails
 */
async function scrapeSingleEvent(
  driver: WebDriver,
  eventLink: { name: string; url: string }
): Promise<NewEvent | null> {
  const extractEventRewards = async () => {
    return await safeExecute(
      async () => {
        const xpath =
          '//h2[span[@id="Total_Rewards"]]/following-sibling::span[contains(@class, "card-list-container")][1]';
        await waitForElementXpath(driver, xpath, TIME_TO_WAIT_FOR_ELEMENT_MS);
        return parseMaterialCards(await driver.findElement(By.xpath(xpath)));
      },
      'Failed to extract event rewards (event may have no rewards)',
      []
    );
  };

  const extractEventImages = async (): Promise<string[]> => {
    return await safeExecute(
      async () => {
        const { images } = await extractAside(driver, {});
        return images;
      },
      'Failed to extract event images (event may have no images)',
      []
    );
  };

  try {
    await driver.get(eventLink.url);
    logger.info(`Scraping event: ${eventLink.name}`);

    await driver.wait(
      until.elementLocated(By.css('aside')),
      TIME_TO_WAIT_FOR_ELEMENT_MS
    );

    const [images, rewards] = await Promise.all([
      extractEventImages(),
      extractEventRewards(),
    ]);

    return {
      name: eventLink.name,
      url: eventLink.url,
      images,
      rewards,
    };
  } catch (error) {
    logger.error(`Failed to scrape event ${eventLink.name}:`, error);
    return null;
  }
}

/**
 * Main event scraper with concurrent batch processing
 * @param driver - Selenium WebDriver instance
 * @returns Array of scraped event data
 */
async function scrapeNewEvents(driver: WebDriver): Promise<NewEvent[]> {
  const extractEventLinks = async (): Promise<
    { name: string; url: string }[]
  > => {
    return await safeExecute(
      async () => {
        const eventsElement = await getNextElementByDtText(
          driver,
          'New Events'
        );
        const linkElements = await eventsElement.findElements(By.css('li a'));

        const eventLinks = await extractLinks(linkElements);

        logger.info(`Found ${eventLinks.length} new events`);
        return eventLinks;
      },
      'Failed to extract event links',
      []
    );
  };

  try {
    const eventLinks = await extractEventLinks();
    return await batchScrapeItems(
      eventLinks,
      scrapeSingleEvent,
      8,
      'new events'
    );
  } catch (error) {
    logger.error('Failed to scrape new events:', error);
    return [];
  }
}

/**
 * Area link structure for initial extraction
 */
interface AreaLink {
  name: string;
  url: string;
  nationName: string;
}

/**
 * Extracts area links from "New Areas" section
 * Skips nation-level <li> and extracts nested area <li> elements
 * @param driver - Selenium WebDriver instance
 * @returns Array of area links with name, URL, and nation name
 */
async function extractAreaLinks(driver: WebDriver): Promise<AreaLink[]> {
  try {
    const newAreasElement = await getNextElementByDtText(driver, 'New Areas');

    const nationItems = await newAreasElement.findElements(
      By.xpath('.//li[a]')
    );

    const areaLinks: AreaLink[] = [];

    for (const nationItem of nationItems) {
      try {
        const nationLink = await nationItem.findElement(By.css('a'));
        const nationName = (await nationLink.getText()).trim();

        const areaList = await nationItem.findElement(By.xpath('./ul[1]'));
        const areaLinkElements = await areaList.findElements(By.css('li a'));

        logger.info(`Found ${areaLinkElements.length} areas in ${nationName}`);

        const links = await extractLinks(areaLinkElements);
        for (const link of links) {
          areaLinks.push({ ...link, nationName });
        }
      } catch (error) {
        logger.warn('Failed to extract areas from nation item:', error);
      }
    }

    logger.info(`Found ${areaLinks.length} total new areas`);
    return areaLinks;
  } catch (error) {
    logger.error('Failed to extract area links:', error);
    return [];
  }
}

/**
 * Scrapes a single area page to extract area data
 * @param driver - Selenium WebDriver instance
 * @param areaLink - Area link with name, URL, and nation name
 * @returns Complete area data or null if scraping fails
 */
async function scrapeSingleArea(
  driver: WebDriver,
  areaLink: AreaLink
): Promise<NewArea | null> {
  const extractAreaImage = async (): Promise<string> => {
    return await safeExecute(
      async () => {
        const { images } = await extractAside(driver, {});
        return images[0] || '';
      },
      'Failed to extract area image (area may have no aside image)',
      ''
    );
  };

  const extractGalleryImagesForArea = async (): Promise<string[]> => {
    return await safeExecute(
      async () => {
        const images = await getImagesFromHeading(driver, 'Gallery', 'h2');
        return images.map((img) => img.url);
      },
      'Failed to extract gallery images (area may have no gallery)',
      []
    );
  };

  try {
    await driver.get(areaLink.url);
    logger.info(`Scraping area: ${areaLink.name} (${areaLink.nationName})`);

    await driver.wait(
      until.elementLocated(By.css('aside')),
      TIME_TO_WAIT_FOR_ELEMENT_MS
    );

    const [areaImage, galleryImages] = await Promise.all([
      extractAreaImage(),
      extractGalleryImagesForArea(),
    ]);

    return {
      name: areaLink.name,
      url: areaLink.url,
      nationName: areaLink.nationName,
      areaImage: areaImage || undefined,
      galleryImages,
    };
  } catch (error) {
    logger.error(`Failed to scrape area ${areaLink.name}:`, error);
    return null;
  }
}

/**
 * Main new areas scraper with concurrent batch processing
 * @param driver - Selenium WebDriver instance
 * @returns Array of scraped area data
 */
async function scrapeNewAreas(driver: WebDriver): Promise<NewArea[]> {
  return await safeExecute(
    async () => {
      const areaLinks = await extractAreaLinks(driver);

      if (areaLinks.length === 0) {
        logger.info('No new areas found for this version');
        return [];
      }

      return await batchScrapeItems(
        areaLinks,
        scrapeSingleArea,
        6,
        'new areas'
      );
    },
    'Failed to scrape new areas (section may not exist)',
    []
  );
}

/**
 * Scrapes gallery images from the version page
 * @param driver - Selenium WebDriver instance
 * @returns Array of gallery images with URLs and captions
 */
async function scrapeVersionGallery(driver: WebDriver) {
  return await safeExecute(
    async () => {
      const images = await getImagesFromHeading(driver, 'Gallery', 'h2');
      logger.info(`Found ${images.length} gallery images`);
      return images;
    },
    'Failed to scrape version gallery (section may not exist)',
    []
  );
}

/**
 * Scrapes Spiral Abyss update data from version page
 * @param driver - Selenium WebDriver instance
 * @returns Structured Spiral Abyss update data with both phases
 */
async function scrapeSpiralAbyss(
  driver: WebDriver
): Promise<SpiralAbyssUpdate | null> {
  try {
    logger.info('Scraping Spiral Abyss data...');

    const spiralAbyssElement = await getNextElementByDtText(
      driver,
      'Spiral Abyss'
    );

    // Find all phase items (Update Scheduled for...)
    const phaseItems = await spiralAbyssElement.findElements(
      By.xpath('.//li[contains(text(), "Update Scheduled for")]')
    );

    logger.info(`Found ${phaseItems.length} Spiral Abyss phases`);

    const phases = [];

    for (let i = 0; i < phaseItems.length; i++) {
      const phaseItem = phaseItems[i];

      try {
        // Extract update date from "Update Scheduled for [Date]"
        const phaseHeaderText = await phaseItem.getText();
        const dateMatch = phaseHeaderText.match(
          /Update Scheduled for (.+?)(?:\n|$)/
        );
        const updateDate = dateMatch ? dateMatch[1].trim() : '';

        // Get nested <ul> containing all phase data
        const phaseDetailsList = await phaseItem.findElement(
          By.xpath('./ul[1]')
        );
        const detailItems = await phaseDetailsList.findElements(
          By.xpath('./li')
        );

        // Initialize data structure
        let floor11Disorders: string[] = [];
        const floor12Disorders = { firstHalf: '', secondHalf: '' };
        const blessing = { name: '', description: '' };

        // Parse each detail item
        for (const detailItem of detailItems) {
          const itemText = await detailItem.getText();

          if (itemText.includes('Floor 11 Ley Line Disorder')) {
            // Extract Floor 11 disorders
            const disorderList = await detailItem.findElement(
              By.xpath('./ul[1]')
            );
            const disorderItems = await disorderList.findElements(
              By.xpath('./li')
            );

            floor11Disorders = await Promise.all(
              disorderItems.map(async (item) => {
                const text = await item.getText();
                return text.trim();
              })
            );
          } else if (itemText.includes('Floor 12 Ley Line Disorders')) {
            // Extract Floor 12 disorders (first half, second half)
            const disorderList = await detailItem.findElement(
              By.xpath('./ul[1]')
            );
            const disorderItems = await disorderList.findElements(
              By.xpath('./li')
            );

            for (const item of disorderItems) {
              const text = await item.getText();

              if (text.includes('First half:')) {
                floor12Disorders.firstHalf = text
                  .replace('First half:', '')
                  .trim();
              } else if (text.includes('Second half:')) {
                floor12Disorders.secondHalf = text
                  .replace('Second half:', '')
                  .trim();
              }
            }
          } else if (itemText.includes('Blessing of the Abyssal Moon:')) {
            // Extract blessing name and description
            const blessingMatch = itemText.match(
              /Blessing of the Abyssal Moon:\s*(.+?)(?:\n|$)/
            );
            blessing.name = blessingMatch ? blessingMatch[1].trim() : '';

            // Get blessing description from nested <ul>
            try {
              const blessingList = await detailItem.findElement(
                By.xpath('./ul[1]')
              );
              const descItem = await blessingList.findElement(
                By.xpath('./li[1]')
              );
              blessing.description = (await descItem.getText()).trim();
            } catch (error) {
              logger.warn('Failed to extract blessing description:', error);
            }
          }
        }

        phases.push({
          phase: i + 1,
          updateDate,
          floor11Disorders,
          floor12Disorders,
          blessing,
        });

        logger.info(`✅ Extracted Phase ${i + 1} data`);
      } catch (error) {
        logger.error(`Failed to parse Spiral Abyss Phase ${i + 1}:`, error);
      }
    }

    return { phases };
  } catch (error) {
    logger.error('Failed to scrape Spiral Abyss data:', error);
    return null;
  }
}

/**
 * Main scraping function
 */
async function scrapeVersionData(driver: WebDriver) {
  await driver.get(`${URL}/Version/Luna_IV`);

  const [
    newCharacters,
    newWeapons,
    newArtifacts,
    eventWishes,
    newEvents,
    newAreas,
    spiralAbyss,
    gallery,
  ] = await Promise.all([
    scrapeNewCharacters(driver),
    scrapeNewWeapons(driver),
    scrapeNewArtifacts(driver),
    scrapeEventWishes(driver),
    scrapeNewEvents(driver),
    scrapeNewAreas(driver),
    scrapeSpiralAbyss(driver),
    scrapeVersionGallery(driver),
  ]);

  // Save combined data
  const versionDir = path.join(PUBLIC_DIR, 'version');
  await saveJson(
    {
      newCharacters,
      newWeapons,
      newArtifacts,
      eventWishes,
      newEvents,
      newAreas,
      spiralAbyss,
      gallery,
    },
    versionDir,
    'latest.json'
  );

  logger.success(`✅ Scraped ${newCharacters.length} new characters`);
  logger.success(`✅ Scraped ${newWeapons.length} new weapons`);
  logger.success(`✅ Scraped ${newArtifacts.length} new artifacts`);
  logger.success(`✅ Scraped ${eventWishes.length} event wishes`);
  logger.success(`✅ Scraped ${newEvents.length} new events`);
  logger.success(`✅ Scraped ${newAreas.length} new areas`);
  logger.success(
    `✅ Scraped Spiral Abyss data (${spiralAbyss?.phases.length ?? 0} phases)`
  );
  logger.success(`✅ Scraped ${gallery.length} gallery images`);
}

/**
 * Main execution function
 */
async function main() {
  logger.cyan('\n=== Scraping Version Data ===\n');

  await withWebDriver(async (driver) => {
    await scrapeVersionData(driver);
  });

  logger.success('\n=== Version data scraped successfully! ===\n');
}

const isMainModule =
  process.argv[1] && import.meta.url.includes(path.basename(process.argv[1]));

if (isMainModule) {
  await main();
}
