#!/usr/bin/env node

/**
 * R2 Asset Migration CLI
 *
 * Main orchestrator for managing Genshin Impact asset migration to Cloudflare R2
 *
 * Commands:
 *   status       - Show migration status
 *   download     - Download assets from Wikia
 *   upload       - Upload assets to R2
 *   update       - Update character JSONs with R2 URLs
 *   migrate      - Run full migration (download + upload + update)
 *   verify       - Verify uploaded assets
 *   sync         - Sync new assets (post-scraping)
 *   sync-r2      - Sync mapping database with R2 state
 *   clean        - Clean download cache
 */

import https from 'node:https';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import chalk from 'chalk';

import { auditR2 } from './audit.js';
import { clearDownloadCache, downloadAssets } from './download.js';
import { extractAllUrls } from './extract-urls.js';
import { fixFileMismatches } from './fix-file-types.js';
import { loadMapping } from './mapping.js';
import { showStatus } from './status.js';
import { syncMappingWithR2 } from './sync.js';
import { restoreFromBackup, updateCharacterJsons } from './update-json.js';
import { retryFailedUploads, uploadAssets, verifyUploads } from './upload.js';
import { hashUrl } from './utils.ts';

/**
 * Check internet connectivity
 */
async function checkInternetConnection(): Promise<boolean> {
  return new Promise((resolve) => {
    const req = https.get('https://www.cloudflare.com', (res) => {
      resolve(res.statusCode === 200);
    });

    req.on('error', () => {
      resolve(false);
    });

    req.setTimeout(5000, () => {
      req.destroy();
      resolve(false);
    });
  });
}

/**
 * Run full migration process
 */
async function runFullMigration(): Promise<void> {
  console.log(chalk.bold.cyan('\n╔══════════════════════════════════════╗'));
  console.log(chalk.bold.cyan('║     R2 Full Migration Process        ║'));
  console.log(chalk.bold.cyan('╚══════════════════════════════════════╝\n'));

  try {
    console.log(chalk.bold('\n📥 Step 1/3: Download Assets\n'));
    const urls = await extractAllUrls();
    await downloadAssets(urls);

    // Step 2: Upload to R2
    console.log(chalk.bold('\n☁️  Step 2/3: Upload to R2\n'));
    await uploadAssets();

    // Step 3: Update JSONs
    console.log(chalk.bold('\n📝 Step 3/3: Update Character JSONs\n'));
    await updateCharacterJsons(true);

    console.log(chalk.bold.green('\n✨ Migration Complete!\n'));
    console.log(
      chalk.dim('Run ') +
        chalk.cyan('npm run r2:verify') +
        chalk.dim(' to verify uploads.')
    );
  } catch (error) {
    console.error(chalk.red('\n❌ Migration failed:'), error);
    process.exit(1);
  }
}

/**
 * Sync new assets (for re-scraping workflow)
 */
async function syncNewAssets(): Promise<void> {
  console.log(chalk.bold('\n🔄 Syncing New Assets\n'));

  try {
    const allUrls = await extractAllUrls();
    const mapping = await loadMapping();

    const newUrls = Array.from(allUrls).filter((url) => {
      const hash = hashUrl(url);
      return !mapping.mappings[hash];
    });

    if (newUrls.length === 0) {
      console.log(
        chalk.green('✓ No new assets detected. Everything is up to date!')
      );
      return;
    }

    console.log(chalk.yellow(`Found ${newUrls.length} new assets\n`));

    console.log(chalk.bold('Downloading new assets...'));
    await downloadAssets(newUrls);

    console.log(chalk.bold('\nUploading new assets...'));
    await uploadAssets();

    console.log(chalk.bold('\nUpdating character JSONs...'));
    await updateCharacterJsons(true);

    console.log(chalk.green('\n✓ Sync complete!'));
  } catch (error) {
    console.error(chalk.red('\n❌ Sync failed:'), error);
    process.exit(1);
  }
}

/**
 * Main CLI entry point
 */
async function main(): Promise<void> {
  const command = process.argv[2];
  console.log(chalk.dim('Checking internet connection...'));
  const isConnected = await checkInternetConnection();

  if (isConnected) {
    console.log(chalk.green('✓ Internet connection available\n'));
  } else {
    console.log(chalk.red('✗ No internet connection detected'));
    return;
  }

  try {
    switch (command) {
      case 'status':
        await showStatus();
        break;

      case 'download': {
        console.log(chalk.bold('\n📥 Download Phase\n'));
        const urls = await extractAllUrls();
        await downloadAssets(urls);
        break;
      }

      case 'upload':
        console.log(chalk.bold('\n☁️  Upload Phase\n'));
        await uploadAssets();
        break;

      case 'update':
        console.log(chalk.bold('\n📝 Update Phase\n'));
        await updateCharacterJsons(true);
        break;

      case 'migrate':
      case 'all':
        await runFullMigration();
        break;

      case 'verify':
        console.log(chalk.bold('\n🔍 Verifying Uploads\n'));
        await verifyUploads();
        break;

      case 'sync':
        await syncNewAssets();
        break;

      case 'sync-r2':
      case 'sync-db':
      case 'reconcile':
        console.log(chalk.bold('\n🔄 Syncing Database with R2\n'));
        await syncMappingWithR2();
        break;

      case 'audit':
        console.log(chalk.bold('\n🔍 R2 Storage Audit\n'));
        await auditR2();
        break;

      case 'retry-up':
      case 'retry-upload':
        await retryFailedUploads();
        break;

      case 'clean':
        console.log(chalk.bold('\n🧹 Cleaning Download Cache\n'));
        await clearDownloadCache();
        console.log(chalk.green('✓ Cache cleared'));
        break;

      case 'restore': {
        const timestamp = process.argv[3];
        await restoreFromBackup(timestamp);
        break;
      }

      case 'fix':
      case 'fix-types':
        console.log(chalk.bold('\n🔧 Fixing File Type Mismatches\n'));
        await fixFileMismatches();
        break;

      default:
        if (!command) {
          await showStatus();
        } else {
          console.log(chalk.red(`\nUnknown command: ${command}\n`));
          process.exit(1);
        }
    }
  } catch (error) {
    console.error(chalk.red('\n❌ Error:'), error);
    process.exit(1);
  }
}

const currentFile = fileURLToPath(import.meta.url);
const argv1File = path.resolve(process.argv[1] || '');

if (currentFile === argv1File) {
  main().catch((error) => {
    console.error(chalk.red('\n❌ Fatal error:'), error);
    process.exit(1);
  });
}
