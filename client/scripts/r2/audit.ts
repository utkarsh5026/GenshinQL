import { ListObjectsV2Command, S3Client } from '@aws-sdk/client-s3';
import chalk from 'chalk';

import { logger } from '../logger.js';
import { createR2Client } from './client.js';
import { ASSET_CATEGORIES, type AssetCategory, R2_CONFIG } from './config.js';
import { loadMapping } from './mapping.js';
import { createProgressBar } from './utils.js';

/**
 * Audit results structure
 */
interface AuditResults {
  totalR2Files: number;
  totalMappedFiles: number;
  untrackedFiles: number;
  untrackedByCategory: Record<string, number>;
  untrackedExamples: Record<string, string[]>;
}

/**
 * Extract category from R2 key
 *
 * @param r2Key - R2 object key (e.g., 'icons/hash.png')
 * @returns Category name or 'unknown'
 */
function extractCategoryFromKey(r2Key: string): string {
  const parts = r2Key.split('/');
  if (parts.length < 2) return 'unknown';

  const category = parts[0];
  return ASSET_CATEGORIES.includes(category as AssetCategory)
    ? category
    : 'unknown';
}

/**
 * List all files from R2 with full pagination
 *
 * @param client - S3 client
 * @returns Array of all R2 object keys (excluding metadata/)
 */
async function listAllR2Files(client: S3Client): Promise<string[]> {
  const r2Keys: string[] = [];
  let continuationToken: string | undefined;
  let totalProcessed = 0;

  logger.log(chalk.cyan('Listing all files from R2...\n'));

  do {
    const command = new ListObjectsV2Command({
      Bucket: R2_CONFIG.bucketName,
      ContinuationToken: continuationToken,
      MaxKeys: 1000,
    });

    const response = await client.send(command);

    const keys = (response.Contents || [])
      .map((obj) => obj.Key)
      .filter(
        (key): key is string =>
          key !== undefined && !key.startsWith('metadata/')
      );

    r2Keys.push(...keys);
    totalProcessed += keys.length;

    if (totalProcessed > 0 && totalProcessed % 500 === 0) {
      logger.debug(`Listed ${totalProcessed} files so far...`);
    }

    continuationToken = response.NextContinuationToken;
  } while (continuationToken);

  return r2Keys;
}

/**
 * Compare R2 files against mapping database
 *
 * @param r2Keys - All R2 object keys
 * @param mappedKeys - Set of tracked r2Keys
 * @returns Audit results with categorized untracked files
 */
function compareFiles(r2Keys: string[], mappedKeys: Set<string>): AuditResults {
  const untrackedByCategory: Record<string, number> = {};
  const untrackedExamples: Record<string, string[]> = {};
  let untrackedCount = 0;

  for (const category of [...ASSET_CATEGORIES, 'unknown']) {
    untrackedByCategory[category] = 0;
    untrackedExamples[category] = [];
  }

  for (const r2Key of r2Keys) {
    if (!mappedKeys.has(r2Key)) {
      const category = extractCategoryFromKey(r2Key);
      untrackedCount++;
      untrackedByCategory[category]++;
      if (untrackedExamples[category].length < 5) {
        untrackedExamples[category].push(r2Key);
      }
    }
  }

  return {
    totalR2Files: r2Keys.length,
    totalMappedFiles: mappedKeys.size,
    untrackedFiles: untrackedCount,
    untrackedByCategory,
    untrackedExamples,
  };
}

/**
 * Display audit results with formatting
 *
 * @param results - Audit results
 */
