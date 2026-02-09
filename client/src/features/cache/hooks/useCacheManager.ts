import { useCallback, useEffect, useState } from 'react';

import { assetCache, clearOldCache } from '../utils/assetCache';

interface CacheStats {
  count: number;
  size: number;
  sizeInMB: number;
}

/**
 * Hook for managing the asset cache
 * Provides cache statistics and management functions
 */
export function useCacheManager() {
  const [stats, setStats] = useState<CacheStats>({
    count: 0,
    size: 0,
    sizeInMB: 0,
  });
  const [isLoading, setIsLoading] = useState(false);

  const executeWithLoading = useCallback(
    async (operation: () => Promise<void>, errorMessage: string) => {
      setIsLoading(true);
      try {
        await operation();
      } catch (error) {
        console.error(errorMessage, error);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const refreshStats = useCallback(async () => {
    await executeWithLoading(async () => {
      const cacheStats = await assetCache.getCacheStats();
      setStats(cacheStats);
    }, 'Failed to get cache stats:');
  }, [executeWithLoading]);

  const clearCache = useCallback(async () => {
    await executeWithLoading(async () => {
      await assetCache.clear();
      await refreshStats();
    }, 'Failed to clear cache:');
  }, [executeWithLoading, refreshStats]);

  const clearOldAssets = useCallback(
    async (maxAgeInDays: number = 7) => {
      await executeWithLoading(async () => {
        const maxAge = maxAgeInDays * 24 * 60 * 60 * 1000;
        await clearOldCache(maxAge);
        await refreshStats();
      }, 'Failed to clear old cache:');
    },
    [executeWithLoading, refreshStats]
  );

  const deleteAsset = useCallback(
    async (url: string) => {
      await executeWithLoading(async () => {
        await assetCache.delete(url);
        await refreshStats();
      }, 'Failed to delete asset:');
    },
    [executeWithLoading, refreshStats]
  );

  useEffect(() => {
    refreshStats();
  }, [refreshStats]);

  return {
    stats,
    isLoading,
    refreshStats,
    clearCache,
    clearOldAssets,
    deleteAsset,
  };
}

/**
 * Hook to automatically clear old cache on mount
 * Useful for app initialization
 */
export function useAutoClearOldCache(maxAgeInDays: number = 7) {
  useEffect(() => {
    const maxAge = maxAgeInDays * 24 * 60 * 60 * 1000;
    clearOldCache(maxAge).catch((error) => {
      console.error('Auto clear old cache failed:', error);
    });
  }, [maxAgeInDays]);
}
