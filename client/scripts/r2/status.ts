import { logger } from '../logger.js';
import { createR2Client, getBucketStats, testR2Connection } from './client.js';
import { PATHS, R2_CONFIG, validateEnvironment } from './config.js';
import { getDownloadCacheStats } from './download.js';
import { extractAllUrls, getUrlStats } from './extract-urls.js';
import {
  calculateStats,
  getMigrationProgress,
  loadMapping,
} from './mapping.js';
import { createProgressBar, formatBytes } from './utils.js';

/**
 * Display environment configuration status
 */
async function checkEnvironment(): Promise<boolean> {
  logger.log('\n📋 Environment Configuration\n');

  try {
    validateEnvironment();

    logger.success(`✓ R2_ACCOUNT_ID: ${R2_CONFIG.accountId}`);
    logger.success(`✓ R2_ACCESS_KEY_ID: ***${R2_CONFIG.accessKeyId.slice(-4)}`);
    logger.success('✓ R2_SECRET_ACCESS_KEY: ***');
    logger.success(`✓ R2_BUCKET_NAME: ${R2_CONFIG.bucketName}`);
    logger.success(`✓ R2_PUBLIC_URL: ${R2_CONFIG.publicUrl}`);

    return true;
  } catch (error) {
    logger.error('✗ Environment validation failed');
    logger.warn('\n⚠️  ' + (error as Error).message);
    logger.debug('\nSee R2_SETUP_GUIDE.md for setup instructions.');
    return false;
  }
}

/**
 * Test R2 connection
 */
async function checkR2Connection(): Promise<boolean> {
  logger.log('\n🔌 R2 Connection\n');

  try {
    const client = createR2Client();
    const connected = await testR2Connection(client);

    if (connected) {
      logger.success('✓ Successfully connected to R2');
      logger.debug(`  Bucket: ${R2_CONFIG.bucketName}`);
      return true;
    } else {
      logger.error('✗ Failed to connect to R2');
      return false;
    }
  } catch (error) {
    logger.error('✗ Connection error: ' + (error as Error).message);
    return false;
  }
}

/**
 * Display source data statistics
 */
async function checkSourceData(): Promise<void> {
  logger.log('\n📁 Source Data (Character JSONs)\n');

  try {
    const urls = await extractAllUrls();
    const stats = getUrlStats(urls);

    logger.cyan(`Total unique URLs: ${stats.total.toString()}`);

    logger.log('\nBy file type:');
    for (const [ext, count] of Object.entries(stats.byExtension)) {
      logger.debug(`  ${ext.toUpperCase()}: ${count.toString()}`);
    }
  } catch (error) {
    logger.warn('⚠️  Could not read source data: ' + (error as Error).message);
  }
}

/**
 * Display mapping database status
 */
async function checkMappingDatabase(): Promise<void> {
  logger.log('\n💾 Mapping Database\n');

  try {
    const mapping = await loadMapping();
    const stats = calculateStats(mapping);

    logger.cyan(`Total assets tracked: ${stats.totalAssets.toString()}`);
    logger.cyan(`Total size: ${formatBytes(stats.totalSizeBytes)}`);
    logger.debug(`Last updated: ${mapping.lastUpdated}`);

    logger.log('\nBy category:');
    for (const [category, count] of Object.entries(stats.byCategory)) {
      logger.debug(`  ${category}: ${count.toString()}`);
    }

    const progress = getMigrationProgress(mapping);
    logger.log('\nMigration Progress:');

    const downloadBar = createProgressBar(progress.downloaded, progress.total);
    logger.log(`  Downloaded: ${downloadBar}`);

    const uploadBar = createProgressBar(progress.uploaded, progress.total);
    logger.log(`  Uploaded:   ${uploadBar}`);

    if (progress.remainingDownloads > 0) {
      logger.warn(
        `\n  ⚠️  ${progress.remainingDownloads} assets need downloading`
      );
    }

    if (progress.remainingUploads > 0) {
      logger.warn(`  ⚠️  ${progress.remainingUploads} assets need uploading`);
    }

    if (progress.remainingDownloads === 0 && progress.remainingUploads === 0) {
      logger.success('\n  ✓ All assets migrated!');
    }
  } catch {
    logger.warn('⚠️  No mapping database found (not started yet)');
  }
}

