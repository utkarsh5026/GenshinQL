import path from "path";
import fs from "fs/promises";
import { loadJsonPath } from "../data/setup";
import { initDb } from "./init";

import { printAllTableContents, repo } from "./utils";
import { z } from "zod";
import {
  baseCharacterSchema,
  talentDaySchema,
  weaponSchema,
  weaponTypeSchema,
  advancedCharacterSchema,
  constellationSchema,
  talentSchema,
} from "../data/schema";

import WeaponModel from "./models/Weapon";
import WeaponTypeModel from "./models/WeaponType";
import WeaponMaterial from "./models/WeaponMaterial";
import WeaponPassive from "./models/WeaponPassive";
import TalentMaterial from "./models/TalentMaterial";
import NationModel from "./models/Nation";
import ElementModel from "./models/Element";
import CharacterModel from "./models/Character";
import ConstellationModel from "./models/Constellation";
import CharacterTalentModel from "./models/CharacterTalent";
import TalentAnimationsModel from "./models/TalentAnimations";

type WeaponSchema = z.infer<typeof weaponSchema>;
type WeaponTypeSchema = z.infer<typeof weaponTypeSchema>;
type TalentDaySchema = z.infer<typeof talentDaySchema>;
type BaseCharacterSchema = z.infer<typeof baseCharacterSchema>;
type AdvancedCharacterSchema = z.infer<typeof advancedCharacterSchema>;
type ConstellationSchema = z.infer<typeof constellationSchema>;
type TalentSchema = z.infer<typeof talentSchema>;

async function listJsonFiles(dirPath: string) {
  const files = await fs.readdir(dirPath);
  return files.filter((file) => path.extname(file) === ".json");
}

/**
 * Migrates weapon data from JSON files into the database.
 *
 * This function performs the following steps:
 * 1. Loads weapon data from JSON file organized by weapon type
 * 2. Creates WeaponType records for each unique weapon type
 * 3. Creates Weapon records with associated materials and passives
 * 4. Saves all records to the database with proper relationships
 *
 * The weapon data is expected to contain:
 * - Weapon types (sword, bow, etc) as top level keys
 * - Arrays of weapon objects containing:
 *   - Basic weapon info (name, rarity, attack, etc)
 *   - Materials needed for ascension/upgrades
 *   - Passive effects/abilities
 *
 * @throws Error if weapon type lookup fails
 * @throws Error if database operations fail
 */
async function migrateWeapons() {
  const weaponRepo = repo(WeaponModel);
  const weaponTypeRepo = repo(WeaponTypeModel);

  const weaponData = (await loadJsonPath(
    path.join("weapons", "weaper.json")
  )) as Record<WeaponTypeSchema, WeaponSchema[]>;

  const wepTypes = Object.keys(weaponData) as WeaponTypeSchema[];
  const weaponsToSave: WeaponModel[] = [];

  for (const type of wepTypes) {
    const weapons = weaponData[type];

    for (const weapon of weapons) {
      const { name, rarity, attack, subStat, effect, materials, passives } =
        weapon;

      const newWeapon = new WeaponModel();
      newWeapon.name = name;
      newWeapon.rarity = rarity;
      newWeapon.attack = attack;
      newWeapon.subStat = subStat;
      newWeapon.effect = effect;
      newWeapon.weaponType = await weaponTypeRepo.findOneByOrFail({
        name: type,
      });

      const materialsToSave: WeaponMaterial[] = [];
      for (const mat of materials) {
        const newMaterial = new WeaponMaterial();
        newMaterial.url = mat.url;
        newMaterial.caption = mat.caption;
        newMaterial.count = mat.count ?? 0;
        materialsToSave.push(newMaterial);
      }

      const passivesToSave: WeaponPassive[] = [];
      for (const passive of passives) {
        const newPassive = new WeaponPassive();
        newPassive.description = passive;
        passivesToSave.push(newPassive);
      }

      newWeapon.passives = passivesToSave;
      newWeapon.materials = materialsToSave;
      weaponsToSave.push(newWeapon);
    }
  }

  await weaponRepo.save(weaponsToSave);
}

/**
 * Migrates talent material data from JSON files into the database.
 *
 * This function performs the following steps:
 * 1. Loads talent material data from JSON file organized by nation
 * 2. Retrieves all nations from the database
 * 3. For each nation, creates TalentMaterial records for its talent books
 * 4. Associates each talent material with its nation
 * 5. Saves all records to the database with proper relationships
 *
 * The talent material data is expected to contain:
 * - Nations as top level keys
 * - Arrays of talent day objects containing:
 *   - Days when materials are available
 *   - Book types (teachings, guides, philosophies)
 *   - Characters that use the materials
 *
 * @throws Error if talent materials are not found for a nation
 * @throws Error if database operations fail
 */
