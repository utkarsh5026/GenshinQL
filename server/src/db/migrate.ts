import path from "path";
import { loadJsonPath } from "../data/setup";
import { initDb } from "./init";

import { printAllTableContents, repo } from "./utils";
import { z } from "zod";
import { weaponSchema, weaponTypeSchema } from "../data/schema";

import WeaponModel from "./models/Weapon";
import WeaponTypeModel from "./models/WeaponType";
import WeaponMaterial from "./models/WeaponMaterial";
import WeaponPassive from "./models/WeaponPassive";

type Weapon = z.infer<typeof weaponSchema>;
type WeaponType = z.infer<typeof weaponTypeSchema>;

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
  )) as Record<WeaponType, Weapon[]>;

  const wepTypes = Object.keys(weaponData) as WeaponType[];
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

export async function migrate() {
  await initDb();
  console.log("Migrating weapons...");
  await migrateWeapons();
  await printAllTableContents();
}

if (require.main === module) {
  migrate().then(() => console.log("Migration complete"));
}
