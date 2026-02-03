import fs from 'node:fs/promises';
import path from 'node:path';

import { logger } from '../logger.js';
import { type AssetCategory, PATHS } from './config.js';
import { formatTimestamp } from './utils.js';

/**
 * Asset mapping entry
 */
export interface AssetMapping {
  /** Original Wikia URL */
  originalUrl: string;

  /** R2 object key (e.g., 'icons/7f8a9b2c.png') */
  r2Key: string;

  /** Public R2 URL */
  r2Url: string;

  /** Asset category */
  category: AssetCategory;

  /** File extension */
  extension: string;

  /** File size in bytes */
  size: number;

  /** Timestamp when downloaded */
  downloadedAt?: string;

  /** Timestamp when uploaded to R2 */
  uploadedAt?: string;
}

/**
 * URL mapping database structure
 */
export interface MappingDatabase {
  /** Database version */
  version: string;

  /** Last update timestamp */
  lastUpdated: string;

  /** Hash to asset mapping */
  mappings: Record<string, AssetMapping>;

  /** Statistics */
  stats: {
    /** Total number of assets */
    totalAssets: number;

    /** Total size in bytes */
    totalSizeBytes: number;

    /** Assets by category */
    byCategory: Partial<Record<AssetCategory, number>>;
  };
}

/**
 * Initialize empty mapping database
 */
export function createEmptyMapping(): MappingDatabase {
  return {
    version: '1.0.0',
    lastUpdated: formatTimestamp(),
    mappings: {},
    stats: {
      totalAssets: 0,
      totalSizeBytes: 0,
      byCategory: {},
    },
  };
}

/**
 * Load mapping database from file
 * Creates a new database if file doesn't exist
 *
 * @returns Mapping database
 */
export async function loadMapping(): Promise<MappingDatabase> {
  try {
    const content = await fs.readFile(PATHS.mappingFile, 'utf-8');
    const mapping = JSON.parse(content) as MappingDatabase;

    if (!mapping.version || !mapping.mappings) {
      logger.warn('Invalid mapping file structure, creating new database');
      return createEmptyMapping();
    }

    return mapping;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      logger.log('No existing mapping file, creating new database');
      return createEmptyMapping();
    }

    logger.error('Error loading mapping file:', error);
    throw error;
  }
}

/**
 * Save mapping database to file
 *
 * @param mapping - Mapping database to save
 */
export async function saveMapping(mapping: MappingDatabase): Promise<void> {
  mapping.lastUpdated = formatTimestamp();
  mapping.stats = calculateStats(mapping);

  const dir = path.dirname(PATHS.mappingFile);
  await fs.mkdir(dir, { recursive: true });

  const content = JSON.stringify({ ...mapping }, null, 2);
  await fs.writeFile(PATHS.mappingFile, content, 'utf-8');
}

/**
 * Calculate statistics from mapping database
 *
 * @param mapping - Mapping database
 * @returns Calculated statistics
 */
export function calculateStats(
  mapping: MappingDatabase
): MappingDatabase['stats'] {
  const entries = Object.values(mapping.mappings);

  const byCategory: Partial<Record<AssetCategory, number>> = {};
  let totalSizeBytes = 0;

  for (const entry of entries) {
    byCategory[entry.category] = (byCategory[entry.category] || 0) + 1;
    totalSizeBytes += entry.size || 0;
  }

  return {
    totalAssets: entries.length,
    totalSizeBytes,
    byCategory,
  };
}

/**
 * Add or update asset mapping
 *
 * @param mapping - Mapping database
 * @param hash - URL hash
 * @param asset - Asset data
 */
export function upsertAsset(
  mapping: MappingDatabase,
  hash: string,
  asset: AssetMapping
): void {
  mapping.mappings[hash] = asset;
}

/**
 * Get asset mapping by hash
 *
 * @param mapping - Mapping database
 * @param hash - URL hash
 * @returns Asset mapping or undefined
 */
export function getAsset(
  mapping: MappingDatabase,
  hash: string
): AssetMapping | undefined {
  return mapping.mappings[hash];
}

/**
 * Get all assets
 *
 * @param mapping - Mapping database
 * @returns Array of [hash, asset] tuples
 */
export function getAllAssets(
  mapping: MappingDatabase
): Array<[string, AssetMapping]> {
  return Object.entries(mapping.mappings);
}

/**
 * Get assets that need uploading
 * (assets with downloadedAt but without uploadedAt)
 *
 * @param mapping - Mapping database
 * @returns Array of [hash, asset] tuples
 */
export function getAssetsToUpload(
  mapping: MappingDatabase
): Array<[string, AssetMapping]> {
  return getAllAssets(mapping).filter(
    ([, asset]) => asset.downloadedAt && !asset.uploadedAt
  );
}

/**
 * Get migration progress summary
 *
 * @param mapping - Mapping database
 * @returns Progress summary
 */
export function getMigrationProgress(mapping: MappingDatabase) {
  const total = mapping.stats.totalAssets;
  const downloaded = getAllAssets(mapping).filter(
    ([, asset]) => asset.downloadedAt
  ).length;
  const uploaded = getAllAssets(mapping).filter(
    ([, asset]) => asset.uploadedAt
  ).length;

  return {
    total,
    downloaded,
    uploaded,
    downloadProgress: total > 0 ? (downloaded / total) * 100 : 0,
    uploadProgress: total > 0 ? (uploaded / total) * 100 : 0,
    remainingDownloads: total - downloaded,
    remainingUploads: downloaded - uploaded,
  };
}
