import fs from 'node:fs/promises';
import path from 'node:path';

import { logger } from '../logger.js';
import { MIGRATION_CONFIG, PATHS } from './config.js';
import {
  type AssetMapping,
  downloadMappingFromR2,
  loadMapping,
  MappingDatabase,
  saveMapping,
  uploadMappingToR2,
  upsertAsset,
} from './mapping.js';
import {
  categorizeUrl,
  createProgressBar,
  detectFileType,
  extractExtension,
  formatTimestamp,
  getRetryDelay,
  hashUrl,
  sleep,
} from './utils.js';

/**
 * Download a file from URL with retry logic
 *
 * @param url - URL to download
 * @param maxRetries - Maximum retry attempts
 * @returns Downloaded content as Buffer
 */
export async function fetchWithRetry(
  url: string,
  maxRetries: number = MIGRATION_CONFIG.maxRetries
): Promise<Buffer> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(url);

      if (response.status === 429) {
        logger.warn(`Rate limited for ${url}, waiting...`);
        await sleep(MIGRATION_CONFIG.rateLimitWaitMs);
        continue;
      }

      if (!response.ok) {
        throw new Error(
          `HTTP ${response.status}: ${response.statusText} for ${url}`
        );
      }

      const arrayBuffer = await response.arrayBuffer();
      return Buffer.from(arrayBuffer);
    } catch (error) {
      lastError = error as Error;

      if (attempt === maxRetries) {
        break;
      }

      const delay = getRetryDelay(attempt);
      logger.warn(
        `Attempt ${attempt + 1}/${maxRetries + 1} failed for ${url}: ${lastError.message}`
      );
      logger.warn(`Retrying in ${delay}ms...`);

      await sleep(delay);
    }
  }

  throw new Error(
    `Failed to download ${url} after ${maxRetries + 1} attempts: ${lastError?.message}`
  );
}

/**
 * Save downloaded content to local cache with actual file type detection
 *
 * @param buffer - File content
 * @param category - Asset category
 * @param hash - URL hash
 * @param urlExtension - File extension from URL
 * @returns Actual extension used for the file
 */
async function saveToLocal(
  buffer: Buffer,
  category: string,
  hash: string,
  urlExtension: string
): Promise<string> {
  const categoryDir = path.join(PATHS.downloadsDir, category);
  await fs.mkdir(categoryDir, { recursive: true });

  const detectedType = detectFileType(buffer);
  const actualExtension = detectedType || urlExtension;

  if (detectedType && detectedType !== urlExtension.toLowerCase()) {
    logger.debug(
      `Type mismatch: URL extension is .${urlExtension} but actual type is .${detectedType}`
    );
  }

  const filePath = path.join(categoryDir, `${hash}.${actualExtension}`);
  await fs.writeFile(filePath, buffer);

  return actualExtension;
}

/**
 * Read downloaded file from local cache
 */
export async function readFromLocal(
  category: string,
  hash: string,
  extension: string
): Promise<Buffer> {
  const filePath = path.join(
    PATHS.downloadsDir,
    category,
    `${hash}.${extension}`
  );
  return await fs.readFile(filePath);
}

/**
 * Check if asset exists in local cache
 */
