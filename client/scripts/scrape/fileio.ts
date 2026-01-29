import * as path from 'node:path';
import * as fs from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import chalk from 'chalk';
import * as os from 'node:os';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const DIRECTORIES = {
  CHARACTERS: 'characters',
  WEAPONS: 'weapons',
  TALENTS: 'talents',
} as const;

export const FILES = {
  GALLERY: 'gallery_op_latest',
  BASE_CHARACTERS: 'baseCharacters',
  ADVANCED_CHARACTERS: 'advancedCharacters',
  TALENTS: 'dailyTalents',
  WEAPONS_DETAILED: 'weaponsDetailed',
} as const;

export const CHARACTER_DIR_NAME = 'characters';
export const WEAPON_DIR_NAME = 'weapons';
export const TALENT_DIR_NAME = 'talents';

export const GALLERY_FILE = 'gallery_op_latest';
export const BASE_CHARACTERS_FILE = 'baseCharacters';
export const ADVANCED_CHARACTERS_FILE = 'advancedCharacters';
export const TALENT_FILE = 'dailyTalents';
export const WEAPONS_DETAILED_FILE = 'weaponsDetailed';

export const PUBLIC_DIR = path.join(__dirname, '..', '..', 'public');
export const BASE_DIR = path.join(
  __dirname,
  '..',
  '..',
  'public',
  'data',
  'raw'
);
export const CHARACTER_DIR = path.join(BASE_DIR, CHARACTER_DIR_NAME);
export const WEAPONS_DIR = path.join(BASE_DIR, WEAPON_DIR_NAME);
export const TALENT_DIR = path.join(BASE_DIR, TALENT_DIR_NAME);

/**
 * Loads and parses JSON data from a file with detailed logging.
 */
