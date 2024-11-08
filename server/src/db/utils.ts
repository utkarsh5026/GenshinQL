import { EntityTarget, Table } from "typeorm";
import { ObjectLiteral } from "typeorm";
import { dataSource } from "./init";

export function repo<T extends ObjectLiteral>(entity: EntityTarget<T>) {
  return dataSource.getRepository(entity);
}

export async function printAllTableContents() {
  const queryRunner = dataSource.createQueryRunner();
  try {
    const tables: Table[] = await queryRunner.getTables();
    for (const table of tables) {
      try {
        console.log(`\nTable: ${table.name}`);
        const repository = dataSource.getRepository(table.name);
        const data = await repository.find();
        console.table(data);
      } catch (e) {
        console.error(`Error printing table ${table.name}: ${e}`);
      }
    }
  } finally {
    await queryRunner.release();
  }
}
