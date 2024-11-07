import {QueryRunner} from "typeorm";
import {AppDataSource} from "./data-source";

/**
 * Prints the database schema for all tables in a readable format.
 * For each table, displays:
 * - Table name
 * - Column details including:
 *   - Column name
 *   - Data type
 *   - Primary key status
 *   - Nullable status
 *   - Default value if any
 *
 * @param runner - TypeORM QueryRunner instance to access database metadata
 */
export async function printDatabaseSchema(runner: QueryRunner) {
  const tables = await runner.getTables();
  for (const table of tables) {
    console.log(`\nSchema for table ${table.name}:`);

    table.columns.forEach((column) => {
      let columnInfo = `  ${column.name} ${column.type}`;
      if (column.isPrimary) columnInfo += " PRIMARY KEY";
      if (column.isNullable) columnInfo += " NULL";
      else columnInfo += " NOT NULL";
      if (column.default) columnInfo += ` DEFAULT ${column.default}`;
      console.log(columnInfo);
    });
  }
}

/**
 * Displays the contents of all tables in the database.
 * For each table:
 * - Prints the table name
 * - Shows all records in a formatted table view using console.table
 * - If table is empty, displays "No records found"
 *
 * Uses a QueryRunner to safely execute queries and ensures proper cleanup
 * by releasing the runner when done.
 */
export async function showAllTables() {
  const runner = AppDataSource.createQueryRunner();
  try {
    const tables = await runner.getTables();

    for (const table of tables) {
      console.log(`\nContents of table ${table.name}:`);
      const results = await runner.query(`SELECT * FROM ${table.name}`);

      if (results.length > 0) {
        console.table(results);
      } else {
        console.log("  No records found");
      }
    }
  } finally {
    await runner.release();
  }
}