async function migrateTalentMaterials() {
  const materials = (await loadJsonPath(
    path.join("talents", "dailyTalents.json")
  )) as Record<string, TalentDaySchema[]>;

  const nations = await repo(NationModel).find();

  const materialsToSave: TalentMaterial[] = [];
  for (const nation of nations) {
    const name = nation.name;
    if (name === "Snezhnaya") continue;
    const nationMats = materials[name];

    if (!nationMats) throw new Error(`No materials found for ${name}`);
    const books = createTalentBooks(nationMats).map((mat) => {
      mat.nation = nation;
      return mat;
    });
    materialsToSave.push(...books);
  }

  await repo(TalentMaterial).save(materialsToSave);
}

/**
 * Creates TalentMaterial entities from talent material day data.
 *
 * This function processes talent material data for a nation and creates TalentMaterial
 * entities with the following:
 * - Name of the talent book (e.g. "Freedom" from "Teachings of Freedom")
 * - URLs for teaching, guide and philosophy versions of the book
 * - Days of the week when the materials are available
 *
 * @param talentMaterials - Array of talent material data containing book info and availability days
 * @returns Array of TalentMaterial entities ready to be saved
 * @throws Error if any required book type (teaching/guide/philosophy) is not found
 */
function createTalentBooks(
  talentMaterials: TalentDaySchema[]
): TalentMaterial[] {
  const getBookUrl = (bookType: string, mat: TalentDaySchema) => {
    const book = mat.books.find((book) => book.name.includes(bookType));
    if (!book) throw new Error(`No ${bookType} book found`);
    return book.url;
  };

  const materialsToSave: TalentMaterial[] = [];
  for (const mat of talentMaterials) {
    const { day, books } = mat;
    const [dayOne, dayTwo] = day.replace("/", "").split("\n");

    const name = books[0].name.split(" ")[2];
    const teachingUrl = getBookUrl("Teaching", mat);
    const guideUrl = getBookUrl("Guide", mat);
    const philosophyUrl = getBookUrl("Philosophies", mat);

    const newMat = new TalentMaterial();
    newMat.name = name;
    newMat.teachingUrl = teachingUrl;
    newMat.guideUrl = guideUrl;
    newMat.philosophyUrl = philosophyUrl;
    newMat.dayOne = dayOne;
    newMat.dayTwo = dayTwo;
  }

  return materialsToSave;
}

/**
 * Saves primitive entities (Elements, Nations, WeaponTypes) to the database.
 *
 * This function:
 * 1. Loads character data which contains references to primitive entities
 * 2. Extracts unique elements, nations and weapon types with their icon URLs
 * 3. Creates and saves entity records for each primitive type
 *
 * The function processes character data to build maps of:
 * - Elements (e.g. Pyro, Hydro) -> element icon URLs
 * - Nations (e.g. Mondstadt, Liyue) -> nation icon URLs
 * - Weapon Types (e.g. Sword, Bow) -> weapon type icon URLs
 *
 * These primitive entities form the foundation for more complex relationships
 * in the database schema.
 *
 * @throws Error if loading character data fails
 * @throws Error if database operations fail
 */
async function savePrimitives() {
  const characters = (await loadJsonPath(
    path.join("characters", "characters.json")
  )) as BaseCharacterSchema[];
  console.log(characters);

  const elementMap: Record<string, string> = {};
  const nationMap: Record<string, string> = {};
  const weaponMap: Record<string, string> = {};

  for (const char of characters) {
    const { element, region, weaponType, weaponUrl, regionUrl, elementUrl } =
      char;
    elementMap[element] = elementUrl;
    nationMap[region] = regionUrl;
    weaponMap[weaponType] = weaponUrl;
  }

  const elementsToSave = Object.entries(elementMap).map(([element, url]) => {
    const newElement = new ElementModel();
    newElement.name = element;
    newElement.iconUrl = url;
    return newElement;
  });

  const nationsToSave = Object.entries(nationMap).map(([nation, url]) => {
    const newNation = new NationModel();
    newNation.name = nation;
    newNation.iconUrl = url;
    return newNation;
  });

  const weaponsToSave = Object.entries(weaponMap).map(([weapon, url]) => {
    const newWeapon = new WeaponTypeModel();
    newWeapon.name = weapon;
    newWeapon.iconUrl = url;
    return newWeapon;
  });

  await repo(ElementModel).save(elementsToSave);
  await repo(NationModel).save(nationsToSave);
  await repo(WeaponTypeModel).save(weaponsToSave);
}

