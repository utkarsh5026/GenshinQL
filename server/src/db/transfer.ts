import { getCharacter, loadCharacters, loadDailyTalents } from "../data/load";
import { z } from "zod";
import {
  advancedCharacterSchema,
  baseCharacterSchema,
  talentBookTypeSchema,
  talentDaySchema,
} from "../data/schema";
import { initializeDatabase, repo } from "./data-source";
import { Character, Element, Nation, TalentBook, WeaponType } from "./models";
import { Like, ObjectLiteral, Repository } from "typeorm";
import { parseCharacterName } from "../data/utils";

import { showAllTables } from "./utils";

const charRepo = repo(Character);
const talentBookRepo = repo(TalentBook);
const elementRepo = repo(Element);
const nationRepo = repo(Nation);
const weaponTypeRepo = repo(WeaponType);

type BaseCharacter = z.infer<typeof baseCharacterSchema>;
type AdvancedCharacter = z.infer<typeof advancedCharacterSchema>;
type TalentBookDay = z.infer<typeof talentDaySchema>;
type TalentBookType = z.infer<typeof talentBookTypeSchema>;

async function saveCharacters() {
  await initializeDatabase();
  await showAllTables();
  const characters = loadCharacters();
  // await saveNations(characters);
  // await saveWeaponTypes(characters);
  // await saveEachCharacter(characters);
  await savePrimitives(characters);
}

/**
 * Saves nation data to the database from character information.
 * Extracts unique nations from the character data, saves each nation,
 * and displays the resulting nations table.
 *
 * @param characters - Array of base character data containing nation information
 * @returns Promise that resolves when all nations are saved and displayed
 */
async function saveNations(characters: BaseCharacter[]) {
  const nations = retrieveNationData(characters);
  const nationRepo = repo(Nation);
  for (const nation of nations) {
    const { nation: nationName, nationUrl } = nation;
    const newNation = new Nation();
    newNation.name = nationName;
    newNation.imageUrl = nationUrl;
    await nationRepo.save(newNation);
  }
  await showTable(nationRepo);
}

/**
 * Retrieves unique nation data from character information.
 * Extracts unique nations from the character data and returns an array of objects
 * containing the nation name and its corresponding URL.
 *
 * @param characters - Array of base character data containing nation information
 * @returns Array of objects with nation name and URL
 */
function retrieveNationData(characters: BaseCharacter[]) {
  const nations = [
    ...new Set(
      characters.map((character) => {
        const { region } = character;
        return region;
      })
    ),
  ];

  return nations.map((nation) => {
    const nationUrl = characters.find(
      (char) => char.region === nation
    )?.regionUrl;
    if (!nationUrl) {
      throw new Error(`Nation URL not found for ${nation}`);
    }

    return {
      nation,
      nationUrl,
    };
  });
}

/**
 * Retrieves unique weapon type data from character information.
 * Extracts unique weapon types from the character data and returns an array of objects
 * containing the weapon type and its corresponding icon URL.
 *
 * @param characters - Array of base character data containing weapon type information
 * @returns Array of objects with weapon type and URL
 */
function retrieveWeaponTypeData(characters: BaseCharacter[]) {
  const weaponTypes = [
    ...new Set(
      characters.map((character) => {
        const { weaponType } = character;
        return weaponType;
      })
    ),
  ];

  return weaponTypes.map((weaponType) => {
    const iconUrl = characters.find(
      (char) => char.weaponType === weaponType
    )?.weaponUrl;
    if (!iconUrl) {
      throw new Error(`Weapon type URL not found for ${weaponType}`);
    }

    return {
      weaponType,
      iconUrl,
    };
  });
}

/**
 * Saves weapon type data to the database from character information.
 * Extracts unique weapon types from the character data, saves each weapon type,
 * and displays the resulting weapon types table.
 *
 * @param characters - Array of base character data containing weapon type information
 */
async function saveWeaponTypes(characters: BaseCharacter[]) {
  const weaponTypes = retrieveWeaponTypeData(characters);
  const wepRepo = repo(WeaponType);
  for (const weaponType of weaponTypes) {
    const { weaponType: weaponTypeName, iconUrl } = weaponType;
    const newWeaponType = new WeaponType();
    newWeaponType.weaponType = weaponTypeName;
    newWeaponType.iconUrl = iconUrl;
    await wepRepo.save(newWeaponType);
  }
  await showTable(wepRepo);
}

/**
 * Saves each character from the base character data to the database.
 * For each character:
 * - Gets detailed character information
 * - Parses it into a Character entity
 * - Saves all characters in a batch operation
 * - Displays the resulting characters table
 *
 * @param characters - Array of base character data to save
 * @throws Error if a character's detailed information cannot be found
 */
async function saveEachCharacter(characters: BaseCharacter[]) {
  const characterRepo = repo(Character);
  const charModels: Character[] = [];

  for (const character of characters) {
    const characterDetailed = getCharacter(parseCharacterName(character.name));

    if (characterDetailed === null)
      throw new Error(`Character ${character.name} not found`);

    const newCharacter = await parseCharacter(characterDetailed);
    charModels.push(newCharacter);
  }

  await characterRepo.save(charModels);
  await showTable(characterRepo);
}

/**
 * Parses character data from the advanced format into a Character entity.
 * Creates a new Character entity and populates it with the provided data,
 * including saving related element data and linking to the character's nation.
 *
 * @param character - Advanced character data containing detailed character information
 * @returns Promise resolving to a new Character entity with populated fields
 * @throws Error if the character's nation is not found in the database
 */
