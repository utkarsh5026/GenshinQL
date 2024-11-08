import { DataSource } from "typeorm";

const dataSource = new DataSource({
  type: "sqlite",
  database: "genshin.db",
  synchronize: true,
});

/**
 * Initializes the database connection and optionally drops existing database
 * @param drop - If true, drops the existing database before initializing
 * @returns Promise that resolves when database is initialized
 */
export async function initDb(drop = false) {
  if (drop) await dataSource.dropDatabase();

  console.log("Initializing database...");
  await dataSource.initialize();
  console.log("Database initialized");
}
