import { WebDriver, until, By } from "selenium-webdriver";
import { URL, saveJson, setupDriver } from "./setup";

async function scrapeCharacters(driver: WebDriver) {
  const charactersUrl = `${URL}/Character`;
  try {
    await driver.get(charactersUrl);
    const tableSelector = `table.article-table[data-index-number='1']`;
    await driver.wait(until.elementLocated(By.css(tableSelector)), 10000);

    const rowElements = await driver.findElements(
      By.css(`${tableSelector} tr`)
    );
    const rows = await Promise.all(
      rowElements.slice(1).map(async (row) => {
        const cells = await row.findElements(By.css("td"));
        const texts = await Promise.all(cells.map((cell) => cell.getText()));

        const rarity = await cells[2]
          .findElement(By.css("img"))
          .getAttribute("alt");
        texts[2] = rarity;
        return texts;
      })
    );

    return rows;
  } catch (error) {
    console.error(error);
  }
}

async function main() {
  const driver = await setupDriver();
  const characters = await scrapeCharacters(driver);

  const charctersTable = characters?.map((character) => {
    return {
      name: character[1],
      rarity: character[2],
      element: character[3],
      weaponType: character[4],
      model: character[5],
    };
  });
  await saveJson(charctersTable, "characters", "characters");
  await driver.quit();
}

main();