async function parseCharacter(
  character: AdvancedCharacter
): Promise<Character> {
  const elementRepo = repo(Element);
  const nationRepo = repo(Nation);

  const { name, rarity, element, elementUrl, region } = character;
  const newCharacter = new Character();
  newCharacter.name = name;
  newCharacter.rarity = parseInt(rarity.split(" ")[0]);

  const charElement = await elementRepo.findOneBy({ name: element });
  if (charElement === null) throw new Error(`Element ${element} not found`);
  newCharacter.element = charElement;

  const charNation = await nationRepo.findOneBy({ name: region });
  if (charNation === null) throw new Error(`Nation ${region} not found`);
  newCharacter.nation = charNation;

  return newCharacter;
}

/**
 * Saves talent book data to the database.
 * For each nation, processes and saves its associated talent books with their
 * availability days and image URLs for different book types (teaching/guide/philosophies).
 *
 * Uses the TalentBookService to create new talent book entries linked to their respective nations.
 * The talent book data is loaded from the daily talents data source and parsed into the required format.
 *
 * Each talent book is saved with:
 * - Name of the talent book series
 * - URLs for teaching, guide and philosophies level books
 * - Two days of the week when the books are available
 * - Associated nation
 */
async function saveTalentBooks() {
  const tBookRepo = repo(TalentBook);
  const talentBooks = loadDailyTalents();

  const nationRepo = repo(Nation);
  const nations = await nationRepo.find();

  for (const nation of nations) {
    for (const talentBook of talentBooks[nation.name]) {
      const { name, dayOne, dayTwo, urlMap, characters } =
        await parseTalentBook(talentBook);
      const { guide, philosophies, teaching } = urlMap;

      const newTalentBook = new TalentBook();
      newTalentBook.name = name;
      newTalentBook.teachingUrl = teaching;
      newTalentBook.guideUrl = guide;
      newTalentBook.philosophiesUrl = philosophies;
      newTalentBook.dayOne = dayOne;
      newTalentBook.dayTwo = dayTwo;

      await tBookRepo.save(newTalentBook);
      await saveTalentBookForCharacter(
        characters.map((c) => c.name),
        newTalentBook
      );
    }
  }
}

/**
 * Associates a talent book with multiple characters in the database.
 * For each character name provided, finds the character in the database using a fuzzy match,
 * assigns the talent book to that character, and saves the updated character.
 *
 * @param charNames - Array of character names to associate with the talent book
 * @param talentBook - The talent book to associate with the characters
 * @throws Error if any character cannot be found in the database
 */
async function saveTalentBookForCharacter(
  charNames: string[],
  talentBook: TalentBook
) {
  const charRepo = repo(Character);
  for (const char of charNames) {
    const character = await charRepo.findOneByOrFail({
      name: Like(`%${parseCharacterName(char)}%`),
    });

    character.talentBook = talentBook;
    await charRepo.save(character);
  }
}

/**
 * Parses talent book data from the raw format into a structured format.
 * Extracts the name, available days, image URLs for different book types, and associated characters.
 *
 * @param talentBook - Raw talent book data containing day, books and character information
 * @returns Object containing:
 *   - name: The name of the talent book series
 *   - dayOne: First day the books are available
 *   - dayTwo: Second day the books are available
 *   - urlMap: Record mapping book types (teaching/guide/philosophies) to their image URLs
 *   - characters: Array of characters that use this talent book
 */
async function parseTalentBook(talentBook: TalentBookDay) {
  const { day, books, characters } = talentBook;
  const [dayOne, dayTwo] = day.replace("/", "").split("\n");

  const urlMap: Record<TalentBookType, string> = {
    teaching: "",
    guide: "",
    philosophies: "",
  };

  for (const book of books) {
    const { name, url } = book;
    const bookType = talentBookTypeSchema.parse(name.split(" ")[0]);
    urlMap[bookType] = url;
  }
  const name = books[0].name.split(" ")[2];

  return { name, dayOne, dayTwo, urlMap, characters };
}

/**
 * Displays a table of all entities of a given type from the database.
 * Uses console.table to print the entities in a formatted table.
 *
 * @param repo - The TypeORM repository for the entity type
 * @typeParam T - The entity type, must extend ObjectLiteral
 */
async function showTable<T extends ObjectLiteral>(repo: Repository<T>) {
  const entities = await repo.find();
  console.table(entities);
}

async function savePrimitives(characters: BaseCharacter[]) {
  const primitives = characters.map((c) => {
    return {
      nation: {
        name: c.region,
        url: c.regionUrl,
      },
      weaponType: {
        name: c.weaponType,
        url: c.weaponUrl,
      },
      element: {
        name: c.element,
        url: c.elementUrl,
      },
    };
  });

  const nationRepo = repo(Nation);
  const weaponTypeRepo = repo(WeaponType);
  const elementRepo = repo(Element);

  for (const primitive of primitives) {
    const { nation, weaponType, element } = primitive;
    const newNation = new Nation();
    newNation.name = nation.name;
    newNation.imageUrl = nation.url;
    await nationRepo.save(newNation);

    const newWeaponType = new WeaponType();
    newWeaponType.weaponType = weaponType.name;
    newWeaponType.iconUrl = weaponType.url;
    await weaponTypeRepo.save(newWeaponType);

    const newElement = new Element();
    newElement.name = element.name;
    newElement.imageUrl = element.url;
    await elementRepo.save(newElement);
  }

  console.log("Primitives saved 🫡");
}