export async function existsInLocal(
  category: string,
  hash: string,
  extension: string
): Promise<boolean> {
  const filePath = path.join(
    PATHS.downloadsDir,
    category,
    `${hash}.${extension}`
  );

  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

/**
 * Download a single asset
 */
async function downloadAsset(
  url: string,
  mapping: MappingDatabase
): Promise<AssetMapping> {
  const hash = hashUrl(url);
  const category = categorizeUrl(url);
  const urlExtension = extractExtension(url);

  const buffer = await fetchWithRetry(url);

  // Save with actual detected file type
  const actualExtension = await saveToLocal(
    buffer,
    category,
    hash,
    urlExtension
  );

  const asset: AssetMapping = {
    originalUrl: url,
    r2Key: '', // Will be set during upload
    r2Url: '', // Will be set during upload
    category,
    extension: actualExtension, // Use actual extension, not URL extension
    size: buffer.length,
    downloadedAt: formatTimestamp(),
  };

  upsertAsset(mapping, hash, asset);
  return asset;
}

/**
 * Download assets with deduplication
 *
 * @param urls - Array of URLs to download
 */
export async function downloadAssets(
  urls: string[] | Set<string>
): Promise<void> {
  logger.log('\n=== Starting Download Phase ===\n');
  await downloadMappingFromR2();

  const urlArray = Array.isArray(urls) ? urls : Array.from(urls);
  const mapping = await loadMapping();

  const newUrls = urlArray.filter((url) => {
    const hash = hashUrl(url);
    const existing = mapping.mappings[hash];
    return !existing?.downloadedAt;
  });

  const cachedCount = urlArray.length - newUrls.length;

  logger.log(`Total URLs: ${urlArray.length}`);
  logger.log(`Already cached: ${cachedCount}`);
  logger.log(`To download: ${newUrls.length}`);

  if (newUrls.length === 0) {
    logger.success('\nAll assets already downloaded!');
    return;
  }

  logger.log(`\nDownloading ${newUrls.length} new assets...\n`);
  const batchSize = MIGRATION_CONFIG.concurrentDownloads;
  let completed = 0;
  let failed = 0;
  const failures: Array<{ url: string; error: string }> = [];

  const updateProgress = (
    results: PromiseSettledResult<AssetMapping>[],
    batch: string[]
  ) => {
    for (let j = 0; j < results.length; j++) {
      const result = results[j];
      const url = batch[j];

      if (result.status === 'fulfilled') {
        completed++;
      } else {
        failed++;
        failures.push({
          url,
          error: result.reason.message,
        });
        logger.error(`Failed: ${url} - ${result.reason.message}`);
      }
    }
  };

  const showFinalResult = () => {
    logger.log('\n=== Download Complete ===\n');
    logger.success(`Successfully downloaded: ${completed}`);
    logger.error(`Failed: ${failed}`);

    if (failures.length > 0) {
      logger.log('\nFailed downloads:');
      for (const failure of failures.slice(0, 10)) {
        logger.log(`  - ${failure.url}`);
        logger.debug(`    Error: ${failure.error}`);
      }

      if (failures.length > 10) {
        logger.log(`  ... and ${failures.length - 10} more`);
      }
    }
  };

  for (let i = 0; i < newUrls.length; i += batchSize) {
    const batch = newUrls.slice(i, i + batchSize);

    const results = await Promise.allSettled(
      batch.map((url) => downloadAsset(url, mapping))
    );

    updateProgress(results, batch);
    await saveMapping(mapping);
    const progress = createProgressBar(completed + failed, newUrls.length);
    logger.log(`Progress: ${progress}`);
  }

  showFinalResult();
  await saveMapping(mapping);
  await uploadMappingToR2();
}

/**
 * Clear local download cache
 */
export async function clearDownloadCache(): Promise<void> {
  logger.log('Clearing download cache...');

  try {
    await fs.rm(PATHS.downloadsDir, { recursive: true, force: true });
    logger.success('Download cache cleared.');
  } catch (error) {
    logger.error('Error clearing cache:', error);
  }
}

/**
 * Get download cache statistics
 */
export async function getDownloadCacheStats() {
  const stats = {
    totalFiles: 0,
    totalSizeBytes: 0,
    byCategory: {} as Record<string, { count: number; sizeBytes: number }>,
  };

  try {
    const categories = await fs.readdir(PATHS.downloadsDir);

    for (const category of categories) {
      const categoryPath = path.join(PATHS.downloadsDir, category);
      const stat = await fs.stat(categoryPath);

      if (!stat.isDirectory()) continue;

      const files = await fs.readdir(categoryPath);
      let categorySize = 0;

      for (const file of files) {
        const filePath = path.join(categoryPath, file);
        const fileStat = await fs.stat(filePath);
        categorySize += fileStat.size;
      }

      stats.byCategory[category] = {
        count: files.length,
        sizeBytes: categorySize,
      };

      stats.totalFiles += files.length;
      stats.totalSizeBytes += categorySize;
    }
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
      throw error;
    }
  }

  return stats;
}
