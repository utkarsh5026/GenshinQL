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
  NewQuest,
  NewWeapon,
  QuestType,
  SpiralAbyssUpdate,
  VersionArtifact,
} from './schema.js';
import {
  extractAside,
  findImageElUrls,
  getImageUrl,
  mapElements,
  parseMaterialCards,
  safeExecute,
  scrapeTable,
} from './scraping-helpers.ts';
import { URL, waitForElementXpath, withWebDriver } from './setup.js';
import { getImagesFromHeading, launchDriverInBatchSafe } from './utils.js';

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
    const [showcase, weaponNames] = await Promise.allSettled([
      ...[1, 2].map((index) =>
        getNextElementByDtText(driver, 'New Weapons', index)
      ),
    ]);

    if (showcase.status === 'rejected' || weaponNames.status === 'rejected') {
      logger.warn('Could not find first sibling for New Weapons section');
      return [];
    }

    const showCaseImageUrls = await findImageElUrls(showcase.value);
    const weaponLinks = await weaponNames.value.findElements(By.css('li a'));
    return await mapElements(weaponLinks, async (link, index) => ({
      name: (await link.getText()).trim(),
      showcaseImage: showCaseImageUrls[index] || '',
    }));
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
      const [firstSib, secondSib] = await Promise.allSettled([
        ...[1, 2].map((i) =>
          getNextElementByDtText(driver, 'New Artifacts', i)
        ),
      ]);

      if (firstSib.status === 'rejected' || secondSib.status === 'rejected') {
        return [];
      }

      const [showcaseImage] = await findImageElUrls(firstSib.value);

      const linkElements = await secondSib.value.findElements(By.css('li a'));
      return batchScrapeItems(
        await extractLinks(linkElements.reverse()),
        async (driver, link) => {
          const details = await scrapeArtifactDetails(driver, link.url);
          return details ? { ...details, showcaseImage } : null;
        },
        6,
        'new artifacts'
      );
    },
    'Failed to scrape new artifacts (section may not exist)',
    []
  );
}

/**
 * Banner link structure
 */
interface BannerLink {
  name: string;
  url: string;
  phase: 'Phase I' | 'Phase II';
}

/**
 * Parses a single character card to extract metadata
 */
