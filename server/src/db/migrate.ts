import path from "path";
import fs from "fs/promises";
import { loadJsonPath } from "../data/setup";
import { initDb } from "./init";

import { repo } from "./utils";
import { z } from "zod";
import {
  advancedCharacterSchema,
  animationSchema,
  baseCharacterSchema,
  constellationSchema,
  gallerySchema,
  ImageSchema,
  talentDaySchema,
  talentSchema,
  WeaponMaterialSchema,
  weaponTypeSchema,
} from "../data/schema";

import WeaponModel from "./models/Weapon";
import WeaponTypeModel from "./models/WeaponType";
import WeaponMaterial from "./models/WeapMaterial";
import WeaponPassive from "./models/WeaponPassive";
import TalentMaterial from "./models/TalentMaterial";
import NationModel from "./models/Nation";
import ElementModel from "./models/Element";
import CharacterModel from "./models/Character";
import ConstellationModel from "./models/Constellation";
import CharacterTalentModel from "./models/CharacterTalent";
import TalentAnimationsModel from "./models/TalentAnimations";
import GalleryModel from "./models/Gallery";
import ScreenAnimationModel from "./models/ScreenAnimation";
import NameCardModel from "./models/NameCard";
import AttackAnimationModel from "./models/AttackAnimation";
import { Like } from "typeorm";
import { toOriginalName } from "../data/utils";
import ScreenAnimationMedia from "./models/ScreenAnimationMedia";
import WeaponMaterialImages from "./models/WeaponMaterialImages";
import HoyolabDetailedImages from "./models/HoyolabDetailedImages";
import PaimonPaintings from "./models/PaimonPaintings";

import {
  loadCharacters,
  loadCharactersGallery,
  loadDailyTalents,
  loadWeapons,
} from "../data/load";

type WeaponTypeSchema = z.infer<typeof weaponTypeSchema>;
type TalentDaySchema = z.infer<typeof talentDaySchema>;
type BaseCharacterSchema = z.infer<typeof baseCharacterSchema>;
type AdvancedCharacterSchema = z.infer<typeof advancedCharacterSchema>;
type ConstellationSchema = z.infer<typeof constellationSchema>;
type TalentSchema = z.infer<typeof talentSchema>;
type GallerySchema = z.infer<typeof gallerySchema>;
type ScreenAnimationSchema = z.infer<
  typeof gallerySchema.shape.screenAnimations
>;
type NameCardSchema = z.infer<typeof gallerySchema.shape.nameCards>;
type AttackAnimationSchema = z.infer<
  typeof gallerySchema.shape.attackAnimations
>;
type AnimationSchema = z.infer<typeof animationSchema>;

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

  const weaponData = await loadWeapons();
  if (weaponData === null) throw new Error("Weapon data not found");
  const matMap = await createWeaponMaterialMap();

  const wepTypes = Object.keys(weaponData) as WeaponTypeSchema[];
  const weaponsToSave: WeaponModel[] = [];

  for (const type of wepTypes) {
    const weapons = weaponData[type];

    for (const weapon of weapons) {
      const { name, rarity, attack, subStat, effect, passives, iconUrl } =
        weapon;
      const mat = matMap[name];

      const newWeapon = new WeaponModel();
      newWeapon.iconUrl = iconUrl;
      newWeapon.name = name;
      newWeapon.rarity = rarity;
      newWeapon.attack = attack;
      newWeapon.subStat = subStat;
      newWeapon.effect = effect;
      newWeapon.weaponType = await weaponTypeRepo.findOneByOrFail({
        name: type,
      });

      newWeapon.material = await repo(WeaponMaterial).findOneOrFail({
        where: {
          dayOne: mat.day,
          nation: {
            name: mat.nation,
          },
        },
        relations: {
          nation: true,
        },
      });

      const passivesToSave: WeaponPassive[] = [];
      for (const passive of passives) {
        const newPassive = new WeaponPassive();
        newPassive.description = passive;
        passivesToSave.push(newPassive);
      }

      newWeapon.passives = passivesToSave;
      weaponsToSave.push(newWeapon);
    }
  }

  await weaponRepo.save(weaponsToSave);
}

