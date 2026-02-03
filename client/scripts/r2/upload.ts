import { S3Client } from '@aws-sdk/client-s3';

import { logger } from '../logger.js';
import { createR2Client, objectExists, uploadToR2 } from './client.js';
import { getContentType, MIGRATION_CONFIG, R2_CONFIG } from './config.js';
import { existsInLocal, readFromLocal } from './download.js';
import {
  type AssetMapping,
  getAllAssets,
  getAssetsToUpload,
  loadMapping,
  saveMapping,
  uploadMappingToR2,
} from './mapping.js';
import { createProgressBar, formatTimestamp } from './utils.js';

/**
 * Upload a single asset to R2
 *
 * @param hash - URL hash
 * @param asset - Asset mapping
 * @param client - S3 client
 * @returns Updated asset mapping
 */
async function uploadAsset(
  hash: string,
  asset: AssetMapping,
  client: S3Client
): Promise<void> {
  const generateR2Url = (r2Key: string, publicUrl: string) => {
    const baseUrl = publicUrl.endsWith('/')
      ? publicUrl.slice(0, -1)
      : publicUrl;
    return `${baseUrl}/${r2Key}`;
  };

  const r2Key = `${asset.category}/${hash}.${asset.extension}`;

  if (asset.uploadedAt && (await objectExists(client, r2Key))) {
    logger.debug(`Already in R2: ${r2Key}`);
    return;
  }

  const existsLocally = await existsInLocal(
    asset.category,
    hash,
    asset.extension
  );

  if (!existsLocally) {
    throw new Error(
      `Local file not found for ${asset.originalUrl}. Run download first.`
    );
  }

  const buffer = await readFromLocal(asset.category, hash, asset.extension);
  const contentType = getContentType(asset.extension);
  await uploadToR2(client, r2Key, buffer, contentType);

  asset.r2Key = r2Key;
  asset.r2Url = generateR2Url(r2Key, R2_CONFIG.publicUrl);
  asset.uploadedAt = formatTimestamp();
}

/**
 * Upload all downloaded assets to R2
 */
export async function uploadAssets(): Promise<void> {
  logger.log('\n=== Starting Upload Phase ===\n');

  const client = createR2Client();
  const mapping = await loadMapping();

  const showDownloadHelp = () => {
    logger.success('No assets to upload. All assets already in R2!');
    const allAssets = getAllAssets(mapping);
    const needsDownload = allAssets.filter(([, asset]) => !asset.downloadedAt);

    if (needsDownload.length > 0) {
      logger.log(
        `\nNote: ${needsDownload.length} assets need to be downloaded first.`
      );
      logger.cyan('Run: npm run r2:download');
    }
  };

  const toUpload = getAssetsToUpload(mapping);
  if (toUpload.length === 0) {
    return showDownloadHelp();
  }

  logger.log(`Assets to upload: ${toUpload.length}\n`);

  const batchSize = MIGRATION_CONFIG.concurrentUploads;
  let completed = 0;
  let failed = 0;
  const failures: Array<{ url: string; error: string }> = [];

  for (let i = 0; i < toUpload.length; i += batchSize) {
    const batch = toUpload.slice(i, i + batchSize);

    const results = await Promise.allSettled(
      batch.map(([hash, asset]) => uploadAsset(hash, asset, client))
    );

    for (let j = 0; j < results.length; j++) {
      const result = results[j];
      const [, asset] = batch[j];

      if (result.status === 'fulfilled') {
        completed++;
      } else {
        failed++;
        failures.push({
          url: asset.originalUrl,
          error: result.reason.message,
        });
        logger.error(`Failed: ${asset.originalUrl} - ${result.reason.message}`);
      }
    }

    await saveMapping(mapping);
    const progress = createProgressBar(completed + failed, toUpload.length);
    logger.log(`Progress: ${progress}`);
  }

  logger.log('\n=== Upload Complete ===\n');
  logger.success(`Successfully uploaded: ${completed}`);
  logger.error(`Failed: ${failed}`);

  if (failures.length > 0) {
    logger.log('\nFailed uploads:');
    for (const failure of failures.slice(0, 10)) {
      logger.log(`  - ${failure.url}`);
      logger.debug(`    Error: ${failure.error}`);
    }

    if (failures.length > 10) {
      logger.log(`  ... and ${failures.length - 10} more`);
    }
  }

  // Save final mapping
  await saveMapping(mapping);

  // Upload url-mapping.json to R2
  await uploadMappingToR2(client);
}

