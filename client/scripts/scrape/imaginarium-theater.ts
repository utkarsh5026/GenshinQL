import chalk from 'chalk';
import { By, WebDriver, WebElement } from 'selenium-webdriver';

import { saveToPublic } from './fileio.js';
import { imaginariamTheaterSeasonSchema } from './schema.js';
import { getImageUrl, parseUrl } from './scraping-helpers.js';
import { withWebDriver } from './setup.js';
import { getTableFromHeading } from './utils.js';

const URL = 'https://genshin-impact.fandom.com/wiki/Imaginarium_Theater';

async function scrapeImaginariamTheater(driver: WebDriver) {
  await driver.get(URL);

  const table = await getTableFromHeading(driver, 'Seasons', 'h2');
  const tbody = await table.findElement(By.css('tbody'));
  const rows = await tbody.findElements(By.css('tr'));

  if (rows.length === 0) {
    throw new Error('No season rows found in table');
  }

  const firstRow = rows[0];
  const seasonData = await parseSeasonRow(firstRow);
  const result = imaginariamTheaterSeasonSchema.safeParse(seasonData);

  if (!result.success) {
    console.error(chalk.red('❌ Validation failed:'), result.error.issues);
    throw new Error('Season data validation failed');
  }

  console.log(chalk.green('✅ Successfully scraped season data'));
  console.log(chalk.gray('   Season:'), chalk.white(seasonData.seasonNumber));
  console.log(
    chalk.gray('   Opening Characters:'),
    chalk.white(seasonData.openingCharacters.length)
  );
  console.log(
    chalk.gray('   Special Guests:'),
    chalk.white(seasonData.specialGuestCharacters.length)
  );
  console.log(
    chalk.gray('   Elements:'),
    chalk.white(seasonData.elements.length)
  );

  await saveToPublic(seasonData, 'imaginarium-theater.json');
  return seasonData;
}

async function parseSeasonRow(row: WebElement) {
  const cells = await row.findElements(By.css('td'));

  if (cells.length !== 2) {
    throw new Error(`Expected 2 cells, found ${cells.length}`);
  }

  const [firstCell, secondCell] = cells;

  const { seasonNumber, dateRange, versionName } =
    await parseFirstColumn(firstCell);

  const { openingCharacters, theaterEffect, elements, specialGuestCharacters } =
    await parseSecondColumn(secondCell);

  return {
    seasonNumber,
    dateRange,
    versionName,
    openingCharacters,
    theaterEffect,
    elements,
    specialGuestCharacters,
  };
}

async function parseFirstColumn(cell: WebElement) {
  const seasonLink = await cell.findElement(By.css('a'));
  const seasonText = await seasonLink.getText();
  const seasonNumber = parseInt(seasonText.replace('Season ', ''), 10);

  const smallTag = await cell.findElement(By.css('small'));
  const dateRange = await smallTag.getText();

  let versionName: string | undefined;
  try {
    const versionLinks = await smallTag.findElements(
      By.css('a[title^="Version/"]')
    );
    if (versionLinks.length > 0) {
      versionName = await versionLinks[0].getText();
    }
  } catch {
    // Version name is optional
  }

  return { seasonNumber, dateRange, versionName };
}

async function parseSecondColumn(cell: WebElement) {
  const cardContainers = await cell.findElements(
    By.css('span.card-list-container')
  );

  const openingCharacters = await parseCharacterCards(cardContainers[0]);
  const cellText = await cell.getText();
  const lines = cellText.split('\n');
  const effectLine = lines.find((line) => line.trim().startsWith('After'));
  const theaterEffect = effectLine?.trim() || '';

  const elements = await extractElements(cell);
  const specialGuestCharacters =
    cardContainers.length > 1
      ? await parseCharacterCards(cardContainers[1])
      : [];

  return {
    openingCharacters,
    theaterEffect,
    elements,
    specialGuestCharacters,
  };
}

async function parseCharacterCards(
  container: WebElement
): Promise<Array<{ name: string; iconUrl: string }>> {
  const cards = await container.findElements(
    By.css('div.card-container.mini-card')
  );
  const characters: Array<{ name: string; iconUrl: string }> = [];

  for (const card of cards) {
    try {
      // Find the main character image (has data-relevant="1")
      const img = await card.findElement(By.css('img[data-relevant="1"]'));
      const name = await img.getAttribute('alt');
      const iconUrl = await getImageUrl(img);

      if (name && iconUrl) {
        characters.push({ name, iconUrl });
      }
    } catch (error) {
      console.warn(chalk.yellow('⚠️  Failed to parse character card'), error);
    }
  }

  return characters;
}

async function extractElements(
  cell: WebElement
): Promise<Array<{ name: string; iconUrl: string }>> {
  const allImages = await cell.findElements(By.css('img[alt]'));
  const elements: Array<{ name: string; iconUrl: string }> = [];

  for (const img of allImages) {
    try {
      const alt = await img.getAttribute('alt');
      const src =
        (await img.getAttribute('data-src')) || (await img.getAttribute('src'));

      if (src && src.includes('Element_') && alt) {
        const iconUrl = parseUrl(src);
        elements.push({ name: alt, iconUrl });
      }
    } catch {
      // Skip invalid images
    }
  }

  const uniqueElements = Array.from(
    new Map(elements.map((e) => [e.name, e])).values()
  );

  return uniqueElements;
}

withWebDriver(scrapeImaginariamTheater)
  .then(() => {
    console.log(chalk.green('✅ Imaginarium Theater scraping complete!'));
    process.exit(0);
  })
  .catch((error) => {
    console.error(chalk.red('❌ Scraping failed:'), error);
    process.exit(1);
  });