/**
 * Saves character data from JSON files into the database.
 *
 * This function performs the following steps:
 * 1. Loads detailed character data from individual JSON files
 * 2. Creates Character records with associated element, weapon type, and nation
 * 3. Creates related Constellation and Talent records for each character
 * 4. Saves all records to the database with proper relationships
 *
 * The character data is expected to contain:
 * - Basic character info (name, rarity, etc)
 * - Element, weapon type, and nation references
 * - Arrays of constellation and talent data
 *
 * All referenced entities (elements, weapon types, nations) must already exist
 * in the database before calling this function.
 *
 * @throws Error if referenced entities cannot be found
 * @throws Error if database operations fail
 */
async function saveCharacters() {
  const data_path = path.join("data", "characters", "detailed");
  const characterFiles = await listJsonFiles(data_path);

  console.log(characterFiles);

  const elementRepo = repo(ElementModel);
  const nationRepo = repo(NationModel);
  const weaponTypeRepo = repo(WeaponTypeModel);

  const charactersToSave: CharacterModel[] = [];
  for (const charFile of characterFiles) {
    const charData = (await loadJsonPath(
      path.join("characters", "detailed", charFile)
    )) as AdvancedCharacterSchema;

    const {
      name,
      element,
      rarity,
      weaponType,
      region,
      constellations,
      talents,
    } = charData;

    const newChar = new CharacterModel();
    newChar.name = name;
    newChar.rarity = rarity;

    newChar.element = await elementRepo.findOneByOrFail({
      name: element,
    });

    newChar.weaponType = await weaponTypeRepo.findOneByOrFail({
      name: weaponType,
    });

    newChar.nation = await nationRepo.findOneByOrFail({
      name: region,
    });

    newChar.constellations = createConstellations(constellations, newChar);
    newChar.characterTalents = createTalents(talents, newChar);
    charactersToSave.push(newChar);
  }

  await repo(CharacterModel).save(charactersToSave);
}

/**
 * Creates constellation records for a character from constellation data.
 *
 * Takes an array of constellation data and a character model, and creates
 * constellation model instances with the proper relationships set up.
 * Each constellation is linked back to its parent character.
 *
 * @param constellations - Array of constellation data from character JSON
 * @param char - The character model these constellations belong to
 * @returns Array of constellation models ready to be saved
 */
function createConstellations(
  constellations: ConstellationSchema[],
  char: CharacterModel
): ConstellationModel[] {
  return constellations.map((cons) => {
    const newCons = new ConstellationModel();
    newCons.name = cons.name;
    newCons.description = cons.description;
    newCons.iconUrl = cons.iconUrl;
    newCons.level = cons.level;
    newCons.character = char;
    return newCons;
  });
}

/**
 * Creates talent records for a character from talent data.
 *
 * Takes an array of talent data and a character model, and creates
 * talent model instances with the proper relationships set up.
 * Each talent is linked back to its parent character and includes
 * associated talent animations.
 *
 * @param talents - Array of talent data from character JSON
 * @param char - The character model these talents belong to
 * @returns Array of talent models ready to be saved
 */
function createTalents(
  talents: TalentSchema[],
  char: CharacterModel
): CharacterTalentModel[] {
  return talents.map((tal) => {
    const {
      talentIcon,
      talentName,
      talentType,
      description,
      figureUrls,
      scaling,
    } = tal;
    const newTal = new CharacterTalentModel();
    newTal.name = talentName;
    newTal.description = description;
    newTal.iconUrl = talentIcon;
    newTal.talentType = talentType;
    newTal.character = char;
    newTal.scaling = scaling;

    newTal.talentAnimations = figureUrls.map((figUrl) => {
      const ani = new TalentAnimationsModel();
      ani.url = figUrl.url;
      ani.caption = figUrl.caption;
      ani.characterTalent = newTal;
      return ani;
    });
    return newTal;
  });
}

/**
 * Main migration function that populates the database with all game data.
 *
 * This function orchestrates the entire database migration process by:
 * 1. Initializing the database schema and connections
 * 2. Saving primitive/lookup data like weapon types and elements
 * 3. Migrating weapon data with materials and passives
 * 4. Migrating talent material data
 * 5. Saving character data with talents and constellations
 * 6. Printing final database contents for verification
 *
 * The migration must be run in this specific order to maintain referential integrity,
 * as later migrations depend on data from earlier ones (e.g. weapons need weapon types).
 *
 * @throws Error if any migration step fails
 */
export async function migrate() {
  await initDb();
  console.log("Migrating weapons...");
  await savePrimitives();
  await migrateWeapons();
  await migrateTalentMaterials();
  await saveCharacters();
  await printAllTableContents();
}

if (require.main === module) {
  migrate().then(() => console.log("Migration complete"));
}
