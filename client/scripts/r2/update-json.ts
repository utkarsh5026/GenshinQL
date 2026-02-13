import fs from 'node:fs/promises';
import path from 'node:path';

import { PATHS } from './config.js';
import { getAsset, loadMapping, MappingDatabase } from './mapping.js';
import { resolvePath } from './path-resolver.js';
import { hashUrl, isWikiaUrl } from './utils.js';

/**
 * Replace Wikia URLs with R2 URLs or local paths recursively in an object
 *
 * @param obj - Object to process
 * @param mapping - Mapping database
 * @param stats - Statistics tracker
 * @param useLocalAssets - If true, prefer local paths over R2 URLs
 * @returns Processed object with R2 URLs or local paths
 */
function replaceUrlsRecursive(
  obj: unknown,
  mapping: MappingDatabase,
  stats: { replaced: number; notFound: number },
  useLocalAssets: boolean = false
): unknown {
  if (obj == null) {
    return obj;
  }

  if (typeof obj === 'string' && isWikiaUrl(obj)) {
    const hash = hashUrl(obj);
    const asset = getAsset(mapping, hash);

    if (!asset) {
      stats.notFound++;
      console.warn(`No mapping for: ${obj}`);
      return obj;
    }

    // Priority: localPath (if useLocalAssets) > r2Url > original
    let replacementUrl: string | undefined;

    if (useLocalAssets && asset.localPath) {
      replacementUrl = asset.localPath;
    } else if (asset.r2Url) {
      replacementUrl = asset.r2Url;
    }

    if (replacementUrl) {
      stats.replaced++;
      return replacementUrl;
    } else {
      stats.notFound++;
      console.warn(
        useLocalAssets ? `No local path for: ${obj}` : `No R2 URL for: ${obj}`
      );
      return obj;
    }
  }

  if (Array.isArray(obj)) {
    return obj.map((item) =>
      replaceUrlsRecursive(item, mapping, stats, useLocalAssets)
    );
  }

  if (typeof obj === 'object' && obj !== null) {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
      result[key] = replaceUrlsRecursive(value, mapping, stats, useLocalAssets);
    }
    return result;
  }

  return obj;
}

/**
 * Create backup of a JSON file with subdirectory structure preserved
 *
 * @param filePath - Absolute path to original file
 * @returns Path to backup file
 */
async function backupFile(filePath: string): Promise<string> {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const fileName = path.basename(filePath);
  const relativePath = path.relative(PATHS.publicDir, filePath);

  // Create nested backup structure to preserve context
  // e.g., backups/version/2026-02-13_latest.json instead of flat structure
  const backupSubDir = path.dirname(relativePath);
  const backupDir = path.join(PATHS.backupsDir, backupSubDir);
  const backupPath = path.join(backupDir, `${timestamp}_${fileName}`);

  await fs.mkdir(backupDir, { recursive: true });
  await fs.copyFile(filePath, backupPath);

  return backupPath;
}

/**
 * Update a single JSON file with R2 URLs or local paths
 *
 * @param filePath - Absolute path to JSON file
 * @param mapping - Mapping database
 * @param createBackup - Whether to create backup before updating
 * @param useLocalAssets - If true, prefer local paths over R2 URLs
 * @returns Update statistics
 */
async function updateJsonFile(
  filePath: string,
  mapping: MappingDatabase,
  createBackup: boolean = true,
  useLocalAssets: boolean = false
): Promise<{ replaced: number; notFound: number }> {
  const content = await fs.readFile(filePath, 'utf-8');
  const character = JSON.parse(content);

  if (createBackup) {
    await backupFile(filePath);
  }

  const stats = { replaced: 0, notFound: 0 };
  const updated = replaceUrlsRecursive(
    character,
    mapping,
    stats,
    useLocalAssets
  );

  const updatedContent = JSON.stringify(updated, null, 4);
  await fs.writeFile(filePath, updatedContent, 'utf-8');

  return stats;
}

