import { By, WebDriver, WebElement } from 'selenium-webdriver';
import { z } from 'zod';

import { logger } from '../logger.js';
import { saveToPublic } from './fileio.js';
import { artifactPieceTypeSchema, artifactSetSchema } from './schema.js';
import { getImageUrl, safeExecute } from './scraping-helpers.js';
import {
  handleCloudflareChallenge,
  URL,
  waitForPageLoad,
  withWebDriver,
} from './setup.js';
import { waitAndGetElement } from './utils.js';

type ArtifactPieceType = z.infer<typeof artifactPieceTypeSchema>;
type ArtifactSet = z.infer<typeof artifactSetSchema>;

const ARTIFACT_FILE_NAME = 'artifacts';
const ARTIFACT_PAGE_URL = `${URL}/Artifact`;

const PIECE_TYPES: ArtifactPieceType[] = [
  'flower',
  'plume',
  'sands',
  'goblet',
  'circlet',
];

/**
 * Scrapes all artifact set links from the main Artifact wiki page.
 * Finds the heading with id="Artifact_Sets" and extracts links from card containers.
 */
async function scrapeArtifactLinks(driver: WebDriver): Promise<string[]> {
  const findCardListContainer = async () => {
    const heading = await driver.findElement(By.css('span#Artifact_Sets'));
    const headingParent = await heading.findElement(By.xpath('..'));

    let cardListContainer: WebElement | null = null;
    let sibling = await headingParent.findElement(
      By.xpath('following-sibling::*[1]')
    );

    for (let i = 0; i < 5; i++) {
      try {
        cardListContainer = await sibling.findElement(
          By.css('span.card-list-container')
        );
        break;
      } catch {
        sibling = await sibling.findElement(
          By.xpath('following-sibling::*[1]')
        );
      }
    }

    return cardListContainer;
  };

  logger.info('🔍 Scraping artifact set links from main page...');

  await driver.get(ARTIFACT_PAGE_URL);
  await waitForPageLoad(driver);
  await handleCloudflareChallenge(driver);

  const cardListContainer = await findCardListContainer();

  if (!cardListContainer) {
    throw new Error('Could not find card-list-container for artifact sets');
  }

  const cardContainers = await cardListContainer.findElements(
    By.css('div.card-container')
  );

  const links: string[] = [];
  for (const card of cardContainers) {
    try {
      const anchor = await card.findElement(By.css('a[href]'));
      const href = await anchor.getAttribute('href');
      if (href && !links.includes(href)) {
        links.push(href);
      }
    } catch {
      console.error(`Error gettng `);
    }
  }

  logger.success(`✓ Found ${links.length} artifact set links`);
  return links;
}

/**
 * Extracts artifact piece data from a data-source element
 */
async function extractArtifactPiece(
  driver: WebDriver,
  pieceType: ArtifactPieceType
): Promise<{ type: ArtifactPieceType; name: string; iconUrl: string } | null> {
  return await safeExecute(
    async () => {
      const pieceElement = await driver.findElement(
        By.css(`div[data-source="${pieceType}"]`)
      );

      const img = await pieceElement.findElement(By.css('h3 img'));
      const iconUrl = await getImageUrl(img);
      const nameElement = await pieceElement.findElement(
        By.css('div.pi-data-value a')
      );
      const name = await nameElement.getText();

      return {
        type: pieceType,
        name,
        iconUrl,
      };
    },
    `Failed to extract ${pieceType} piece`,
    null
  );
}

/**
 * Extracts set bonuses from the artifact page
 */
async function extractSetBonuses(
  driver: WebDriver
): Promise<{ twoPieceBonus: string; fourPieceBonus: string }> {
  const extractBonus = async (dataSource: string): Promise<string> => {
    return await safeExecute(
      async () => {
        const bonusElement = await driver.findElement(
          By.css(`div[data-source="${dataSource}"] div.pi-data-value`)
        );
        const text = await bonusElement.getText();
        return text.replace(/^\d+-Piece Bonus\s*/i, '').trim();
      },
      `Failed to extract ${dataSource}`,
      ''
    );
  };

  const [twoPieceBonus, fourPieceBonus] = await Promise.all([
    extractBonus('2pcBonus'),
    extractBonus('4pcBonus'),
  ]);

  return { twoPieceBonus, fourPieceBonus };
}

/**
 * Scrapes detailed information for a single artifact set
 */
