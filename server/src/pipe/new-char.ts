import { WebDriver } from "selenium-webdriver";
import {
  scrapeCharacterTable,
  scrapeCharacterDetailed,
} from "../data/characters";
import { setupDriver } from "../data/setup";
import Character from "../db/models/Character";
import { repo } from "../db/utils";
import { parseCharacterName } from "../data/utils";

async function newCharactersPipeline() {
  const driver = await setupDriver();
  const newCharacters = await getNewCharacters(driver);

  for (const char of newCharacters) {
    const name = parseCharacterName(char.name);
    const detailed = await scrapeCharacterDetailed(driver, name);
    const newChar = {
      ...char,
      ...detailed,
    };
  }
}

const getNewCharacters = async (driver: WebDriver) => {
  const characters = await scrapeCharacterTable(driver);
  if (!characters) throw new Error("No characters found");

  const existingCharacters = await repo(Character).find();

  const newCharacters = characters.filter(
    (character) =>
      !existingCharacters.some((existing) => existing.name === character.name)
  );

  return newCharacters;
};
