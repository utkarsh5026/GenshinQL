import * as path from "path";
import * as fs from "fs/promises";

export const CHARACTER_DIR_NAME = "characters";
export const WEAPON_DIR_NAME = "weapons";
export const GALLERY_FILE = "gallery_op_latest";
export const BASE_CHARACTERS_FILE = "baseCharacters";

export const BASE_DIR = path.join(__dirname, "..", "..", "data");
export const CHARACTER_DIR = path.join(BASE_DIR, CHARACTER_DIR_NAME);
export const WEAPONS_DIR = path.join(BASE_DIR, WEAPON_DIR_NAME);
export const TALENT_DIR = path.join(BASE_DIR, "talents");

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
  toCreate: boolean = false,
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
 * @param {any} data - The weapon data to save.
 * @param {string} subDir - The subdirectory to save the data in.
 * @param {string} fileName - The filename to save the data as.
 */
export async function saveJson(data: any, subDir: string, fileName: string) {
  const basePath = path.join(BASE_DIR, subDir);
  fileName = fileName.endsWith(".json") ? fileName : `${fileName}.json`;
  try {
    try {
      await fs.access(basePath);
    } catch {
      await fs.mkdir(basePath, { recursive: true });
      console.log(`Created directory: ${basePath}`);
    }
    const jsonData = JSON.stringify(data, null, 4);
    await fs.writeFile(path.join(basePath, fileName), jsonData);
  } catch (error) {
    console.error(`Error saving ${fileName}:`, error);
  }
}
