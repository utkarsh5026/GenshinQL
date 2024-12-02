import * as path from "path";
import * as fs from "fs/promises";

// directories names
export const CHARACTER_DIR_NAME = "characters";
export const WEAPON_DIR_NAME = "weapons";
export const TALENT_DIR_NAME = "talents";

// file names
export const GALLERY_FILE = "gallery_op_latest";
export const BASE_CHARACTERS_FILE = "baseCharacters";
export const ADVANCED_CHARACTERS_FILE = "advancedCharacters";
export const TALENT_FILE = "dailyTalents";
export const WEAPONS_DETAILED_FILE = "weaponsDetailed";

// directories paths
export const BASE_DIR = path.join(__dirname, "..", "..", "data");
export const CHARACTER_DIR = path.join(BASE_DIR, CHARACTER_DIR_NAME);
export const WEAPONS_DIR = path.join(BASE_DIR, WEAPON_DIR_NAME);
export const TALENT_DIR = path.join(BASE_DIR, TALENT_DIR_NAME);

/**
 * Loads and parses JSON data from a file.
 * @param filepath - Path to the JSON file. If it doesn't end in .json, the extension will be added
 * @template T - The expected type of the parsed JSON data
 * @returns The parsed JSON data cast to type T, or null if the file doesn't exist
 * @throws {Error} If the file exists but contains invalid JSON
 */
export const loadJsonData = async <T>(filepath: string): Promise<T | null> => {
  if (!filepath.endsWith(".json")) filepath += ".json";

  const exists = await fs
    .access(filepath)
    .then(() => true)
    .catch(() => false);
  if (!exists) return null;
  const data = await fs.readFile(filepath, "utf8");
  return JSON.parse(data) as T;
};

/**
 * Gets the filename for the latest version of a file in a directory.
 * If toCreate is true, returns filename for next version. Otherwise returns current latest.
 * @param {string} dir - The directory to search in
 * @param {string} fileStartsWith - The prefix of the files to search for
 * @param {boolean} toCreate - Whether to return next version number (true) or current latest (false)
 * @returns {Promise<string>} The filename with version number and .json extension
 */
export const getLatestVersionFile = async (
  dir: string,
  fileStartsWith: string,
  toCreate: boolean = false
): Promise<string> => {
  let maxVersion = 0;
  const files = await fs.readdir(dir);
  for (const file of files) {
    if (!file.startsWith(fileStartsWith)) continue;

    try {
      const onlyVer = file.replace(fileStartsWith, "").split(".")[0];
      const ver = parseInt(onlyVer);

      if (ver > maxVersion) maxVersion = ver;
    } catch {}
  }

  maxVersion = toCreate ? maxVersion + 1 : maxVersion;
  return maxVersion > 0
    ? `${fileStartsWith}${maxVersion}.json`
    : `${fileStartsWith}.json`;
};

/**
 * Saves the scraped weapon data to a JSON file.
 * if fileName does not end with .json, it will be added.
 * @param {any} data - The weapon data to save.
 * @param {string} fullPath - The full path to the directory to save the data in.
 * @param {string} fileName - The filename to save the data as.
 */
export async function saveJson(data: any, fullPath: string, fileName: string) {
  fileName = fileName.endsWith(".json") ? fileName : `${fileName}.json`;
  try {
    try {
      await fs.access(fullPath);
    } catch {
      await fs.mkdir(fullPath, { recursive: true });
      console.log(`Created directory: ${fullPath}`);
    }
    const jsonData = JSON.stringify(data, null, 4);
    await fs.writeFile(path.join(fullPath, fileName), jsonData);
  } catch (error) {
    console.error(`Error saving ${fileName}:`, error);
  }
}

/**
 * Saves data to a JSON file with an auto-incrementing version number in the filename.
 * Gets the next version number and saves the data with that version.
 *
 * @param {any} data - The data to save to the JSON file
 * @param {string} fullPath - The full path to the directory to save the file in
 * @param {string} fileStartsWith - The prefix for the filename before the version number
 * @returns {Promise<void>} A promise that resolves when the file is saved
 */
export async function saveFileWithNewVersion(
  data: any,
  fullPath: string,
  fileStartsWith: string
): Promise<void> {
  const newFile = await getLatestVersionFile(fullPath, fileStartsWith, true);
  await saveJson(data, fullPath, newFile);
}

/**
 * Lists only files (not directories) in a directory
 *
 * @param fullPath - Path to the directory
 * @returns Promise resolving to array of filenames
 */
export async function listFiles(fullPath: string): Promise<string[]> {
  try {
    const entries = await fs.readdir(fullPath, { withFileTypes: true });
    const files = entries
      .filter((entry) => entry.isFile())
      .map((entry) => entry.name);
    return files;
  } catch (error) {
    console.error(`Error reading directory ${fullPath}:`, error);
    return [];
  }
}

/**
 * Saves data to a JSON file with an auto-incrementing version number in the filename.
 * Gets the next version number and saves the data with that version.
 *
 * @param {Record<string, T>} data - The data to save to the JSON file
 * @param {string} fullPath - The full path to the directory to save the file in
 * @param {string} fileName - The filename to save the data as.
 * @param {boolean} overwrite - Whether to overwrite the file if it exists
 */
export async function saveFile<T>(
  data: Record<string, T>,
  fullPath: string,
  fileName: string,
  overwrite: boolean = false
) {
  const oldFileName = await getLatestVersionFile(fullPath, fileName, false);
  console.log(`File found: ${oldFileName}`);

  if (!overwrite) {
    const existingData = await loadJsonData<Record<string, T>>(
      path.join(fullPath, oldFileName)
    );

    if (existingData) {
      const newData = { ...existingData, ...data };
      await saveFileWithNewVersion(newData, fullPath, fileName);
    } else await saveFileWithNewVersion(data, fullPath, fileName);
  } else await saveFileWithNewVersion(data, fullPath, fileName);
}

/**
 * Loads the contents of the latest version of a file in a directory.
 * @param fullPath - Path to the directory
 * @param fileName - The filename to load the contents of
 * @returns The contents of the latest version of the file, or null if the file doesn't exist
 */
export async function loadLatestFileContents<T>(
  fullPath: string,
  fileName: string
): Promise<T | null> {
  const file = await getLatestVersionFile(fullPath, fileName, false);
  return await loadJsonData<T>(path.join(fullPath, file));
}
