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
