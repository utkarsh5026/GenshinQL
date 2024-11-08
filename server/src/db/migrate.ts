import path from "path";
import { loadJsonPath } from "../data/setup";
import { initDb } from "./init";

import { printAllTableContents, repo } from "./utils";
import { z } from "zod";
import {
  talentDaySchema,
  weaponSchema,
  weaponTypeSchema,
} from "../data/schema";

import WeaponModel from "./models/Weapon";
import WeaponTypeModel from "./models/WeaponType";
import WeaponMaterial from "./models/WeaponMaterial";
import WeaponPassive from "./models/WeaponPassive";
import TalentMaterial from "./models/TalentMaterial";
import NationModel from "./models/Nation";

type WeaponSchema = z.infer<typeof weaponSchema>;
type WeaponTypeSchema = z.infer<typeof weaponTypeSchema>;
type TalentDaySchema = z.infer<typeof talentDaySchema>;

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
  for (const type of wepTypes) {
    const newType = new WeaponTypeModel();
    newType.name = type;
    newType.iconUrl = "";
    await weaponTypeRepo.save(newType);
  }

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
    path.join("talent", "dailyTalents.json")
  )) as Record<string, TalentDaySchema[]>;

  const nations = await repo(NationModel).find();

  const materialsToSave: TalentMaterial[] = [];
  for (const nation of nations) {
    const name = nation.name;
    const nationMats = materials[name as keyof typeof materials];

    if (!nationMats) throw new Error(`No materials found for ${name}`);
    const books = createTalenBooks(nationMats).map((mat) => {
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
function createTalenBooks(
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
    const philosophyUrl = getBookUrl("Philosophy", mat);

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

export async function migrate() {
  await initDb();
  console.log("Migrating weapons...");
  //   await migrateWeapons();
  await migrateTalentMaterials();
  await printAllTableContents();
}

if (require.main === module) {
  migrate().then(() => console.log("Migration complete"));
}
