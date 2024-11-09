import { EntityTarget, Table, ObjectLiteral } from "typeorm";
import { dataSource } from "./init";

/**
 * Helper function to get a TypeORM repository for a given entity
 * @param entity The entity class or table name to get the repository for
 * @returns Repository instance for the given entity
 */
export function repo<T extends ObjectLiteral>(entity: EntityTarget<T>) {
  return dataSource.getRepository(entity);
}

/**
 * Debug utility function that prints the contents of all tables in the database
 * Each table's contents will be printed in a table format to the console
 * If there is an error printing a specific table, it will be logged but won't stop the process
 */
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
