/**
 * IndexedDB-based cache service with stale-while-revalidate pattern.
 * Provides persistent browser caching for JSON data with background revalidation.
 */

const DB_NAME = 'genshin-cache';
const DB_VERSION = 1;
const STORE_NAME = 'data-cache';

interface CacheEntry<T> {
  key: string;
  data: T;
  timestamp: number;
  hash: string;
}

/**
 * Simple hash function for change detection.
 * Uses a fast string hash for comparing data updates.
 */
function hashData(data: unknown): string {
  const str = JSON.stringify(data);
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return hash.toString(36);
}

let dbPromise: Promise<IDBDatabase> | null = null;

/**
 * Opens or creates the IndexedDB database.
 */
function openDatabase(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      console.error('Failed to open cache database:', request.error);
      reject(request.error);
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'key' });
      }
    };
  });

  return dbPromise;
}

/**
 * Retrieves cached data for a given key.
 */
export async function getCached<T>(key: string): Promise<CacheEntry<T> | null> {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(key);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result ?? null);
    });
  } catch (error) {
    console.warn('Cache read failed:', error);
    return null;
  }
}

/**
 * Stores data in the cache with timestamp and hash.
 */
export async function setCached<T>(key: string, data: T): Promise<void> {
  try {
    const db = await openDatabase();
    const entry: CacheEntry<T> = {
      key,
      data,
      timestamp: Date.now(),
      hash: hashData(data),
    };

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put(entry);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  } catch (error) {
    console.warn('Cache write failed:', error);
  }
}

/**
 * Options for simple URL-based fetch mode.
 */
export interface FetchCacheOptions<T> {
  /** Custom cache key. If not provided, URL will be sanitized and used */
  cacheKey?: string;

  /** Cache version for busting. Appended as `-v{version}` */
  version?: number | string;

  /** Callback when background revalidation brings new data */
  onUpdate?: (newData: T) => void;

  /** Transform fetched data before caching */
  transform?: (data: unknown) => T;

  /** Custom fetch options (headers, method, etc.) */
  fetchOptions?: RequestInit;

  /** Base URL for relative paths. Default: '/' */
  baseUrl?: string;
}

/**
 * Result from fetchWithCache including data and optional update callback.
 */
export interface CacheResult<T> {
  data: T;
  fromCache: boolean;
  /** Promise that resolves when background fetch completes. Returns true if data was updated. */
  backgroundUpdate?: Promise<boolean>;
}

/**
 * Sanitizes a URL to a valid cache key format.
 * @example
 * '/artifacts-links.json' → 'artifacts-links'
 * 'https://api.example.com/data' → 'api.example.com-data'
 */
function sanitizeUrlToCacheKey(url: string): string {
  return url
    .replace(/^https?:\/\//, '')
    .replace(/^\/+/, '')
    .replace(/\//g, '-')
    .replace(/\.json$/, '');
}

/**
 * Generates a cache key from URL and options.
 * @example
 * generateCacheKey('/artifacts-links.json', { version: 1 })
 * → 'artifacts-links-v1'
 */
function generateCacheKey(
  url: string,
  options: Pick<FetchCacheOptions<unknown>, 'cacheKey' | 'version'>
): string {
  const baseKey = options.cacheKey ?? sanitizeUrlToCacheKey(url);
  const version = options.version ? `-v${options.version}` : '';
  return `${baseKey}${version}`;
}

/**
 * Fetches data with stale-while-revalidate strategy.
 * Automatically handles fetch, response checking, and JSON parsing.
 *
 * 1. Returns cached data immediately if available
 * 2. Fires background fetch to revalidate
 * 3. Updates cache if data has changed
 *
 * @example
 * ```ts
 * fetchWithCache('/artifacts.json', { version: 1, onUpdate: updateStore })
 * ```
 */
export async function fetchWithCache<T>(
  url: string,
  options: FetchCacheOptions<T> = {}
): Promise<CacheResult<T>> {
  const {
    cacheKey,
    version,
    onUpdate,
    transform,
    fetchOptions = {},
    baseUrl = '/',
  } = options;

  const key = generateCacheKey(url, { cacheKey, version });
  const fullUrl = url.startsWith('http') ? url : `${baseUrl}${url}`;

  const fetchFn = async (): Promise<T> => {
    const response = await fetch(fullUrl, fetchOptions);

    if (!response.ok) {
      throw new Error(
        `Failed to fetch ${url}: ${response.status} ${response.statusText}`
      );
    }

    const rawData = await response.json();
    return transform ? transform(rawData) : (rawData as T);
  };

  const cached = await getCached<T>(key);

  const revalidate = async (): Promise<boolean> => {
    try {
      const freshData = await fetchFn();
      const freshHash = hashData(freshData);

      if (!cached || cached.hash !== freshHash) {
        await setCached(key, freshData);
        if (onUpdate && cached) {
          onUpdate(freshData);
        }
        return true;
      }
      return false;
    } catch (error) {
      console.error('Background revalidation failed:', error);
      return false;
    }
  };

  if (cached) {
    return {
      data: cached.data,
      fromCache: true,
      backgroundUpdate: revalidate(),
    };
  }

  const freshData = await fetchFn();
  await setCached(key, freshData);
  return {
    data: freshData,
    fromCache: false,
  };
}

/**
 * Clears all cached data.
 */
export async function clearAllCache(): Promise<void> {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.clear();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  } catch (error) {
    console.warn('Cache clear failed:', error);
  }
}

/**
 * Deletes the entire cache database.
 * Use this for major version updates.
 */
export async function deleteDatabase(): Promise<void> {
  dbPromise = null;
  return new Promise((resolve, reject) => {
    const request = indexedDB.deleteDatabase(DB_NAME);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}
