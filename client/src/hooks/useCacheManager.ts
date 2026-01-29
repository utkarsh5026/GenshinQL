import { useCallback, useEffect, useState } from 'react';
import { assetCache, clearOldCache } from '@/utils/assetCache';

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

  const refreshStats = useCallback(async () => {
    setIsLoading(true);
    try {
      const cacheStats = await assetCache.getCacheStats();
      setStats(cacheStats);
    } catch (error) {
      console.error('Failed to get cache stats:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearCache = useCallback(async () => {
    setIsLoading(true);
    try {
      await assetCache.clear();
      await refreshStats();
    } catch (error) {
      console.error('Failed to clear cache:', error);
    } finally {
      setIsLoading(false);
    }
  }, [refreshStats]);

  const clearOldAssets = useCallback(async (maxAgeInDays: number = 7) => {
    setIsLoading(true);
    try {
      const maxAge = maxAgeInDays * 24 * 60 * 60 * 1000;
      await clearOldCache(maxAge);
      await refreshStats();
    } catch (error) {
      console.error('Failed to clear old cache:', error);
    } finally {
      setIsLoading(false);
    }
  }, [refreshStats]);

  const deleteAsset = useCallback(async (url: string) => {
    setIsLoading(true);
    try {
      await assetCache.delete(url);
      await refreshStats();
    } catch (error) {
      console.error('Failed to delete asset:', error);
    } finally {
      setIsLoading(false);
    }
  }, [refreshStats]);

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
    clearOldCache(maxAge).catch(error => {
      console.error('Auto clear old cache failed:', error);
    });
  }, [maxAgeInDays]);
}
