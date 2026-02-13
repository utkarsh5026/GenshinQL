import { useEffect, useMemo, useState } from 'react';

import { fetchAndCacheAsset } from '../utils/assetCache';

/**
 * Hook to automatically cache and retrieve assets (images/videos)
 * Returns a blob URL for the cached asset or falls back to the original URL
 */
export function useCachedAsset(url: string | undefined | null): string {
  const [cachedUrl, setCachedUrl] = useState<string>(() =>
    !url || url.trim() === '' ? '' : url
  );

  useEffect(() => {
    if (!url || url.trim() === '') {
      return;
    }

    let isMounted = true;

    fetchAndCacheAsset(url)
      .then((blobUrl) => {
        if (isMounted) {
          setCachedUrl(blobUrl);
        }
      })
      .catch((error) => {
        console.error('Failed to cache asset:', error);
        if (isMounted) {
          setCachedUrl(url);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [url]);

  return cachedUrl;
}

/**
 * Hook to cache multiple assets and return their cached URLs
 */
export function useCachedAssets(urls: (string | undefined | null)[]): string[] {
  const [cachedUrls, setCachedUrls] = useState<string[]>(() =>
    urls.map((url) => url || '')
  );

  const urlsKey = useMemo(() => urls.join(','), [urls]);

  useEffect(() => {
    const validUrls = urls.filter(
      (url): url is string => !!url && url.trim() !== ''
    );

    if (validUrls.length === 0) {
      return;
    }

    let isMounted = true;

    Promise.all(
      urls.map(async (url) => {
        if (!url || url.trim() === '') return Promise.resolve('');
        return fetchAndCacheAsset(url).catch(() => url);
      })
    ).then((results) => {
      if (isMounted) {
        setCachedUrls(results);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [urlsKey, urls]);

  return cachedUrls;
}

/**
 * Hook to preload assets without immediately using them
 * Useful for preloading assets that will be used later
 */
export function usePreloadAssets(urls: string[], enabled = true): void {
  const urlsKey = useMemo(() => urls.join(','), [urls]);

  useEffect(() => {
    if (!enabled || urls.length === 0) return;

    const validUrls = urls.filter((url) => url && url.trim() !== '');

    Promise.all(
      validUrls.map((url) => fetchAndCacheAsset(url).catch(() => {}))
    );
  }, [urlsKey, urls, enabled]);
}