/**
 * Creates a mapping of weapon names to their material farming details.
 *
 * This function performs the following:
 * 1. Loads weapon material data from JSON file organized by nation
 * 2. Validates that materials exist for all nations (except Snezhnaya)
 * 3. Creates a map where:
 *    - Keys are weapon names
 *    - Values are objects containing:
 *      - day: The first day the material is available (cleaned of formatting)
 *      - nation: The nation where the material is found
 *
 * @returns A record mapping weapon names to their material details
 * @throws Error if materials are not found for a nation
 */
async function createWeaponMaterialMap() {
  const materials = (await loadJsonPath(
    path.join("weapons", "material_calendar.json"),
  )) as Record<string, WeaponMaterialSchema[]>;

  (await repo(NationModel).find()).forEach((nation) => {
    if (nation.name === "Snezhnaya") return;
    if (!Object.keys(materials).includes(nation.name))
      throw new Error(`No materials found for ${nation.name}`);
  });

  const matMap: Record<string, { day: string; nation: string }> = {};
  for (const [nation, mats] of Object.entries(materials)) {
    mats.forEach((mat) => {
      mat.weapons.forEach((weapon) => {
        matMap[weapon] = {
          day: mat.day.replace("/", "").split("\n")[0],
          nation,
        };
      });
    });
  }
  return matMap;
}

/**
 * Migrates weapon material data from JSON files into the database.
 *
 * This function performs the following steps:
 * 1. Loads weapon material data from JSON file organized by nation
 * 2. Retrieves all nations from the database
 * 3. For each nation, creates WeaponMaterial records for its weapon materials
 * 4. Associates each weapon material with:
 *    - Its nation
 *    - The days it's available
 *    - Images of the material at different star levels
 * 5. Saves all records to the database with proper relationships
 *
 * The weapon material data is expected to contain:
 * - Nations as top level keys
 * - Arrays of material objects containing:
 *   - Days when materials are available
 *   - Images of the materials at different rarities
 *   - Weapons that use the materials
 *
 * @throws Error if weapon materials are not found for a nation
 * @throws Error if database operations fail
 */
async function migrateWeaponMaterials() {
  const matRepo = repo(WeaponMaterial);

  const materials = (await loadJsonPath(
    path.join("weapons", "material_calendar.json"),
  )) as Record<string, WeaponMaterialSchema[]>;

  console.dir(materials, { depth: null });

  const nations = await repo(NationModel).find();
  nations.forEach((nation) => {
    if (nation.name === "Snezhnaya") return;
    if (!Object.keys(materials).includes(nation.name))
      throw new Error(`No materials found for ${nation.name}`);
  });

  const save: WeaponMaterial[] = [];
  for (const nation of nations) {
    const { name } = nation;
    if (name === "Snezhnaya") continue;
    const mats = materials[name];

    const matModels = mats.map((mat) => {
      const { day, images } = mat;
      const newMat = new WeaponMaterial();
      const [dayOne, dayTwo] = day.replace("/", "").split("\n");
      newMat.dayOne = dayOne;
      newMat.dayTwo = dayTwo;
      newMat.nation = nation;

      newMat.materialImages = images.map((image, index) => {
        const newImage = new WeaponMaterialImages();
        newImage.url = image.url;
        newImage.caption = image.caption;
        newImage.starLevel = index + 2;
        newImage.weaponMaterial = newMat;
        return newImage;
      });

      return newMat;
    });

    nation.weaponMaterials = matModels;
    save.push(...matModels);
  }
  await matRepo.save(save);
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
    path.join("talents", "dailyTalents.json"),
  )) as Record<string, TalentDaySchema[]>;

  const nations = await repo(NationModel).find();

  const materialsToSave: TalentMaterial[] = [];
  for (const nation of nations) {
    const name = nation.name;
    if (name === "Snezhnaya") continue;
    const nationMats = materials[name];

    if (!nationMats) throw new Error(`No materials found for ${name}`);
    const books = await createTalentBooks(nationMats);
    books.forEach((mat) => {
      mat.nation = nation;
      materialsToSave.push(mat);
    });
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
async function createTalentBooks(
  talentMaterials: TalentDaySchema[],
): Promise<TalentMaterial[]> {
  const getBookUrl = (bookType: string, mat: TalentDaySchema) => {
    const book = mat.books.find((book) => book.name.includes(bookType));
    if (!book) throw new Error(`No ${bookType} book found`);
    return book.url;
  };

  const charRepo = repo(CharacterModel);
  return await Promise.all(
    talentMaterials.map(async (mat) => {
      const { day, books, characters } = mat;
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

      const chars = await Promise.all(
        characters.map(async ({ name }) => {
          return await charRepo.findOne({
            where: { name: Like(`%${name}%`) },
          });
        }),
      );

      newMat.characters = chars.filter((char) => char !== null);
      return newMat;
    }),
  );
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
  type StringMap = Record<string, string>;
  const characters = await loadCharacters();

  if (characters === null) throw new Error("Character data not found");

  console.dir(characters, { depth: null, colors: true });

  const elementMap: StringMap = {};
  const nationMap: StringMap = {};
  const weaponMap: StringMap = {};

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
      path.join("characters", "detailed", charFile),
    )) as AdvancedCharacterSchema;

    const {
      name,
      element,
      rarity,
      weaponType,
      region,
      constellations,
      talents,
      iconUrl,
      version,
    } = charData;

    const newChar = new CharacterModel();
    newChar.name = name;
    newChar.rarity = rarity;
    newChar.iconUrl = iconUrl;
    newChar.element = await elementRepo.findOneByOrFail({
      name: element,
    });

    newChar.weaponType = await weaponTypeRepo.findOneByOrFail({
      name: weaponType,
    });

    newChar.nation = await nationRepo.findOneByOrFail({
      name: region,
    });

    newChar.version = version;

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
  char: CharacterModel,
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
  char: CharacterModel,
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
 * Migrates gallery data from JSON files into the database.
 *
 * This function performs the following steps:
 * 1. Loads gallery data from JSON file containing character galleries
 * 2. For each character, creates a Gallery record with associated:
 *    - Screen animations (idle poses, menu screens etc)
 *    - Name cards (background, icon, banner)
 *    - Attack animations
 * 3. Links each gallery to its corresponding character
 * 4. Saves all gallery records with proper relationships
 *
 * The gallery data is expected to contain:
 * - Character names as top level keys
 * - Gallery objects containing:
 *   - Screen animations for different poses/menus
 *   - Name card images and banners
 *   - Combat/attack animations
 *
 * @throws Error if character lookup fails
 * @throws Error if database operations fail
 */
