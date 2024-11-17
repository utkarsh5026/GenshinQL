import Character from "./models/Character";
import Nation from "./models/Nation";
import Weapon from "./models/Weapon";
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
    relations: [
      "element",
      "weaponType",
      "nation",
      "gallery.screenAnimation",
      "gallery.attackAnimation",
    ],
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
    relations: ["weapons", "weapons.passives"],
  });
}

/**
 * Loads a character by their name from the database.
 *
 * This function fetches a character based on the provided name, including their related elements,
 * weapon types, nations, constellations, and character talents with their animations. The data is
 * retrieved from the Character repository with specific relations and ordered by constellation level.
 *
 * @param {string} name - The name of the character to load.
 * @returns {Promise<Character | null>} A promise that resolves to the character with their related data.
 */
export async function loadCharacterByName(
  name: string
): Promise<Character | null> {
  return await repo(Character).findOne({
    where: { name },
    relations: [
      "element",
      "weaponType",
      "nation",
      "constellations",
      "characterTalents.talentAnimations",
      "gallery",
      "gallery.nameCard",
      "gallery.screenAnimation",
    ],
    order: {
      constellations: {
        level: "ASC",
      },
    },

    select: {
      gallery: {
        id: true,
        nameCard: {
          background: true,
        },
      },
    },
  });
}

/**
 * Loads the gallery information for a character by their name from the database.
 *
 * This function fetches the gallery data for a character based on the provided name,
 * including their related name card, attack animations, and screen animations. The data is
 * retrieved from the Character repository with specific relations.
 *
 * @param {string} name - The name of the character whose gallery information is to be loaded.
 * @returns {Promise<Character | null>} A promise that resolves to the character's gallery information with related data.
 */
export async function loadCharacterGallery(
  name: string
): Promise<Character | null> {
  return await repo(Character).findOne({
    where: { name },
    relations: [
      "gallery",
      "gallery.nameCard",
      "gallery.attackAnimation",
      "gallery.screenAnimation",
    ],
  });
}

/**
 * Loads the attack animations for a character by their name from the database.
 *
 * This function fetches the attack animation data for a character based on the provided name.
 * The data is retrieved from the Character repository with specific relations.
 *
 * @param {string} name - The name of the character whose attack animations are to be loaded.
 * @returns {Promise<Character | null>} A promise that resolves to the character's attack animation information with related data.
 */
export async function loadCharacterAttackAnimations(
  name: string
): Promise<Character | null> {
  return await repo(Character).findOne({
    where: { name },
    relations: ["gallery", "gallery.attackAnimation"],
    select: {
      id: true,
      name: true,
      gallery: {
        id: true,
      },
    },
  });
}

export async function loadWeaponMaterialSchedule() {
  return await repo(Nation).find({
    relations: [
      "weaponMaterials",
      "weaponMaterials.weapons",
      "weaponMaterials.weapons.weaponType",
      "weaponMaterials.materialImages",
    ],
  });
}

export async function loadWeaponsOfType(type: string) {
  return await repo(Weapon).find({
    where: { weaponType: { name: type } },
    order: {
      rarity: "DESC",
    },
  });
}