export const loadJsonData = async <T>(filepath: string): Promise<T | null> => {
  if (!filepath.endsWith('.json')) filepath += '.json';

  const fileName = path.basename(filepath);
  console.log(chalk.cyan('📖 Loading:'), chalk.white(fileName));

  try {
    const exists = await fs
      .access(filepath)
      .then(() => true)
      .catch(() => false);

    if (!exists) {
      console.log(chalk.yellow('⚠️  File not found:'), chalk.white(fileName));
      return null;
    }

    const data = await fs.readFile(filepath, 'utf8');
    const parsed = JSON.parse(data) as T;

    const fileSize = Buffer.byteLength(data, 'utf8');
    const fileSizeKB = (fileSize / 1024).toFixed(2);

    console.log(
      chalk.green('✅ Loaded:'),
      chalk.bold(fileName),
      chalk.gray(`(${fileSizeKB} KB)`)
    );
    console.log(chalk.gray('   →'), chalk.dim(filepath));

    return parsed;
  } catch (error) {
    console.log(chalk.red('❌ Error loading:'), chalk.white(fileName));
    console.error(chalk.red('   Error:'), error);
    throw error;
  }
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

  try {
    await fs.access(dir);
  } catch {
    await fs.mkdir(dir, { recursive: true });
    return `${fileStartsWith}1.json`;
  }

  const files = await fs.readdir(dir);
  for (const file of files) {
    if (!file.startsWith(fileStartsWith)) continue;

    try {
      const onlyVer = file.replace(fileStartsWith, '').split('.')[0];
      const ver = Number.parseInt(onlyVer);

      if (ver > maxVersion) maxVersion = ver;
    } catch {
      console.warn(`Could not parse version from file: ${file}`);
    }
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
export async function saveJson(
  data: unknown,
  fullPath: string,
  fileName: string
) {
  fileName = fileName.endsWith('.json') ? fileName : `${fileName}.json`;
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
 */
export async function saveFileWithNewVersion(
  data: unknown,
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
    await fs.access(fullPath);
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
 * Ensures a filename has .json extension
 */
function normalizeFileName(fileName: string): string {
  return fileName.endsWith('.json') ? fileName : `${fileName}.json`;
}

/**
 * Ensures directory exists, creating it if necessary
 */
async function ensureDirectoryExists(dir: string): Promise<void> {
  await fs.access(dir).catch(async () => {
    await fs.mkdir(dir, { recursive: true });
    console.log(chalk.blue('📁 Created directory:'), chalk.gray(dir));
  });
}

interface WriteJsonFileOptions {
  data: unknown;
  filePath: string;
  fileName: string;
}

/**
 * Core function to write JSON file with consistent logging
 */
async function writeJsonFile({
  data,
  filePath,
  fileName,
}: WriteJsonFileOptions): Promise<void> {
  console.log(chalk.cyan('💾 Preparing to save:'), chalk.white(fileName));

  const jsonData = JSON.stringify(data, null, 4);
  const fileSize = Buffer.byteLength(jsonData, 'utf8');
  const fileSizeKB = (fileSize / 1024).toFixed(2);

  await fs.writeFile(filePath, jsonData);

  console.log(
    chalk.green('✅ Saved:'),
    chalk.bold(fileName),
    chalk.gray(`(${fileSizeKB} KB)`)
  );
  console.log(chalk.gray('   →'), chalk.dim(filePath));
}

/**
 * Handles file save errors with consistent logging
 */
function handleSaveError(
  error: unknown,
  fileName: string,
  message: string
): never {
  console.log(chalk.red(`❌ ${message}:`), chalk.white(fileName));
  console.error(chalk.red('   Error:'), error);
  throw error;
}

/**
 * Saves data directly to the public folder so React components can access it.
 * This is used for production data files that the frontend needs to fetch.
 */
export async function saveToPublic(
  data: unknown,
  fileName: string
): Promise<void> {
  fileName = normalizeFileName(fileName);

  try {
    await ensureDirectoryExists(PUBLIC_DIR);
    const filePath = path.join(PUBLIC_DIR, fileName);
    await writeJsonFile({ data, filePath, fileName });
  } catch (error) {
    handleSaveError(error, fileName, 'Error saving');
  }
}

/**
 * Loads data from the public folder.
 * This is used to read production data files that were saved with saveToPublic.
 * Wrapper around loadJsonData that constructs the path to the public directory.
 */
export async function loadFromPublic<T>(fileName: string): Promise<T | null> {
  fileName = normalizeFileName(fileName);
  const filePath = path.join(PUBLIC_DIR, fileName);
  return await loadJsonData<T>(filePath);
}

/**
 * Saves data to a temporary file and returns the full path to the temporary file.
 * Creates a unique filename to avoid conflicts.
 */
export async function saveToTemp(
  data: unknown,
  fileName: string,
  subDir: string = 'genshin-scraper'
): Promise<string> {
  const baseName = normalizeFileName(fileName);

  const timestamp = Date.now();
  const uniqueFileName = `${baseName}_${timestamp}.json`;
  const tempDir = path.join(os.tmpdir(), subDir);

  try {
    await fs.mkdir(tempDir, { recursive: true });
    const tempFilePath = path.join(tempDir, uniqueFileName);

    await writeJsonFile({
      data,
      filePath: tempFilePath,
      fileName: uniqueFileName,
    });

    return tempFilePath;
  } catch (error) {
    handleSaveError(error, uniqueFileName, 'Error saving temp file');
  }
}

/**
 * Cleans up temporary files created by saveToTemp function.
 * Removes all files from the temp subdirectory.
 *
 * @param subDir - The subdirectory name within temp folder (should match saveToTemp call)
 * @returns Promise that resolves when cleanup is complete
 */
export async function cleanupTempFiles(
  subDir: string = 'genshin-scraper'
): Promise<void> {
  const tempDir = path.join(os.tmpdir(), subDir);

  try {
    await fs.access(tempDir);
    const files = await fs.readdir(tempDir);

    console.log(chalk.yellow('🧹 Cleaning up temp files...'));

    for (const file of files) {
      const filePath = path.join(tempDir, file);
      await fs.unlink(filePath);
      console.log(chalk.gray('   Removed:'), chalk.dim(file));
    }

    await fs.rmdir(tempDir);
    console.log(chalk.green('✅ Temp cleanup complete'));
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      console.log(chalk.gray('ℹ️  No temp files to clean up'));
    } else {
      console.error(chalk.red('❌ Error during temp cleanup:'), error);
    }
  }
}
