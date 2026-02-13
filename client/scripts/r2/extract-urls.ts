import fs from 'node:fs/promises';
import path from 'node:path';

import { logger } from '../logger.js';
import { resolvePath } from './path-resolver.js';
import { isValidUrl, isWikiaUrl } from './utils.js';

/**
 * Extract all Wikia URLs from a JSON object recursively
 *
 * @param obj - Object to extract URLs from
 * @param urls - Set to accumulate URLs (internal use)
 * @returns Set of unique URLs
 */
export function extractUrlsFromObject(
  obj: unknown,
  urls: Set<string> = new Set()
): Set<string> {
  if (obj == null) {
    return urls;
  }

  if (typeof obj === 'string') {
    if (isValidUrl(obj) && isWikiaUrl(obj)) {
      urls.add(obj);
    }
    return urls;
  }

  if (Array.isArray(obj)) {
    for (const item of obj) {
      extractUrlsFromObject(item, urls);
    }
    return urls;
  }

  if (typeof obj === 'object') {
    for (const value of Object.values(obj)) {
      extractUrlsFromObject(value, urls);
    }
    return urls;
  }

  return urls;
}

/**
 * Extract URLs from JSON files at the specified path
 *
 * @param targetPath - Relative path from public/ (defaults to 'characters')
 * @returns Set of unique URLs from all JSON files
 */
export async function extractAllUrls(
  targetPath?: string
): Promise<Set<string>> {
  const allUrls = new Set<string>();
  let processed = 0;

  const extractUrlsFromFile = async (
    filePath: string
  ): Promise<Set<string>> => {
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      const data = JSON.parse(content);

      return extractUrlsFromObject(data);
    } catch (error) {
      console.error(`Error reading file ${filePath}:`, error);
      return new Set();
    }
  };

  const processJsonFiles = async (jsonFiles: string[]) => {
    for (const filePath of jsonFiles) {
      const urls = await extractUrlsFromFile(filePath);

      for (const url of urls) {
        allUrls.add(url);
      }

      processed++;
      if (processed % 10 === 0) {
        logger.log(`Processed ${processed}/${jsonFiles.length} files...`);
      }
    }
  };

  try {
    // Resolve target path (defaults to 'characters')
    const resolved = await resolvePath(targetPath);

    logger.info(
      resolved.isDirectory
        ? `Scanning directory: ${resolved.relativePath}`
        : `Scanning file: ${resolved.relativePath}`
    );

    const jsonFiles = resolved.jsonFiles;

    if (jsonFiles.length === 0) {
      logger.warn('No JSON files found in target path');
      return allUrls;
    }

    logger.info(
      `Found ${jsonFiles.length} JSON file${jsonFiles.length === 1 ? '' : 's'}`
    );
    await processJsonFiles(jsonFiles);
    logger.success(
      `Extracted ${allUrls.size} unique URL${allUrls.size === 1 ? '' : 's'} from ${jsonFiles.length} file${jsonFiles.length === 1 ? '' : 's'}`
    );
  } catch (error) {
    logger.error('Error extracting URLs:', error);
    throw error;
  }

  return allUrls;
}

/**
 * Get statistics about extracted URLs
 *
 * @param urls - Set of URLs
 * @returns Statistics object
 */
export function getUrlStats(urls: Set<string>) {
  const urlArray = Array.from(urls);

  const byExtension: Record<string, number> = {};
  for (const url of urlArray) {
    const ext = path.extname(url).toLowerCase().substring(1) || 'unknown';
    byExtension[ext] = (byExtension[ext] || 0) + 1;
  }

  const byDomain: Record<string, number> = {};
  for (const url of urlArray) {
    try {
      const domain = new URL(url).hostname;
      byDomain[domain] = (byDomain[domain] || 0) + 1;
    } catch {
      byDomain['invalid'] = (byDomain['invalid'] || 0) + 1;
    }
  }

  return {
    total: urls.size,
    byExtension,
    byDomain,
  };
}
