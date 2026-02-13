import { cpus } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * R2 Configuration with environment validation
 */
export const R2_CONFIG = {
  accountId: process.env.R2_ACCOUNT_ID || '',
  accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
  secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
  bucketName: process.env.R2_BUCKET_NAME || 'genshin-assets',
  publicUrl: process.env.R2_PUBLIC_URL || '',
  region: 'auto', // R2 uses 'auto' for region
} as const;

/**
 * Paths configuration
 */
export const PATHS = {
  // Base public directory for path resolution
  publicDir: path.resolve(__dirname, '../../public'),

  // Character JSON files directory
  charactersDir: path.resolve(__dirname, '../../public/characters'),

  // Download cache directory
  downloadsDir: path.resolve(__dirname, '../../downloads'),

  // Backup directory for original JSONs
  backupsDir: path.resolve(__dirname, '../../public/backups'),

  // URL mapping database
  mappingFile: path.resolve(__dirname, './url-mapping.json'),

  // Root scripts directory
  scriptsDir: path.resolve(__dirname, '..'),

  // Local assets directory (flat structure in public)
  assetsDir: path.resolve(__dirname, '../../public/assets'),
} as const;

/**
 * Asset categories for bucket organization
 */
export const ASSET_CATEGORIES = [
  'icons',
  'talents',
  'videos',
  'stickers',
  'misc',
] as const;

export type AssetCategory = (typeof ASSET_CATEGORIES)[number];

/**
 * Download and upload configuration
 * Concurrent operations are set based on available CPU cores
 */
const CPU_COUNT = cpus().length;

export const MIGRATION_CONFIG = {
  concurrentDownloads: CPU_COUNT,
  concurrentUploads: CPU_COUNT,
  maxRetries: 3,
  retryDelayMs: 1000,
  retryBackoffMultiplier: 2,
  rateLimitWaitMs: 5000,
  hashLength: 16,
} as const;

/**
 * Validates that all required environment variables are set
 * @throws Error if validation fails
 */
export function validateEnvironment(): void {
  const missing: string[] = [];

  if (!R2_CONFIG.accountId) missing.push('R2_ACCOUNT_ID');
  if (!R2_CONFIG.accessKeyId) missing.push('R2_ACCESS_KEY_ID');
  if (!R2_CONFIG.secretAccessKey) missing.push('R2_SECRET_ACCESS_KEY');
  if (!R2_CONFIG.publicUrl) missing.push('R2_PUBLIC_URL');

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}\n` +
        'Please check your .env file and ensure all R2 credentials are set.\n'
    );
  }

  try {
    new URL(R2_CONFIG.publicUrl);
  } catch {
    throw new Error(
      `Invalid R2_PUBLIC_URL: ${R2_CONFIG.publicUrl}\n` +
        'Must be a valid URL (e.g., https://pub-xxxxx.r2.dev)'
    );
  }
}

/**
 * Content type mapping for common extensions
 */
export const CONTENT_TYPES: Record<string, string> = {
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  gif: 'image/gif',
  mp4: 'video/mp4',
  webp: 'image/webp',
  svg: 'image/svg+xml',
} as const;

/**
 * Get content type for a file extension
 */
export function getContentType(extension: string): string {
  return CONTENT_TYPES[extension.toLowerCase()] || 'application/octet-stream';
}