/**
 * Update JSON files at the specified path with R2 URLs or local paths
 *
 * @param targetPath - Relative path from public/ (defaults to 'characters')
 * @param createBackups - Whether to create backups before updating
 * @param useLocalAssets - If true, prefer local paths over R2 URLs
 */
export async function updateJsonFiles(
  targetPath?: string,
  createBackups: boolean = true,
  useLocalAssets: boolean = false
): Promise<void> {
  console.log('\n=== Starting JSON Update Phase ===\n');

  if (useLocalAssets) {
    console.log('Mode: Using LOCAL ASSET PATHS\n');
  } else {
    console.log('Mode: Using R2 URLS\n');
  }

  if (createBackups) {
    console.log('Backups will be created before updating files.\n');
  }

  // Load mapping
  const mapping = await loadMapping();

  // Validation: check if assets are available
  const availableCount = Object.values(mapping.mappings).filter((asset) => {
    if (useLocalAssets) {
      return asset.localSavedAt && asset.localPath;
    } else {
      return asset.uploadedAt && asset.r2Url;
    }
  }).length;

  if (availableCount === 0) {
    if (useLocalAssets) {
      console.log('No local assets found. Run download with --local first.');
      console.log('Command: npm run r2:download -- --local');
    } else {
      console.log('No assets uploaded to R2 yet. Run upload first.');
      console.log('Command: npm run r2:upload');
    }
    return;
  }

  console.log(
    useLocalAssets
      ? `Using ${availableCount} local asset paths for replacement.\n`
      : `Using ${availableCount} R2 URLs for replacement.\n`
  );

  // Resolve target path (defaults to 'characters')
  const resolved = await resolvePath(targetPath);

  console.log(
    `\n=== Updating ${resolved.isDirectory ? 'directory' : 'file'}: ${resolved.relativePath} ===\n`
  );

  const jsonFiles = resolved.jsonFiles;

  if (jsonFiles.length === 0) {
    console.log('No JSON files found in target path.');
    return;
  }

  console.log(
    `Found ${jsonFiles.length} JSON file${jsonFiles.length === 1 ? '' : 's'}.\n`
  );

  // Process each file
  let totalReplaced = 0;
  let totalNotFound = 0;
  let filesUpdated = 0;

  for (const filePath of jsonFiles) {
    const fileName = path.basename(filePath);

    try {
      const stats = await updateJsonFile(
        filePath,
        mapping,
        createBackups,
        useLocalAssets
      );

      if (stats.replaced > 0) {
        filesUpdated++;
        console.log(`✓ ${fileName}: ${stats.replaced} URLs replaced`);
      } else {
        console.log(`- ${fileName}: No URLs to replace`);
      }

      totalReplaced += stats.replaced;
      totalNotFound += stats.notFound;
    } catch (error) {
      console.error(`✗ Error updating ${fileName}:`, error);
    }
  }

  console.log('\n=== Update Complete ===\n');
  console.log(`Files processed: ${jsonFiles.length}`);
  console.log(`Files updated: ${filesUpdated}`);
  console.log(`Total URLs replaced: ${totalReplaced}`);
  console.log(`URLs not found in R2: ${totalNotFound}`);

  if (createBackups) {
    console.log(`\nBackups saved to: ${PATHS.backupsDir}`);
  }

  if (totalNotFound > 0) {
    console.log(
      '\nNote: Some URLs were not replaced because they are not in R2 yet.'
    );
    console.log('This could mean:');
    console.log('  1. Assets failed to download');
    console.log('  2. Assets failed to upload');
    console.log('  3. New assets added since last download');
    console.log('\nRun download and upload again to sync all assets.');
  }
}

/**
 * Update all character JSON files with R2 URLs or local paths
 * @deprecated Use updateJsonFiles instead
 * @param createBackups - Whether to create backups before updating
 * @param useLocalAssets - If true, prefer local paths over R2 URLs
 */
export async function updateCharacterJsons(
  createBackups: boolean = true,
  useLocalAssets: boolean = false
): Promise<void> {
  return updateJsonFiles(undefined, createBackups, useLocalAssets);
}

