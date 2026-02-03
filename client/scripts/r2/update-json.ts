import fs from 'node:fs/promises';
import path from 'node:path';

import { PATHS } from './config.js';
import { getAsset, loadMapping, MappingDatabase } from './mapping.js';
import { hashUrl, isWikiaUrl } from './utils.js';

/**
 * Replace Wikia URLs with R2 URLs recursively in an object
 *
 * @param obj - Object to process
 * @param mapping - Mapping database
 * @param stats - Statistics tracker
 * @returns Processed object with R2 URLs
 */
function replaceUrlsRecursive(
  obj: unknown,
  mapping: MappingDatabase,
  stats: { replaced: number; notFound: number }
): unknown {
  if (obj == null) {
    return obj;
  }

  if (typeof obj === 'string' && isWikiaUrl(obj)) {
    const hash = hashUrl(obj);
    const asset = getAsset(mapping, hash);

    if (asset?.r2Url) {
      stats.replaced++;
      return asset.r2Url;
    } else {
      stats.notFound++;
      console.warn(`No R2 URL for: ${obj}`);
      return obj;
    }
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => replaceUrlsRecursive(item, mapping, stats));
  }

  if (typeof obj === 'object' && obj !== null) {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
      result[key] = replaceUrlsRecursive(value, mapping, stats);
    }
    return result;
  }

  return obj;
}

/**
 * Create backup of a character JSON file
 *
 * @param filePath - Path to original file
 * @returns Path to backup file
 */
async function backupFile(filePath: string): Promise<string> {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const fileName = path.basename(filePath);
  const backupPath = path.join(PATHS.backupsDir, `${timestamp}_${fileName}`);

  await fs.mkdir(PATHS.backupsDir, { recursive: true });
  await fs.copyFile(filePath, backupPath);

  return backupPath;
}

/**
 * Update a single character JSON file with R2 URLs
 *
 * @param filePath - Path to character JSON file
 * @param mapping - Mapping database
 * @param createBackup - Whether to create backup before updating
 * @returns Update statistics
 */
async function updateCharacterFile(
  filePath: string,
  mapping: MappingDatabase,
  createBackup: boolean = true
): Promise<{ replaced: number; notFound: number }> {
  const content = await fs.readFile(filePath, 'utf-8');
  const character = JSON.parse(content);

  if (createBackup) {
    await backupFile(filePath);
  }

  const stats = { replaced: 0, notFound: 0 };
  const updated = replaceUrlsRecursive(character, mapping, stats);

  const updatedContent = JSON.stringify(updated, null, 4);
  await fs.writeFile(filePath, updatedContent, 'utf-8');

  return stats;
}

/**
 * Update all character JSON files with R2 URLs
 *
 * @param createBackups - Whether to create backups before updating
 */
export async function updateCharacterJsons(
  createBackups: boolean = true
): Promise<void> {
  console.log('\n=== Starting JSON Update Phase ===\n');

  if (createBackups) {
    console.log('Backups will be created before updating files.\n');
  }

  // Load mapping
  const mapping = await loadMapping();

  const uploadedCount = Object.values(mapping.mappings).filter(
    (asset) => asset.uploadedAt
  ).length;

  if (uploadedCount === 0) {
    console.log('No assets uploaded to R2 yet. Run upload first.');
    console.log('Command: npm run r2:upload');
    return;
  }

  console.log(`Using ${uploadedCount} R2 URLs for replacement.\n`);

  // Get all character JSON files
  const files = await fs.readdir(PATHS.charactersDir);
  const jsonFiles = files.filter((file) => file.endsWith('.json'));

  console.log(`Found ${jsonFiles.length} character JSON files.\n`);

  // Process each file
  let totalReplaced = 0;
  let totalNotFound = 0;
  let filesUpdated = 0;

  for (const file of jsonFiles) {
    const filePath = path.join(PATHS.charactersDir, file);

    try {
      const stats = await updateCharacterFile(filePath, mapping, createBackups);

      if (stats.replaced > 0) {
        filesUpdated++;
        console.log(`✓ ${file}: ${stats.replaced} URLs replaced`);
      } else {
        console.log(`- ${file}: No URLs to replace`);
      }

      totalReplaced += stats.replaced;
      totalNotFound += stats.notFound;
    } catch (error) {
      console.error(`✗ Error updating ${file}:`, error);
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
