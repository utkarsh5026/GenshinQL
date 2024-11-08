import "reflect-metadata";
import { DataSource, EntityTarget, ObjectLiteral } from "typeorm";
import {
  Character,
  CharacterTalent,
  Element,
  Nation,
  TalentBook,
  WeaponType,
  Constellation,
} from "./models";
import { printDatabaseSchema } from "./utils";

export const AppDataSource = new DataSource({
  type: "sqlite",
  database: "database.sqlite",
  entities: [
    Nation,
    WeaponType,
    Element,
    Character,
    TalentBook,
    CharacterTalent,
    Constellation,
  ],
  synchronize: true,
  logging: true,
});

export async function initializeDatabase() {
  await AppDataSource.initialize();
  console.log("Database initialized 🫡");
  await printDatabaseSchema(AppDataSource.createQueryRunner());
}

export function repo<T extends ObjectLiteral>(entity: EntityTarget<T>) {
  return AppDataSource.getRepository(entity);
}
