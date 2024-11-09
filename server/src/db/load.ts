import Character from "./models/Character";
import Nation from "./models/Nation";
import WeaponType from "./models/WeaponType";
import { repo } from "./utils";

/**
 * Loads the talent books schedule from the database.
 *
 * This function fetches the talent books schedule for all nations, including
 * the related talent materials and characters. The data is retrieved from the
 * Nation repository with specific relations and selected fields.
 *
 * @returns {Promise<Nation[]>} A promise that resolves to an array of nations with their talent books schedule.
 */
export async function loadTalentBooksSchedule(): Promise<Nation[]> {
  const nationRepo = repo(Nation);
  return await nationRepo.find({
    relations: [
      "talentMaterials",
      "talentMaterials.characters",
      "talentMaterials.characters.gallery.screenAnimation",
    ],
    select: {
      talentMaterials: {
        name: true,
        guideUrl: true,
        philosophyUrl: true,
        teachingUrl: true,
        dayOne: true,
        dayTwo: true,
        characters: {
          name: true,
          iconUrl: true,
          gallery: {
            id: true,
            screenAnimation: {
              idleTwo: true,
              idleOne: true,
            },
          },
        },
      },
    },
  });
}

/**
 * Loads the characters from the database.
 *
 * This function fetches all characters, including their related elements,
 * weapon types, and nations. The data is retrieved from the Character repository
 * with specific relations.
 *
 * @returns {Promise<Character[]>} A promise that resolves to an array of characters with their related data.
 */
export async function loadCharacters(): Promise<Character[]> {
  const characterRepo = repo(Character);
  return characterRepo.find({
    relations: ["element", "weaponType", "nation"],
  });
}

/**
 * Loads the weapons from the database.
 *
 * This function fetches all weapon types, including their related weapons,
 * materials, and passives. The data is retrieved from the WeaponType repository
 * with specific relations.
 *
 * @returns {Promise<WeaponType[]>} A promise that resolves to an array of weapon types with their related data.
 */
export async function loadWeapons(): Promise<WeaponType[]> {
  const wepTypeRepo = repo(WeaponType);
  return await wepTypeRepo.find({
    relations: ["weapons", "weapons.materials", "weapons.passives"],
  });
}
