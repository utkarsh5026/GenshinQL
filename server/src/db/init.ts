import { DataSource } from "typeorm";
import path from "path";
import fs from "fs";

import Nation from "./models/Nation";
import Element from "./models/Element";
import Weapon from "./models/Weapon";
import WeaponType from "./models/WeaponType";
import WeaponMaterial from "./models/WeapMaterial";
import WeaponPassive from "./models/WeaponPassive";
import Character from "./models/Character";
import CharacterTalent from "./models/CharacterTalent";
import Constellation from "./models/Constellation";
import TalentMaterial from "./models/TalentMaterial";
import TalentAnimations from "./models/TalentAnimations";
import ScreenAnimation from "./models/ScreenAnimation";
import NameCard from "./models/NameCard";
import AttackAnimation from "./models/AttackAnimation";
import Gallery from "./models/Gallery";
import ScreenAnimationMedia from "./models/ScreenAnimationMedia";
import WeaponMaterialImages from "./models/WeaponMaterialImages";
import PaimonPaintings from "./models/PaimonPaintings";
import HoyolabDetailedImages from "./models/HoyolabDetailedImages";

export const dataSource = new DataSource({
  type: "sqlite",
  database: "genshin-supa.db",
  synchronize: true,
  logging: ["error"],
  entities: [
    Nation,
    Element,
    Weapon,
    WeaponType,
    WeaponMaterial,
    WeaponPassive,
    Character,
    CharacterTalent,
    Constellation,
    TalentMaterial,
    TalentAnimations,
    ScreenAnimation,
    NameCard,
    AttackAnimation,
    Gallery,
    ScreenAnimationMedia,
    WeaponMaterialImages,
    PaimonPaintings,
    HoyolabDetailedImages,
  ],
});

/**
 * Initializes the database connection and optionally drops existing database
 * @param drop - If true, drops the existing database before initializing
 * @returns Promise that resolves when a database is initialized
 */
export async function initDb(drop = false) {
  const fileLocation = path.join(__dirname, "genshin.db");
  if (fs.existsSync(fileLocation)) {
    fs.unlinkSync(fileLocation);
  }

  console.log("Initializing database...");
  await dataSource.initialize();
  console.log("Database initialized");
}