async function parseCharacterCard(
  card: WebElement
): Promise<FeaturedCharacter | null> {
  const extractFromClass = (classes: string, prefix: string) => {
    const match = classes.match(new RegExp(`${prefix}([\\w-]+)`));
    return match ? match[1] : undefined;
  };

  const extractRarityFromClass = (classes: string) => {
    const match = classes.match(/card-quality-(\d)/);
    return match ? parseInt(match[1], 10) : undefined;
  };

  let name = '';
  try {
    const caption = await card.findElement(By.css('.card-caption a'));
    name = (await caption.getText()).trim();
  } catch {
    try {
      const img = await card.findElement(By.css('img'));
      name = (await img.getAttribute('alt')).trim();
    } catch {
      logger.warn('Could not extract character name from card');
      return null;
    }
  }

  if (!name) return null;

  const img = await card.findElement(By.css('img'));
  const icon = await getImageUrl(img, 'data-src');

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
 * Scrapes a single banner page to extract all banner data
 */
async function scrapeSingleBanner(
  driver: WebDriver,
  bannerLink: BannerLink
): Promise<EventWish | null> {
  const extractFeaturedCharacters = async () => {
    try {
      const characters = await scrapeTable(
        driver,
        'Promoted or Featured with a Drop-Rate Boost',
        'h3',
        async (row, index) => {
          if (index !== 1) {
            return null;
          }

          const cards = await row.findElements(
            By.css('.card-container.mini-card')
          );

          return mapElements(cards, parseCharacterCard);
        }
      );

      return characters.length > 0 ? characters[0] : [];
    } catch (error) {
      logger.error('Failed to extract featured characters table:', error);
      return [];
    }
  };

  const extractBannerAsideData = async () => {
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
  };

  try {
    await driver.get(bannerLink.url);
    logger.info(`Scraping banner: ${bannerLink.name}`);

    await driver.wait(
      until.elementLocated(By.css('aside')),
      TIME_TO_WAIT_FOR_ELEMENT_MS
    );

    const { start, end, bannerImage } = await extractBannerAsideData();

    const featuredCharacters = await extractFeaturedCharacters();

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
        const phase = phaseText.includes('Phase II') ? 'Phase II' : 'Phase I';

        const bannerList = await phaseItem.findElement(By.xpath('./ul[1]'));
        const linkElements = await bannerList.findElements(
          By.css('li > a:first-of-type')
        );

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

  /**
   * Scrapes a single event page to extract all event data
   */
  const scrapeSingleEvent = async (
    driver: WebDriver,
    eventLink: { name: string; url: string }
  ) => {
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
 * Quest link structure for initial extraction with metadata
 */
interface QuestLink {
  name: string;
  url: string;
  type: QuestType;
  parentQuestName?: string; // e.g., "Song of the Welkin Moon"
  actName?: string; // e.g., "Act VII"
}

/**
 * Recursively extracts quest links from nested list structures
 * Extracts only the deepest-level links (actual quests, not parent categories)
 * @param listElement - The <ul> element to process
 * @param questType - Type of quest (Archon, Story, World)
 * @param parentQuestName - Name of parent quest series
 * @param actName - Act name if applicable
 * @returns Array of quest links from deepest level
 */
async function extractDeepestQuestLinks(
  listElement: WebElement,
  questType: QuestType,
  parentQuestName: string | null,
  actName: string | null
): Promise<QuestLink[]> {
  const questLinks: QuestLink[] = [];
  const listItems = await listElement.findElements(By.xpath('./li'));

  for (const listItem of listItems) {
    try {
      const itemText = await listItem.getText();

      // Check if this item has a nested list (not a leaf node)
      let nestedList: WebElement | null = null;
      try {
        nestedList = await listItem.findElement(By.xpath('./ul[1]'));
      } catch {
        // No nested list - this is a leaf node
      }

      if (nestedList) {
        // This is a parent node - extract its name and recurse
        let currentParentName = parentQuestName;
        let currentActName = actName;

        // Try to find the first link (parent quest name)
        try {
          const firstLink = await listItem.findElement(By.xpath('./a[1]'));
          currentParentName = (await firstLink.getText()).trim();
        } catch {
          // No direct link - might have act text
          const actMatch = itemText.match(/^(Act [IVX]+)\s*-/);
          if (actMatch) {
            currentActName = actMatch[1];
          }
        }

        // Recurse into nested list
        const nestedLinks = await extractDeepestQuestLinks(
          nestedList,
          questType,
          currentParentName,
          currentActName
        );
        questLinks.push(...nestedLinks);
      } else {
        // This is a leaf node - extract the quest link

        // Skip items that are just descriptive text (no link)
        let questLink: WebElement;
        try {
          questLink = await listItem.findElement(By.css('a'));
        } catch {
          logger.debug(`Skipping non-link item: ${itemText}`);
          continue;
        }

        const name = (await questLink.getText()).trim();
        let href = await questLink.getAttribute('href');
        if (!href.startsWith('http')) {
          href = `${URL}${href}`;
        }

        // Extract act name from item text if present
        let finalActName = actName;
        const actMatch = itemText.match(/^(Act [IVX]+)\s*-/);
        if (actMatch) {
          finalActName = actMatch[1];
        }

        if (name && href) {
          questLinks.push({
            name,
            url: href,
            type: questType,
            parentQuestName: parentQuestName || undefined,
            actName: finalActName || undefined,
          });
        }
      }
    } catch (error) {
      logger.warn('Failed to process quest list item:', error);
    }
  }

  return questLinks;
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
 * Extracts quest links from "New Quests" section
 * Handles nested structures and extracts deepest-level quest links
 * @param driver - Selenium WebDriver instance
 * @returns Array of quest links with type and parent quest information
 */
async function extractQuestLinks(driver: WebDriver): Promise<QuestLink[]> {
  try {
    const newQuestsElement = await getNextElementByDtText(driver, 'New Quests');

    const questTypeItems = await newQuestsElement.findElements(
      By.xpath('.//ul[1]/li')
    );

    const questLinks: QuestLink[] = [];

    for (const typeItem of questTypeItems) {
      try {
        const typeLink = await typeItem.findElement(By.css('a'));
        const questType = (await typeLink.getText()).trim() as QuestType;

        let nestedList: WebElement | null = null;
        try {
          nestedList = await typeItem.findElement(By.xpath('./ul[1]'));
        } catch {
          logger.info(`No new quests for type: ${questType}`);
          continue;
        }

        const links = await extractDeepestQuestLinks(
          nestedList,
          questType,
          null,
          null
        );

        questLinks.push(...links);
      } catch (error) {
        logger.warn('Failed to extract quests from type item:', error);
      }
    }

    logger.info(`Found ${questLinks.length} total new quests`);
    return questLinks;
  } catch (error) {
    logger.error('Failed to extract quest links:', error);
    return [];
  }
}

/**
 * Main new areas scraper with concurrent batch processing
 * @param driver - Selenium WebDriver instance
 * @returns Array of scraped area data
 */
async function scrapeNewAreas(driver: WebDriver): Promise<NewArea[]> {
  /**
   * Scrapes a single area page to extract area data
   */
  const scrapeSingleArea = async (driver: WebDriver, areaLink: AreaLink) => {
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
  };

  return await safeExecute(
    async () => {
      const areaLinks = await extractAreaLinks(driver);
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
 * Main quest scraper with concurrent batch processing
 * @param driver - Selenium WebDriver instance
 * @returns Array of scraped quest data
 */
async function scrapeNewQuests(driver: WebDriver): Promise<NewQuest[]> {
  /**
   * Scrapes a single quest page to extract quest data
   */
  const scrapeSingleQuest = async (
    driver: WebDriver,
    questLink: QuestLink
  ): Promise<NewQuest | null> => {
    /**
     * Extract quest rewards using parseMaterialCards
     * Similar to event rewards extraction pattern
     */
    const extractQuestRewards = async () => {
      return await safeExecute(
        async () => {
          // Try multiple reward section headings
          const rewardXpaths = [
            '//h2[span[@id="Rewards"]]/following-sibling::span[contains(@class, "card-list-container")][1]',
            '//h2[span[@id="Total_Rewards"]]/following-sibling::span[contains(@class, "card-list-container")][1]',
            '//h3[span[@id="Rewards"]]/following-sibling::span[contains(@class, "card-list-container")][1]',
          ];

          for (const xpath of rewardXpaths) {
            try {
              await waitForElementXpath(driver, xpath, 5000);
              return parseMaterialCards(
                await driver.findElement(By.xpath(xpath))
              );
            } catch {
              // Try next xpath
            }
          }

          return [];
        },
        'Failed to extract quest rewards (quest may have no rewards)',
        []
      );
    };

    /**
     * Extract quest images from aside
     */
    const extractQuestImages = async (): Promise<string[]> => {
      return await safeExecute(
        async () => {
          const { images } = await extractAside(driver, {});
          return images;
        },
        'Failed to extract quest images (quest may have no images)',
        []
      );
    };

    try {
      await driver.get(questLink.url);
      logger.info(`Scraping quest: ${questLink.name} (${questLink.type})`);

      await driver.wait(
        until.elementLocated(By.css('aside')),
        TIME_TO_WAIT_FOR_ELEMENT_MS
      );

      // Extract quest data in parallel
      const [images, rewards] = await Promise.all([
        extractQuestImages(),
        extractQuestRewards(),
      ]);

      return {
        name: questLink.name,
        url: questLink.url,
        type: questLink.type,
        questImage: images.length > 0 ? images[0] : undefined,
        allImages: images,
        rewards,
        parentQuestName: questLink.parentQuestName,
        actName: questLink.actName,
      };
    } catch (error) {
      logger.error(`Failed to scrape quest ${questLink.name}:`, error);
      return null;
    }
  };

  try {
    const questLinks = await extractQuestLinks(driver);

    if (questLinks.length === 0) {
      logger.warn('No new quests found');
      return [];
    }

    return await batchScrapeItems(
      questLinks,
      scrapeSingleQuest,
      6, // Batch size - moderate concurrency
      'new quests'
    );
  } catch (error) {
    logger.error('Failed to scrape new quests:', error);
    return [];
  }
}

/**
 * Main scraping function
 */
async function scrapeVersionData(driver: WebDriver) {
  await driver.get(`${URL}/Version/Luna_IV`);

  const versionDir = path.join(PUBLIC_DIR, 'version');
  await saveJson(
    {
      newCharacters: await scrapeNewCharacters(driver),
      newWeapons: await scrapeNewWeapons(driver),
      newArtifacts: await scrapeNewArtifacts(driver),
      eventWishes: await scrapeEventWishes(driver),
      newEvents: await scrapeNewEvents(driver),
      newAreas: await scrapeNewAreas(driver),
      spiralAbyss: await scrapeSpiralAbyss(driver),
      newQuests: await scrapeNewQuests(driver),
      gallery: await scrapeVersionGallery(driver),
    },
    versionDir,
    'latest1.json'
  );
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
