import { S3Client } from '@aws-sdk/client-s3';

import { logger } from '../logger.js';
import { createR2Client, objectExists } from './client.js';
import { MIGRATION_CONFIG } from './config.js';
import {
  type AssetMapping,
  getAllAssets,
  loadMapping,
  MappingDatabase,
  saveMapping,
  uploadMappingToR2,
} from './mapping.js';
import { createProgressBar } from './utils.js';

/**
 * Sync result statistics
 */
interface SyncResult {
  /** Total assets checked */
  totalChecked: number;

  /** Assets that were marked as uploaded but missing in R2 */
  missingInR2: number;

  /** Assets that were fixed (upload status cleared) */
  fixed: number;

  /** Assets that are correctly in R2 */
  verified: number;

  /** List of r2Keys that were fixed */
  fixedKeys: string[];
}

/**
 * Synchronize url-mapping.json with actual R2 state
 * This checks all assets marked as "uploaded" in the mapping database
 * and clears their upload status if they don't actually exist in R2
 *
 * @returns Sync statistics
 */
export async function syncMappingWithR2(): Promise<SyncResult> {
  logger.log('\n=== Syncing Mapping Database with R2 ===\n');

  const client = createR2Client();
  const mapping = await loadMapping();

  const uploadedAssets = getAllAssets(mapping).filter(
    ([, asset]) => asset.uploadedAt && asset.r2Key
  );

  const result: SyncResult = {
    totalChecked: 0,
    missingInR2: 0,
    fixed: 0,
    verified: 0,
    fixedKeys: [],
  };

  if (uploadedAssets.length === 0) {
    logger.log('No assets marked as uploaded. Nothing to sync.');
    return result;
  }

  logger.log(
    `Checking ${uploadedAssets.length} assets marked as uploaded...\n`
  );

  const batchSize = MIGRATION_CONFIG.concurrentUploads;

  for (let i = 0; i < uploadedAssets.length; i += batchSize) {
    const batch = uploadedAssets.slice(i, i + batchSize);
    const results = await Promise.allSettled(
      batch.map(([hash, asset]) => {
        return checkAndFixAsset(hash, asset, client, mapping);
      })
    );

    for (let j = 0; j < results.length; j++) {
      const checkResult = results[j];
      const [, asset] = batch[j];

      if (checkResult.status === 'fulfilled') {
        const { existsInR2, fixed, originalKey } = checkResult.value;

        result.totalChecked++;

        if (existsInR2) {
          result.verified++;
        } else {
          result.missingInR2++;

          if (fixed && originalKey) {
            result.fixed++;
            result.fixedKeys.push(originalKey);
            logger.warn(
              `Fixed: ${originalKey} (was marked as uploaded but missing in R2)`
            );
          }
        }
      } else {
        logger.error(
          `Error checking asset ${asset.r2Key}: ${checkResult.reason.message}`
        );
      }
    }

    const progress = createProgressBar(
      result.totalChecked,
      uploadedAssets.length
    );
    logger.log(
      `${progress} - ${result.verified} verified, ${result.fixed} fixed\n`
    );

    if (result.fixed > 0) {
      await saveMapping(mapping);
    }
  }

  await saveMapping(mapping);
  logger.log('\n📤 Uploading updated mapping to R2...');
  await uploadMappingToR2(client);

  logger.log('\n=== Sync Complete ===\n');
  logger.success(`Total assets checked: ${result.totalChecked}`);
  logger.success(`Verified (exist in R2): ${result.verified}`);
  logger.warn(`Missing in R2: ${result.missingInR2}`);
  logger.info(`Fixed (upload status cleared): ${result.fixed}`);

  if (result.fixed > 0) {
    logger.log(
      `\n✓ ${result.fixed} assets will be re-uploaded on next upload run.`
    );
  }

  if (result.fixedKeys.length > 0 && result.fixedKeys.length <= 20) {
    logger.log('\nFixed assets:');
    for (const key of result.fixedKeys) {
      logger.log(`  - ${key}`);
    }
  } else if (result.fixedKeys.length > 20) {
    logger.log('\nFixed assets (first 20):');
    for (const key of result.fixedKeys.slice(0, 20)) {
      logger.log(`  - ${key}`);
    }
    logger.log(`  ... and ${result.fixedKeys.length - 20} more`);
  }

  return result;
}

/**
 * Check if an asset exists in R2 and fix the mapping if it doesn't
 *
 * @param hash - Asset hash
 * @param asset - Asset mapping
 * @param client - S3 client
 * @param mapping - Mapping database
 * @returns Check result
 */
async function checkAndFixAsset(
  hash: string,
  asset: AssetMapping,
  client: S3Client,
  mapping: MappingDatabase
): Promise<{ existsInR2: boolean; fixed: boolean; originalKey?: string }> {
  if (!asset.r2Key) {
    return { existsInR2: false, fixed: false };
  }

  const originalKey = asset.r2Key;
  const existsInR2 = await objectExists(client, asset.r2Key);

  if (!existsInR2) {
    delete asset.uploadedAt;
    delete asset.r2Key;
    delete asset.r2Url;

    mapping.mappings[hash] = asset;
    return { existsInR2: false, fixed: true, originalKey };
  }

  return { existsInR2: true, fixed: false, originalKey };
}
