import crypto from 'node:crypto';
import path from 'node:path';

import { type AssetCategory, MIGRATION_CONFIG } from './config.js';

/**
 * Generate a deterministic hash from a URL
 * Uses SHA-256 and truncates to 16 characters (64-bit)
 *
 * @param url - The URL to hash
 * @returns 16-character hex hash
 */
export function hashUrl(url: string): string {
  return crypto
    .createHash('sha256')
    .update(url)
    .digest('hex')
    .substring(0, MIGRATION_CONFIG.hashLength);
}

/**
 * Categorize a URL based on its path and content
 *
 * @param url - The URL to categorize
 * @returns Asset category (icons, talents, videos, stickers, misc)
 */
export function categorizeUrl(url: string): AssetCategory {
  const urlLower = url.toLowerCase();

  if (
    urlLower.includes('_icon') ||
    urlLower.includes('element_') ||
    urlLower.includes('weapon-class') ||
    urlLower.includes('_emblem')
  ) {
    return 'icons';
  }

  if (
    urlLower.includes('talent') ||
    urlLower.includes('normal_attack') ||
    urlLower.includes('elemental_skill') ||
    urlLower.includes('elemental_burst') ||
    urlLower.includes('passive') ||
    urlLower.includes('constellation')
  ) {
    return 'talents';
  }

  if (urlLower.endsWith('.mp4') || urlLower.includes('video')) {
    return 'videos';
  }

  if (
    urlLower.includes('emoji') ||
    urlLower.includes('sticker') ||
    urlLower.includes('expression')
  ) {
    return 'stickers';
  }

  return 'misc';
}

/**
 * Extract file extension from a URL
 *
 * @param url - The URL to extract extension from
 * @returns File extension without the dot (e.g., 'png', 'gif', 'mp4')
 */
export function extractExtension(url: string): string {
  const cleanUrl = url.split('?')[0].split('#')[0];
  const ext = path.extname(cleanUrl).toLowerCase();
  return ext.startsWith('.') ? ext.substring(1) : ext || 'png';
}

/**
 * Format bytes to human-readable string
 *
 * @param bytes - Number of bytes
 * @param decimals - Number of decimal places
 * @returns Formatted string (e.g., '2.5 GB', '45.6 MB')
 */
export function formatBytes(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

/**
 * Sleep for a specified duration
 *
 * @param ms - Milliseconds to sleep
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Calculate retry delay with exponential backoff
 *
 * @param attempt - Current attempt number (0-based)
 * @returns Delay in milliseconds
 */
export function getRetryDelay(attempt: number): number {
  return (
    MIGRATION_CONFIG.retryDelayMs *
    Math.pow(MIGRATION_CONFIG.retryBackoffMultiplier, attempt)
  );
}

/**
 * Check if a URL is a Wikia asset URL
 *
 * @param url - URL to check
 * @returns true if URL is from static.wikia.nocookie.net
 */
export function isWikiaUrl(url: string): boolean {
  return url.includes('static.wikia.nocookie.net');
}

/**
 * Sanitize a string for use as a filename
 *
 * @param str - String to sanitize
 * @returns Sanitized string
 */
export function sanitizeFilename(str: string): string {
  return str.replace(/[^a-zA-Z0-9._-]/g, '_');
}

/**
 * Validate URL format
 *
 * @param url - URL to validate
 * @returns true if valid URL
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Extract domain from URL
 *
 * @param url - URL to extract domain from
 * @returns Domain (e.g., 'static.wikia.nocookie.net')
 */
export function extractDomain(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return 'unknown';
  }
}

/**
 * Format timestamp to ISO string
 *
 * @param date - Date to format (defaults to now)
 * @returns ISO timestamp string
 */
export function formatTimestamp(date: Date = new Date()): string {
  return date.toISOString();
}

/**
 * Group items by category
 *
 * @param items - Items with category property
 * @returns Map of category to items
 */
export function groupByCategory<T extends { category: AssetCategory }>(
  items: T[]
): Map<AssetCategory, T[]> {
  const grouped = new Map<AssetCategory, T[]>();

  for (const item of items) {
    const existing = grouped.get(item.category) || [];
    existing.push(item);
    grouped.set(item.category, existing);
  }

  return grouped;
}

/**
 * Create progress indicator
 *
 * @param current - Current progress
 * @param total - Total items
 * @param width - Progress bar width
 * @returns Progress bar string
 */
export function createProgressBar(
  current: number,
  total: number,
  width: number = 40
): string {
  const percentage = total > 0 ? current / total : 0;
  const filled = Math.floor(percentage * width);
  const empty = width - filled;

  const bar = '█'.repeat(filled) + '░'.repeat(empty);
  const percent = (percentage * 100).toFixed(1);

  return `[${bar}] ${percent}% (${current}/${total})`;
}