/**
 * Re-upload failed assets
 */
export async function retryFailedUploads(): Promise<void> {
  logger.log('Checking for failed uploads...\n');

  const mapping = await loadMapping();
  const failed = getAssetsToUpload(mapping);

  if (failed.length === 0) {
    logger.success('No failed uploads found.');
    const client = createR2Client();
    await uploadMappingToR2(client);
    return;
  }

  logger.log(`Found ${failed.length} failed uploads. Retrying...\n`);
  await uploadAssets();
}

/**
 * Verify uploaded assets exist in R2
 */
export async function verifyUploads(): Promise<{
  verified: number;
  missing: number;
  missingAssets: string[];
}> {
  logger.log('\nVerifying uploads in R2...\n');

  const client = createR2Client();
  const mapping = await loadMapping();

  const uploadedAssets = getAllAssets(mapping).filter(
    ([, asset]) => asset.uploadedAt
  );

  logger.log(`Checking ${uploadedAssets.length} uploaded assets...\n`);

  let verified = 0;
  let missing = 0;
  const missingAssets: string[] = [];

  const batchSize = MIGRATION_CONFIG.concurrentUploads;

  const updateProgress = (
    results: PromiseSettledResult<boolean>[],
    batch: [string, AssetMapping][],
    startIndex: number
  ) => {
    for (let j = 0; j < results.length; j++) {
      const result = results[j];
      const [, asset] = batch[j];

      if (result.status === 'fulfilled' && result.value) {
        verified++;
      } else if (result.status === 'fulfilled' && !result.value) {
        missing++;
        missingAssets.push(asset.r2Key);
        logger.warn(`Missing in R2: ${asset.r2Key}`);
      } else if (result.status === 'rejected') {
        missing++;
        missingAssets.push(asset.r2Key);
        logger.error(`Error checking ${asset.r2Key}: ${result.reason}`);
      }
    }

    if (
      (verified + missing) % (batchSize * 5) === 0 ||
      startIndex + batchSize >= uploadedAssets.length
    ) {
      const progress = createProgressBar(
        verified + missing,
        uploadedAssets.length
      );
      logger.log(progress);
    }
  };

  for (let i = 0; i < uploadedAssets.length; i += batchSize) {
    const batch = uploadedAssets.slice(i, i + batchSize);
    const results = await Promise.allSettled(
      batch.map(([, asset]) => objectExists(client, asset.r2Key))
    );

    updateProgress(results, batch, i);
  }

  logger.log(`\n=== Verification Complete ===\n`);
  logger.success(`Verified: ${verified}`);
  logger.warn(`Missing: ${missing}`);

  if (missing > 0) {
    logger.log('\nMissing assets (first 10):');
    for (const key of missingAssets.slice(0, 10)) {
      logger.log(`  - ${key}`);
    }

    if (missingAssets.length > 10) {
      logger.log(`  ... and ${missingAssets.length - 10} more`);
    }
  }

  return { verified, missing, missingAssets };
}

/**
 * Force re-upload specific assets (even if already uploaded)
 *
 * @param hashes - Array of URL hashes to force re-upload
 */
export async function forceReupload(hashes: string[]): Promise<void> {
  logger.log(`\nForce re-uploading ${hashes.length} assets...\n`);

  const client = createR2Client();
  const mapping = await loadMapping();

  for (const hash of hashes) {
    const asset = mapping.mappings[hash];

    if (!asset) {
      logger.warn(`Asset not found: ${hash}`);
      continue;
    }

    delete asset.uploadedAt;

    try {
      await uploadAsset(hash, asset, client);
      logger.success(`Re-uploaded: ${asset.r2Key}`);
    } catch (error) {
      logger.error(`Failed to re-upload ${hash}:`, error);
    }
  }

  await saveMapping(mapping);

  await uploadMappingToR2(client);
}
