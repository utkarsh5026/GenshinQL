import fs from 'node:fs/promises';
import path from 'node:path';

import { logger } from '../logger.js';
import { PATHS } from './config.js';
import { loadMapping, saveMapping } from './mapping.js';
import { detectFileType } from './utils.ts';

/**
 * Fix file type mismatches in downloads
 */
export async function fixFileMismatches(): Promise<{
  fixed: number;
  errors: number;
  details: Array<{ hash: string; oldExt: string; newExt: string; url: string }>;
}> {
  logger.log('\n=== Fixing File Type Mismatches ===\n');

  const mapping = await loadMapping();
  let fixed = 0;
  let errors = 0;
  const details: Array<{
    hash: string;
    oldExt: string;
    newExt: string;
    url: string;
  }> = [];

  const fixFile = async (
    file: string,
    categoryPath: string,
    category: string
  ) => {
    const filePath = path.join(categoryPath, file);
    const oldExtension = path.extname(file).slice(1);
    const hash = path.basename(file, path.extname(file));

    try {
      const buffer = await fs.readFile(filePath);
      const actualType = detectFileType(buffer);

      if (!actualType) {
        logger.warn(`Could not detect type for ${category}/${file}`);
        return;
      }

      if (actualType !== oldExtension.toLowerCase()) {
        logger.info(
          `Mismatch: ${category}/${file} - Extension says ${oldExtension}, actual type is ${actualType}`
        );

        const newFileName = `${hash}.${actualType}`;
        const newFilePath = path.join(categoryPath, newFileName);
        await fs.rename(filePath, newFilePath);

        const asset = mapping.mappings[hash];
        if (asset) {
          asset.extension = actualType;
          delete asset.uploadedAt;
          delete asset.r2Key;
          delete asset.r2Url;

          details.push({
            hash,
            oldExt: oldExtension,
            newExt: actualType,
            url: asset.originalUrl,
          });
        }

        logger.success(
          `✓ Fixed: ${category}/${file} → ${category}/${newFileName}`
        );
        fixed++;
      }
    } catch (error) {
      logger.error(`Error processing ${category}/${file}:`, error);
      errors++;
    }
  };

  const printFinalResult = () => {
    logger.log('\n=== Fix Complete ===\n');
    logger.success(`Fixed: ${fixed}`);
    logger.error(`Errors: ${errors}`);

    if (details.length > 0) {
      logger.log('\nFixed files:');
      for (const detail of details.slice(0, 20)) {
        logger.log(`  - ${detail.url}`);
        logger.log(`    Changed: .${detail.oldExt} → .${detail.newExt}`);
      }

      if (details.length > 20) {
        logger.log(`  ... and ${details.length - 20} more`);
      }

      logger.log(
        '\n These files need to be re-uploaded with the correct content type.'
      );
      logger.log('Run: npm run r2:upload');
    }
  };

  try {
    const categories = await fs.readdir(PATHS.downloadsDir);

    for (const category of categories) {
      const categoryPath = path.join(PATHS.downloadsDir, category);
      const stat = await fs.stat(categoryPath);

      if (!stat.isDirectory()) continue;

      logger.log(`Checking category: ${category}`);
      const files = await fs.readdir(categoryPath);

      await Promise.allSettled(
        files.map(async (f) => {
          await fixFile(f, categoryPath, category);
        })
      );
    }
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
      throw error;
    }
    logger.warn('Downloads directory does not exist');
  }

  if (fixed > 0) {
    await saveMapping(mapping);
  }

  printFinalResult();
  return { fixed, errors, details };
}

/**
 * Detect file type during download and save with correct extension
 */
export async function detectAndSaveWithCorrectType(
  buffer: Buffer,
  urlExtension: string,
  category: string,
  hash: string
): Promise<{ actualExtension: string; mismatch: boolean }> {
  const actualType = detectFileType(buffer);

  if (!actualType) {
    return { actualExtension: urlExtension, mismatch: false };
  }

  const mismatch = actualType !== urlExtension.toLowerCase();

  if (mismatch) {
    logger.warn(
      `Type mismatch detected: URL says .${urlExtension}, actual type is .${actualType}`
    );
  }

  const categoryDir = path.join(PATHS.downloadsDir, category);
  await fs.mkdir(categoryDir, { recursive: true });

  const filePath = path.join(categoryDir, `${hash}.${actualType}`);
  await fs.writeFile(filePath, buffer);

  return { actualExtension: actualType, mismatch };
}