/**
 * Display local download cache status
 */
async function checkDownloadCache(): Promise<void> {
  logger.log('\n💿 Local Download Cache\n');

  try {
    const stats = await getDownloadCacheStats();

    if (stats.totalFiles === 0) {
      logger.debug('No files in download cache');
      return;
    }

    logger.cyan(`Total files: ${stats.totalFiles.toString()}`);
    logger.cyan(`Total size: ${formatBytes(stats.totalSizeBytes)}`);

    logger.log('\nBy category:');
    for (const [category, data] of Object.entries(stats.byCategory)) {
      logger.log(
        `  ${category}: ${data.count} files (${formatBytes(data.sizeBytes)})`
      );
    }

    logger.debug(`\nLocation: ${PATHS.downloadsDir}`);
  } catch {
    logger.debug('No download cache found');
  }
}

/**
 * Display R2 bucket status
 */
async function checkR2Bucket(): Promise<void> {
  logger.log('\n☁️  R2 Bucket Status\n');

  try {
    const client = createR2Client();
    const stats = await getBucketStats(client);

    logger.cyan(`Total objects: ${stats.totalObjects.toString()}`);
    logger.cyan(`Total size: ${formatBytes(stats.totalSize)}`);

    const freeStorageGB = 10;
    const usedGB = stats.totalSize / (1024 * 1024 * 1024);
    const percentUsed = (usedGB / freeStorageGB) * 100;

    logger.log('\nFree Tier Usage:');
    logger.log(
      `  Storage: ${usedGB.toFixed(2)} GB / ${freeStorageGB} GB (${percentUsed.toFixed(1)}%)`
    );

    if (percentUsed > 80) {
      logger.warn('  ⚠️  Approaching free tier limit');
    } else {
      logger.success('  ✓ Within free tier limits');
    }
  } catch (error) {
    logger.warn(
      '⚠️  Could not fetch bucket stats: ' + (error as Error).message
    );
  }
}

/**
 * Display next steps based on current status
 */
async function showNextSteps(): Promise<void> {
  logger.log('\n📝 Next Steps\n');

  try {
    const mapping = await loadMapping();
    const progress = getMigrationProgress(mapping);

    if (progress.total === 0) {
      logger.log('1. Extract URLs and download assets:');
      logger.cyan('   npm run r2:download\n');
    } else if (progress.remainingDownloads > 0) {
      logger.log('1. Continue downloading assets:');
      logger.cyan('   npm run r2:download\n');
    } else if (progress.remainingUploads > 0) {
      logger.log('1. Upload assets to R2:');
      logger.cyan('   npm run r2:upload\n');
    } else {
      logger.log('1. Update character JSONs with R2 URLs:');
      logger.cyan('   npm run r2:update\n');
      logger.log('2. Verify everything works:');
      logger.cyan('   npm run r2:verify\n');
    }
  } catch {
    logger.log('1. Start the migration:');
    logger.cyan('   npm run r2:migrate\n');
  }
}

/**
 * Main status check function
 */
export async function showStatus(): Promise<void> {
  const envOk = await checkEnvironment();

  if (!envOk) {
    logger.warn(
      '\n⚠️  Please configure environment variables before proceeding.\n'
    );
    return;
  }

  const connectionOk = await checkR2Connection();
  await checkSourceData();
  await checkMappingDatabase();
  await checkDownloadCache();

  if (connectionOk) {
    await checkR2Bucket();
  }

  await showNextSteps();
}