async function migrateGallery() {
  const galleryData = await loadCharactersGallery();
  const charRepo = repo(CharacterModel);

  if (galleryData === null) throw new Error("Gallery data not found");

  const galleriesToSave: GalleryModel[] = [];
  for (const [charName, gallery] of Object.entries(galleryData)) {
    try {
      const character = await charRepo.findOneByOrFail({
        name: toOriginalName(charName),
      });

      const {
        screenAnimations,
        nameCards,
        attackAnimations,
        detailedImages,
        stickers,
      } = gallery;
      const newGallery = new GalleryModel();

      newGallery.screenAnimation = createScreenAnimation(screenAnimations);
      newGallery.nameCard = createNameCard(nameCards);
      newGallery.attackAnimation = createAttackAnimation(attackAnimations);

      if (detailedImages)
        newGallery.detailedImages = createDetailedImages(detailedImages);
      if (stickers) newGallery.paimonPaintings = createStickers(stickers);
      newGallery.character = character;
      galleriesToSave.push(newGallery);
    } catch (e) {
      console.log(`Error saving gallery for ${charName}`, e);
    }
  }

  await repo(GalleryModel).save(galleriesToSave);
}

/**
 * Creates a ScreenAnimationModel from screen animation data.
 *
 * This function maps screen animation captions to their URLs and
 * initializes a ScreenAnimationModel with the mapped data.
 *
 * @param screenAnimations - Array of screen animation data with captions and URLs
 * @returns A ScreenAnimationModel populated with the provided data
 */
function createScreenAnimation(
  screenAnimations: ScreenAnimationSchema,
): ScreenAnimationModel {
  const createScreenAnimationMedia = (animation?: AnimationSchema) => {
    if (!animation) return null;
    const { url, videoUrl, caption, videoType } = animation;
    const newMedia = new ScreenAnimationMedia();
    newMedia.imageUrl = url;
    newMedia.videoUrl = videoUrl;
    newMedia.caption = caption;
    newMedia.videoType = videoType;
    return newMedia;
  };
  const capMap: Record<string, AnimationSchema> = {};
  screenAnimations.forEach((sca) => {
    capMap[sca.caption] = sca;
  });

  const newScreenAnimation = new ScreenAnimationModel();
  newScreenAnimation.idleOne = createScreenAnimationMedia(capMap["Idle 1"]);
  newScreenAnimation.idleTwo = createScreenAnimationMedia(capMap["Idle 2"]);
  newScreenAnimation.weaponMenu = createScreenAnimationMedia(
    capMap["Weapon Menu"],
  );
  newScreenAnimation.talentMenu = createScreenAnimationMedia(
    capMap["Talent Menu"],
  );
  newScreenAnimation.partySetup = createScreenAnimationMedia(
    capMap["Party Setup"],
  );

  return newScreenAnimation;
}