function displayResults(results: AuditResults): void {
  const {
    totalR2Files,
    totalMappedFiles,
    untrackedFiles,
    untrackedByCategory,
    untrackedExamples,
  } = results;

  console.log(chalk.bold.cyan('\n=== Audit Results ===\n'));

  const percentage =
    totalR2Files > 0
      ? ((untrackedFiles / totalR2Files) * 100).toFixed(1)
      : '0.0';

  console.log(
    `Total files in R2:        ${chalk.bold(totalR2Files.toLocaleString())}`
  );
  console.log(
    `Files in mapping:         ${chalk.bold(totalMappedFiles.toLocaleString())}`
  );
  console.log(
    `Untracked files:          ${chalk.bold.yellow(untrackedFiles.toLocaleString())} ${chalk.dim(`(${percentage}%)`)}`
  );

  console.log(chalk.bold.cyan('\n=== Untracked Files by Category ===\n'));
  const allCategories = [...ASSET_CATEGORIES, 'unknown'];
  const categoriesWithUntracked = allCategories.filter(
    (cat) => untrackedByCategory[cat] > 0
  );
  const categoriesFullyTracked = allCategories.filter(
    (cat) => untrackedByCategory[cat] === 0
  );

  for (const category of categoriesWithUntracked) {
    const count = untrackedByCategory[category];
    const examples = untrackedExamples[category];

    console.log(chalk.yellow(`  ${category}/`));
    console.log(
      `    Count: ${chalk.bold(count.toLocaleString())} untracked ${count === 1 ? 'file' : 'files'}`
    );

    if (examples.length > 0) {
      console.log(`    Examples:`);
      const displayCount = Math.min(3, examples.length);
      for (let i = 0; i < displayCount; i++) {
        console.log(chalk.dim(`      - ${examples[i]}`));
      }

      if (count > displayCount) {
        console.log(chalk.dim(`      ... and ${count - displayCount} more`));
      }
    }

    console.log(); // Empty line between categories
  }

  if (categoriesFullyTracked.length > 0) {
    for (const category of categoriesFullyTracked) {
      console.log(chalk.green(`  ${category}/`));
      console.log(chalk.green(`    ✓ All files tracked (0 untracked)\n`));
    }
  }

  console.log(chalk.bold.cyan('=== Recommendations ===\n'));

  if (untrackedFiles === 0) {
    console.log(
      chalk.green('✓ All files in R2 are tracked in url-mapping.json!')
    );
    console.log(
      chalk.dim('  Your R2 storage and mapping database are in sync.\n')
    );
  } else {
    console.log(
      chalk.yellow(
        `⚠️  Found ${untrackedFiles} untracked ${untrackedFiles === 1 ? 'file' : 'files'} in R2 storage.\n`
      )
    );
  }
}

/**
 * Audit R2 storage against url-mapping.json
 * Finds files in R2 that are not tracked in the mapping database
 *
 * @returns Audit results with statistics
 */
export async function auditR2(): Promise<AuditResults> {
  try {
    console.log(chalk.bold.cyan('\n=== R2 Storage Audit ===\n'));
    const client = createR2Client();
    const r2Keys = await listAllR2Files(client);

    if (r2Keys.length === 0) {
      logger.warn('R2 bucket is empty or contains only metadata files.');
      console.log(chalk.dim('\nNothing to audit.\n'));

      return {
        totalR2Files: 0,
        totalMappedFiles: 0,
        untrackedFiles: 0,
        untrackedByCategory: {},
        untrackedExamples: {},
      };
    }

    console.log(createProgressBar(r2Keys.length, r2Keys.length));
    logger.log(chalk.cyan('\nLoading url-mapping.json...'));
    const mapping = await loadMapping();

    const totalMappedFiles = Object.keys(mapping.mappings).length;

    if (totalMappedFiles === 0) {
      logger.warn(
        'No mapping database found or empty. All R2 files will show as untracked.'
      );
    } else {
      logger.success(
        `✓ Found ${totalMappedFiles.toLocaleString()} tracked assets`
      );
    }

    const mappedKeys = new Set<string>();
    for (const asset of Object.values(mapping.mappings)) {
      mappedKeys.add(asset.r2Key);
    }

    const results = compareFiles(r2Keys, mappedKeys);
    displayResults(results);
    return results;
  } catch (error) {
    logger.error('\n❌ Audit failed:', (error as Error).message);
    logger.debug('Stack trace:', error);
    throw error;
  }
}