/**
 * Restore character JSONs from backups
 *
 * @param timestamp - Specific timestamp to restore from (optional)
 */
export async function restoreFromBackup(timestamp?: string): Promise<void> {
  console.log('\n=== Restoring from Backup ===\n');

  // List all backups
  const backups = await fs.readdir(PATHS.backupsDir);

  if (backups.length === 0) {
    console.log('No backups found.');
    return;
  }

  // Filter by timestamp if provided
  const filteredBackups = timestamp
    ? backups.filter((file) => file.startsWith(timestamp))
    : backups;

  if (filteredBackups.length === 0) {
    console.log(`No backups found for timestamp: ${timestamp}`);
    return;
  }

  console.log(`Restoring ${filteredBackups.length} files...\n`);

  for (const backup of filteredBackups) {
    // Extract original filename (remove timestamp prefix)
    const originalName = backup.replace(
      /^\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}-\d{3}Z_/,
      ''
    );
    const backupPath = path.join(PATHS.backupsDir, backup);
    const originalPath = path.join(PATHS.charactersDir, originalName);

    try {
      await fs.copyFile(backupPath, originalPath);
      console.log(`✓ Restored: ${originalName}`);
    } catch (error) {
      console.error(`✗ Failed to restore ${originalName}:`, error);
    }
  }

  console.log('\nRestore complete!');
}

/**
 * Verify that all URLs in character JSONs are accessible
 *
 * @param sampleSize - Number of URLs to test (0 = test all)
 */
export async function verifyJsonUrls(sampleSize: number = 10): Promise<void> {
  console.log('\n=== Verifying JSON URLs ===\n');

  const files = await fs.readdir(PATHS.charactersDir);
  const jsonFiles = files.filter((file) => file.endsWith('.json'));

  let totalUrls = 0;
  let validUrls = 0;
  let invalidUrls = 0;
  const errors: string[] = [];

  for (const file of jsonFiles.slice(0, sampleSize || jsonFiles.length)) {
    const filePath = path.join(PATHS.charactersDir, file);
    const content = await fs.readFile(filePath, 'utf-8');
    const character = JSON.parse(content);

    // Extract all URLs
    const urls = new Set<string>();
    extractUrlsFromObject(character, urls);

    console.log(`${file}: ${urls.size} URLs`);

    // Test sample of URLs
    for (const url of Array.from(urls).slice(0, 3)) {
      totalUrls++;

      try {
        const response = await fetch(url, { method: 'HEAD' });
        if (response.ok) {
          validUrls++;
          console.log(`  ✓ ${url.substring(0, 60)}...`);
        } else {
          invalidUrls++;
          errors.push(`${url} - HTTP ${response.status}`);
          console.log(`  ✗ ${url.substring(0, 60)}... (${response.status})`);
        }
      } catch (error) {
        invalidUrls++;
        errors.push(`${url} - ${(error as Error).message}`);
        console.log(`  ✗ ${url.substring(0, 60)}... (error)`);
      }
    }
  }

  console.log('\n=== Verification Results ===\n');
  console.log(`Total URLs tested: ${totalUrls}`);
  console.log(`Valid: ${validUrls}`);
  console.log(`Invalid: ${invalidUrls}`);

  if (errors.length > 0) {
    console.log('\nErrors (first 5):');
    for (const error of errors.slice(0, 5)) {
      console.log(`  - ${error}`);
    }
  }
}

/**
 * Helper to extract URLs from object
 */
function extractUrlsFromObject(obj: unknown, urls: Set<string>): void {
  if (typeof obj === 'string' && obj.startsWith('http')) {
    urls.add(obj);
    return;
  }

  if (Array.isArray(obj)) {
    obj.forEach((item) => extractUrlsFromObject(item, urls));
    return;
  }

  if (typeof obj === 'object' && obj !== null) {
    Object.values(obj).forEach((value) => extractUrlsFromObject(value, urls));
  }
}