export async function scrapeArtifactDetails(
  driver: WebDriver,
  artifactUrl: string
): Promise<ArtifactSet | null> {
  return await safeExecute(
    async () => {
      await driver.get(artifactUrl);
      await waitForPageLoad(driver);
      await handleCloudflareChallenge(driver);

      await driver.executeScript(
        'window.scrollTo(0, document.body.scrollHeight / 2);'
      );
      await driver.sleep(1000);

      const titleElement = await waitAndGetElement(
        driver,
        'h1.page-header__title, h1#firstHeading'
      );
      const name = await titleElement.getText();

      const pieces = [];
      for (const pieceType of PIECE_TYPES) {
        const piece = await extractArtifactPiece(driver, pieceType);
        if (piece) {
          pieces.push(piece);
        }
      }

      const { twoPieceBonus, fourPieceBonus } = await extractSetBonuses(driver);

      logger.debug(`  ↳ ${name}: ${pieces.length} pieces`);
      console.log(pieces, twoPieceBonus, fourPieceBonus);

      return {
        name,
        pieces,
        twoPieceBonus,
        fourPieceBonus,
      };
    },
    `Failed to scrape artifact: ${artifactUrl}`,
    null
  );
}

/**
 * Process artifacts in batches with concurrent browser instances
 * @param links - Array of artifact URLs to scrape
 * @param batchSize - Number of concurrent browser instances (default: 3)
 */
async function scrapeArtifactsBatched(
  links: string[],
  batchSize: number = 8
): Promise<Record<string, ArtifactSet>> {
  const artifacts: Record<string, ArtifactSet> = {};
  let successCount = 0;
  let errorCount = 0;

  logger.info(
    `\n🚀 Processing ${links.length} artifacts in batches of ${batchSize}\n`
  );

  for (let i = 0; i < links.length; i += batchSize) {
    const batch = links.slice(i, i + batchSize);
    const batchNum = Math.floor(i / batchSize) + 1;
    const totalBatches = Math.ceil(links.length / batchSize);

    logger.cyan(
      `\n📦 Batch ${batchNum}/${totalBatches} (${batch.length} artifacts)`
    );

    const batchResults = await Promise.all(
      batch.map(async (link, idx) => {
        const globalIdx = i + idx + 1;
        logger.debug(
          `  [${globalIdx}/${links.length}] ${link.split('/').pop()}`
        );

        try {
          const artifact = await withWebDriver(async (driver: WebDriver) => {
            return await scrapeArtifactDetails(driver, link);
          });
          return { link, artifact, success: !!artifact };
        } catch (error) {
          logger.error(`  ✗ Error scraping ${link}: ${error}`);
          return { link, artifact: null, success: false };
        }
      })
    );

    for (const result of batchResults) {
      if (result.artifact) {
        artifacts[result.artifact.name] = result.artifact;
        successCount++;
        logger.success(`  ✓ ${result.artifact.name}`);
      } else {
        errorCount++;
        logger.error(`  ✗ Failed: ${result.link.split('/').pop()}`);
      }
    }

    if (i + batchSize < links.length) {
      logger.debug('  ⏳ Waiting 1s before next batch...');
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  logger.info(`\n📈 Summary: ${successCount} succeeded, ${errorCount} failed`);
  return artifacts;
}

/**
 * Main function to scrape all artifacts
 */
async function scrapeAllArtifacts(batchSize: number = 3): Promise<void> {
  logger.info('\n📦 Starting Artifact Scraping\n');
  const links = await withWebDriver(async (driver: WebDriver) => {
    return await scrapeArtifactLinks(driver);
  });

  const artifacts = await scrapeArtifactsBatched(links, batchSize);

  await saveToPublic(artifacts, ARTIFACT_FILE_NAME);
  logger.success(
    `\n✨ Saved ${Object.keys(artifacts).length} artifacts to ${ARTIFACT_FILE_NAME}.json`
  );
}

/**
 * Main entry point
 */
async function main() {
  const args = process.argv.slice(2);

  if (args.includes('--help')) {
    console.log(`
Usage: npx tsx artifacts.ts [options]

Options:
  --help           Show this help message
  --batch=N        Number of concurrent browser instances (default: 3)
  
Examples:
  npx tsx artifacts.ts              # Scrape with 3 concurrent browsers
  npx tsx artifacts.ts --batch=5    # Scrape with 5 concurrent browsers
    `);
    return;
  }

  const batchArg = args.find((arg) => arg.startsWith('--batch='));
  const batchSize = batchArg ? parseInt(batchArg.split('=')[1], 10) : 3;

  if (batchArg) {
    logger.info(`📋 Running with batch size: ${batchSize}\n`);
  }

  await scrapeAllArtifacts(batchSize);
}

main().catch((error) => {
  logger.error('Fatal error:', error);
  process.exit(1);
});
