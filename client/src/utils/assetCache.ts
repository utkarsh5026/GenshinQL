/**
 * Asset Cache Utility using IndexedDB
 * Provides a key-value store for caching images and videos locally
 */

const DB_NAME = 'GenshinAssetCache';
const DB_VERSION = 1;
const STORE_NAME = 'assets';

export interface CachedAsset {
  url: string;
  blob: Blob;
  timestamp: number;
  type: string;
}

class AssetCacheDB {
  private db: IDBDatabase | null = null;
  private initPromise: Promise<void> | null = null;

  async init(): Promise<void> {
    if (this.db) return;
    if (this.initPromise) return this.initPromise;

    this.initPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        console.error('Failed to open IndexedDB:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const objectStore = db.createObjectStore(STORE_NAME, { keyPath: 'url' });
          objectStore.createIndex('timestamp', 'timestamp', { unique: false });
        }
      };
    });

    return this.initPromise;
  }

  async get(url: string): Promise<string | null> {
    await this.init();
    if (!this.db) return null;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(url);

      request.onsuccess = () => {
        const result = request.result as CachedAsset | undefined;
        if (result) {
          const blobUrl = URL.createObjectURL(result.blob);
          resolve(blobUrl);
        } else {
          resolve(null);
        }
      };

      request.onerror = () => {
        console.error('Failed to get asset from cache:', request.error);
        reject(request.error);
      };
    });
  }

  async set(url: string, blob: Blob, type: string): Promise<void> {
    await this.init();
    if (!this.db) return;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);

      const asset: CachedAsset = {
        url,
        blob,
        timestamp: Date.now(),
        type,
      };

      const request = store.put(asset);

      request.onsuccess = () => resolve();
      request.onerror = () => {
        console.error('Failed to cache asset:', request.error);
        reject(request.error);
      };
    });
  }

  async has(url: string): Promise<boolean> {
    await this.init();
    if (!this.db) return false;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(url);

      request.onsuccess = () => resolve(!!request.result);
      request.onerror = () => {
        console.error('Failed to check cache:', request.error);
        reject(request.error);
      };
    });
  }

  async delete(url: string): Promise<void> {
    await this.init();
    if (!this.db) return;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(url);

      request.onsuccess = () => resolve();
      request.onerror = () => {
        console.error('Failed to delete asset from cache:', request.error);
        reject(request.error);
      };
    });
  }

  async clear(): Promise<void> {
    await this.init();
    if (!this.db) return;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.clear();

      request.onsuccess = () => {
        console.log('Asset cache cleared');
        resolve();
      };
      request.onerror = () => {
        console.error('Failed to clear cache:', request.error);
        reject(request.error);
      };
    });
  }

  async getCacheSize(): Promise<number> {
    await this.init();
    if (!this.db) return 0;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onsuccess = () => {
        const assets = request.result as CachedAsset[];
        const totalSize = assets.reduce((sum, asset) => sum + asset.blob.size, 0);
        resolve(totalSize);
      };

      request.onerror = () => {
        console.error('Failed to calculate cache size:', request.error);
        reject(request.error);
      };
    });
  }

  async getCacheStats(): Promise<{ count: number; size: number; sizeInMB: number }> {
    await this.init();
    if (!this.db) return { count: 0, size: 0, sizeInMB: 0 };

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onsuccess = () => {
        const assets = request.result as CachedAsset[];
        const count = assets.length;
        const size = assets.reduce((sum, asset) => sum + asset.blob.size, 0);
        const sizeInMB = size / (1024 * 1024);

        resolve({ count, size, sizeInMB });
      };

      request.onerror = () => {
        console.error('Failed to get cache stats:', request.error);
        reject(request.error);
      };
    });
  }

  getDB(): IDBDatabase | null {
    return this.db;
  }
}

export const assetCache = new AssetCacheDB();

/**
 * Fetches an asset (image/video) and caches it
 */
export async function fetchAndCacheAsset(url: string): Promise<string> {
  if (!url) return '';

  try {
    const cached = await assetCache.get(url);
    if (cached) {
      return cached;
    }

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch asset: ${response.statusText}`);
    }

    const blob = await response.blob();
    const type = response.headers.get('content-type') || blob.type;

    await assetCache.set(url, blob, type);

    return URL.createObjectURL(blob);
  } catch (error) {
    console.error('Error fetching and caching asset:', error);
    return url;
  }
}

/**
 * Preloads multiple assets in parallel
 */
export async function preloadAssets(urls: string[]): Promise<void> {
  const validUrls = urls.filter(url => url && url.trim() !== '');

  await Promise.all(
    validUrls.map(url => fetchAndCacheAsset(url).catch(err => {
      console.warn(`Failed to preload asset: ${url}`, err);
    }))
  );
}

/**
 * Clears old cached assets based on timestamp (default: 7 days)
 */
export async function clearOldCache(maxAge: number = 7 * 24 * 60 * 60 * 1000): Promise<void> {
  await assetCache.init();
  const db = assetCache.getDB();
  if (!db) return;

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const index = store.index('timestamp');
    const request = index.openCursor();

    const cutoffTime = Date.now() - maxAge;
    const keysToDelete: string[] = [];

    request.onsuccess = (event) => {
      const cursor = (event.target as IDBRequest).result;
      if (cursor) {
        const asset = cursor.value as CachedAsset;
        if (asset.timestamp < cutoffTime) {
          keysToDelete.push(asset.url);
        }
        cursor.continue();
      } else {
        Promise.all(
          keysToDelete.map(key => assetCache.delete(key))
        ).then(() => {
          console.log(`Cleared ${keysToDelete.length} old assets from cache`);
          resolve();
        }).catch(reject);
      }
    };

    request.onerror = () => {
      console.error('Failed to clear old cache:', request.error);
      reject(request.error);
    };
  });
}
