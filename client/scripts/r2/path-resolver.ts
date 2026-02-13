import fs from 'node:fs/promises';
import path from 'node:path';

import { logger } from '../logger.js';
import { PATHS } from './config.js';

/**
 * Resolved path information
 */
export interface ResolvedPath {
  absolutePath: string;
  relativePath: string; // Relative to public/
  isDirectory: boolean;
  jsonFiles: string[]; // Absolute paths to JSON files
}

/**
 * Validates that a resolved path is within the public directory
 * Prevents path traversal attacks
 *
 * @param resolvedPath - Absolute path to validate
 * @param publicDir - Absolute path to public directory
 * @throws Error if path is outside public directory
 */
function validatePathSafety(resolvedPath: string, publicDir: string): void {
  const normalizedResolved = path.normalize(resolvedPath);
  const normalizedPublic = path.normalize(publicDir);

  if (!normalizedResolved.startsWith(normalizedPublic)) {
    const attemptedRelative = path.relative(publicDir, resolvedPath);
    throw new Error(
      `Security Error: Path must be within public/ directory.\n` +
        `  Attempted: ${attemptedRelative}\n` +
        `  Allowed: Paths within public/ only`
    );
  }
}

/**
 * Get all JSON files from a directory recursively
 *
 * @param dirPath - Absolute path to directory
 * @returns Array of absolute paths to JSON files
 */
async function getJsonFilesFromDir(dirPath: string): Promise<string[]> {
  const jsonFiles: string[] = [];

  try {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);

      if (entry.isDirectory()) {
        // Recursively scan subdirectories
        const subFiles = await getJsonFilesFromDir(fullPath);
        jsonFiles.push(...subFiles);
      } else if (entry.isFile() && entry.name.endsWith('.json')) {
        jsonFiles.push(fullPath);
      }
    }
  } catch (error) {
    throw new Error(`Failed to read directory: ${dirPath}\n${error}`);
  }

  return jsonFiles;
}

/**
 * Validate and return a single JSON file path
 *
 * @param filePath - Absolute path to file
 * @returns Array containing the single file path
 * @throws Error if file is not a JSON file
 */
async function getSingleJsonFile(filePath: string): Promise<string[]> {
  if (!filePath.endsWith('.json')) {
    throw new Error(
      `Invalid file type: ${path.basename(filePath)}\n` +
        `Only JSON files are supported. File must have .json extension.`
    );
  }

  return [filePath];
}

/**
 * Resolve a path argument to a list of JSON files to process
 *
 * @param pathArg - Relative path from CLI (or undefined for default)
 * @returns Resolved path information with list of JSON files
 * @throws Error if path is invalid, doesn't exist, or is unsafe
 *
 * @example
 * ```typescript
 * // Single file
 * const result = await resolvePath('version/latest.json');
 * // result.jsonFiles = ['/abs/path/to/public/version/latest.json']
 *
 * // Directory
 * const result = await resolvePath('characters');
 * // result.jsonFiles = ['/abs/path/to/public/characters/Aino.json', ...]
 *
 * // Default (characters)
 * const result = await resolvePath();
 * // result.jsonFiles = ['/abs/path/to/public/characters/Aino.json', ...]
 * ```
 */
export async function resolvePath(pathArg?: string): Promise<ResolvedPath> {
  const publicDir = PATHS.publicDir;

  // Default to 'characters' for backward compatibility
  const targetPath = pathArg || 'characters';

  // Resolve relative to public/
  const absolutePath = path.resolve(publicDir, targetPath);

  // Security: Ensure path is within public/
  validatePathSafety(absolutePath, publicDir);

  // Check if path exists
  let stats;
  try {
    stats = await fs.stat(absolutePath);
  } catch {
    throw new Error(
      `Path not found: ${targetPath}\n` +
        `Make sure the path exists within the public/ directory.\n` +
        `Absolute path attempted: ${absolutePath}`
    );
  }

  // Get JSON files based on whether it's a file or directory
  let jsonFiles: string[];
  let isDirectory: boolean;

  if (stats.isDirectory()) {
    logger.info(`Resolving directory: ${targetPath}`);
    jsonFiles = await getJsonFilesFromDir(absolutePath);
    isDirectory = true;

    if (jsonFiles.length === 0) {
      logger.warn(
        `No JSON files found in directory: ${targetPath}\n` +
          `Make sure the directory contains .json files.`
      );
    }
  } else {
    logger.info(`Resolving file: ${targetPath}`);
    jsonFiles = await getSingleJsonFile(absolutePath);
    isDirectory = false;
  }

  return {
    absolutePath,
    relativePath: path.relative(publicDir, absolutePath),
    isDirectory,
    jsonFiles,
  };
}
