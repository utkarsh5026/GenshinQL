import { S3Client } from '@aws-sdk/client-s3';

import { createR2Client, objectExists, uploadToR2 } from './client.js';
import {
  type AssetCategory,
  getContentType,
  MIGRATION_CONFIG,
  R2_CONFIG,
} from './config.js';
import { existsInLocal, readFromLocal } from './download.js';
import {
  type AssetMapping,
  getAllAssets,
  getAssetsToUpload,
  loadMapping,
  saveMapping,
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
  const generateR2Key = (
    hash: string,
    category: AssetCategory,
    extension: string
  ) => `${category}/${hash}.${extension}`;

  const generateR2Url = (r2Key: string, publicUrl: string) => {
    const baseUrl = publicUrl.endsWith('/')
      ? publicUrl.slice(0, -1)
      : publicUrl;
    return `${baseUrl}/${r2Key}`;
  };

  const r2Key = generateR2Key(hash, asset.category, asset.extension);

  // Check if already uploaded to R2
  if (asset.uploadedAt && (await objectExists(client, r2Key))) {
    console.log(`Already in R2: ${r2Key}`);
    return;
  }

  // Check if file exists locally
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

  // Read from local cache
  const buffer = await readFromLocal(asset.category, hash, asset.extension);

  // Get content type
  const contentType = getContentType(asset.extension);

  // Upload to R2
  await uploadToR2(client, r2Key, buffer, contentType);

  // Update asset mapping
  asset.r2Key = r2Key;
  asset.r2Url = generateR2Url(r2Key, R2_CONFIG.publicUrl);
  asset.uploadedAt = formatTimestamp();
}

/**
 * Upload all downloaded assets to R2
 */
export async function uploadAssets(): Promise<void> {
  console.log('\n=== Starting Upload Phase ===\n');

  // Create R2 client
  const client = createR2Client();

  // Load mapping
  const mapping = await loadMapping();

  // Get assets that need uploading
  const toUpload = getAssetsToUpload(mapping);

  if (toUpload.length === 0) {
    console.log('No assets to upload. All assets already in R2!');

    // Check if there are assets that need downloading first
    const allAssets = getAllAssets(mapping);
    const needsDownload = allAssets.filter(([, asset]) => !asset.downloadedAt);

    if (needsDownload.length > 0) {
      console.log(
        `\nNote: ${needsDownload.length} assets need to be downloaded first.`
      );
      console.log('Run: npm run r2:download');
    }

    return;
  }

  console.log(`Assets to upload: ${toUpload.length}\n`);

  // Upload in batches to control concurrency
  const batchSize = MIGRATION_CONFIG.concurrentUploads;
  let completed = 0;
  let failed = 0;
  const failures: Array<{ url: string; error: string }> = [];

  for (let i = 0; i < toUpload.length; i += batchSize) {
    const batch = toUpload.slice(i, i + batchSize);

    // Upload batch concurrently
    const results = await Promise.allSettled(
      batch.map(([hash, asset]) => uploadAsset(hash, asset, client))
    );

    // Process results
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
        console.error(
          `Failed: ${asset.originalUrl} - ${result.reason.message}`
        );
      }
    }

    // Save progress after each batch
    await saveMapping(mapping);

    // Show progress
    const progress = createProgressBar(completed + failed, toUpload.length);
    console.log(`Progress: ${progress}`);
  }

  console.log('\n=== Upload Complete ===\n');
  console.log(`Successfully uploaded: ${completed}`);
  console.log(`Failed: ${failed}`);

  if (failures.length > 0) {
    console.log('\nFailed uploads:');
    for (const failure of failures.slice(0, 10)) {
      console.log(`  - ${failure.url}`);
      console.log(`    Error: ${failure.error}`);
    }

    if (failures.length > 10) {
      console.log(`  ... and ${failures.length - 10} more`);
    }
  }

  // Save final mapping
  await saveMapping(mapping);
}

/**
 * Re-upload failed assets
 */
export async function retryFailedUploads(): Promise<void> {
  console.log('Checking for failed uploads...\n');

  const mapping = await loadMapping();
  const failed = getAssetsToUpload(mapping);

  if (failed.length === 0) {
    console.log('No failed uploads found.');
    return;
  }

  console.log(`Found ${failed.length} failed uploads. Retrying...\n`);
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
  console.log('\nVerifying uploads in R2...\n');

  const client = createR2Client();
  const mapping = await loadMapping();

  const uploadedAssets = getAllAssets(mapping).filter(
    ([, asset]) => asset.uploadedAt
  );

  console.log(`Checking ${uploadedAssets.length} uploaded assets...\n`);

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
        console.warn(`Missing in R2: ${asset.r2Key}`);
      } else if (result.status === 'rejected') {
        missing++;
        missingAssets.push(asset.r2Key);
        console.error(`Error checking ${asset.r2Key}: ${result.reason}`);
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
      console.log(progress);
    }
  };

  for (let i = 0; i < uploadedAssets.length; i += batchSize) {
    const batch = uploadedAssets.slice(i, i + batchSize);
    const results = await Promise.allSettled(
      batch.map(([, asset]) => objectExists(client, asset.r2Key))
    );

    updateProgress(results, batch, i);
  }

  console.log(`\n=== Verification Complete ===\n`);
  console.log(`Verified: ${verified}`);
  console.log(`Missing: ${missing}`);

  if (missing > 0) {
    console.log('\nMissing assets (first 10):');
    for (const key of missingAssets.slice(0, 10)) {
      console.log(`  - ${key}`);
    }

    if (missingAssets.length > 10) {
      console.log(`  ... and ${missingAssets.length - 10} more`);
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
  console.log(`\nForce re-uploading ${hashes.length} assets...\n`);

  const client = createR2Client();
  const mapping = await loadMapping();

  for (const hash of hashes) {
    const asset = mapping.mappings[hash];

    if (!asset) {
      console.warn(`Asset not found: ${hash}`);
      continue;
    }

    delete asset.uploadedAt;

    try {
      await uploadAsset(hash, asset, client);
      console.log(`Re-uploaded: ${asset.r2Key}`);
    } catch (error) {
      console.error(`Failed to re-upload ${hash}:`, error);
    }
  }

  await saveMapping(mapping);
}