/**
 * Creates a NameCardModel from name card data.
 *
 * This function maps name card captions to their URLs and
 * initializes a NameCardModel with the mapped data.
 *
 * @param nameCards - Array of name card data with captions and URLs
 * @returns A NameCardModel populated with the provided data
 * @throws Error if a required caption is not found
 */
function createNameCard(nameCards: NameCardSchema): NameCardModel {
  const nameCardMap: Record<string, string> = {};
  const getUrl = (text: string) => {
    const caption = Object.keys(nameCardMap).find((key) => key.includes(text));
    if (caption === undefined) throw new Error(`No caption found for ${text}`);
    return nameCardMap[caption];
  };

  nameCards.forEach(({ caption, url }) => {
    nameCardMap[caption] = url;
  });

  const newNameCard = new NameCardModel();
  newNameCard.background = getUrl("Background");
  newNameCard.icon = getUrl("Icon");
  newNameCard.banner = getUrl("Banner");

  return newNameCard;
}

/**
 * Creates an AttackAnimationModel from attack animation data.
 *
 * This function maps attack animation skills to their URLs and
 * initializes an AttackAnimationModel with the mapped data.
 *
 * @param attackAnimations - Array of attack animation data with skills and animations
 * @returns An AttackAnimationModel populated with the provided data
 */
function createAttackAnimation(
  attackAnimations: AttackAnimationSchema,
): AttackAnimationModel {
  const skillMap: Record<
    (typeof attackAnimations)[number]["skill"],
    AnimationSchema[]
  > = {
    Normal_Attack: [],
    Elemental_Burst: [],
    Elemental_Skill: [],
  };
  for (const { skill, animations } of attackAnimations) {
    skillMap[skill] = animations;
  }

  const newAttackAnimation = new AttackAnimationModel();
  newAttackAnimation.normalAttack = skillMap["Normal_Attack"];
  newAttackAnimation.elementalBurst = skillMap["Elemental_Burst"];
  newAttackAnimation.elementalSkill = skillMap["Elemental_Skill"];
  return newAttackAnimation;
}

/**
 * Creates HoyolabDetailedImages entities from image data.
 *
 * This function takes an array of image data and creates HoyolabDetailedImages
 * entities with the image URLs. These represent detailed character images from
 * the Hoyolab website.
 *
 * @param detailedImages - Array of image data containing URLs
 * @returns Array of HoyolabDetailedImages entities ready to be saved
 */
function createDetailedImages(
  detailedImages: ImageSchema[],
): HoyolabDetailedImages[] {
  return detailedImages.map((image) => {
    const newDetailedImage = new HoyolabDetailedImages();
    newDetailedImage.url = image.url;
    return newDetailedImage;
  });
}

/**
 * Creates PaimonPaintings entities from sticker image data.
 *
 * This function takes an array of sticker image data and creates PaimonPaintings
 * entities with the image URLs. These represent Paimon sticker/emoji images
 * used in the game.
 *
 * @param stickers - Array of sticker image data containing URLs
 * @returns Array of PaimonPaintings entities ready to be saved
 */
function createStickers(stickers: ImageSchema[]): PaimonPaintings[] {
  return stickers.map((image) => {
    const newSticker = new PaimonPaintings();
    newSticker.url = image.url;
    return newSticker;
  });
}

async function checkAvailabilityOfFiles() {
  const results = await Promise.all([
    loadCharacters(),
    loadCharactersGallery(),
    loadDailyTalents(),
  ]);

  results.forEach((result, index) => {
    if (result === null) {
      throw new Error("Data not found for the function at index " + index);
    }
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
  await checkAvailabilityOfFiles();
  await initDb();
  console.log("Migrating weapons...");
  await savePrimitives();
  await migrateWeaponMaterials();
  await migrateWeapons();
  await saveCharacters();
  await migrateGallery();
  await migrateTalentMaterials();
}

if (require.main === module) {
  migrate().then(() => console.log("Migration complete"));
}