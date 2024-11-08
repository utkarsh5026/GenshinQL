import { DataSource } from "typeorm";
import Nation from "./models/Nation";
import Element from "./models/Element";
import Weapon from "./models/Weapon";
import WeaponType from "./models/WeaponType";
import WeaponMaterial from "./models/WeaponMaterial";
import WeaponPassive from "./models/WeaponPassive";
import path from "path";
import fs from "fs";

export const dataSource = new DataSource({
  type: "sqlite",
  database: "genshin.db",

  synchronize: true,
  logging: true,
  entities: [
    Nation,
    Element,
    Weapon,
    WeaponType,
    WeaponMaterial,
    WeaponPassive,
  ],
});

/**
 * Initializes the database connection and optionally drops existing database
 * @param drop - If true, drops the existing database before initializing
 * @returns Promise that resolves when database is initialized
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
