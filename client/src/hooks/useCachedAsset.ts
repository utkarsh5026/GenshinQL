import { useEffect, useMemo, useState } from 'react';

import { fetchAndCacheAsset } from '@/utils/assetCache';

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

/**
 * Hook to lazily cache and retrieve assets with loading states
 * Only fetches when shouldLoad is true
 * Returns loading and error states for better UX
 */
export function useLazyCachedAsset(
  url: string | undefined | null,
  shouldLoad: boolean
): {
  url: string;
  isLoading: boolean;
  isError: boolean;
} {
  const normalizedUrl = !url || url.trim() === '' ? '' : url;

  const [fetchedData, setFetchedData] = useState<{
    forUrl: string;
    blobUrl: string;
    error: boolean;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Only fetch if we have a URL and should load
    if (!normalizedUrl || !shouldLoad) {
      return;
    }

    let isMounted = true;

    // Use async function to avoid synchronous setState in effect body
    (async () => {
      if (isMounted) {
        setIsLoading(true);
      }

      try {
        const blobUrl = await fetchAndCacheAsset(normalizedUrl);
        if (isMounted) {
          setFetchedData({ forUrl: normalizedUrl, blobUrl, error: false });
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Failed to cache asset:', error);
        if (isMounted) {
          setFetchedData({
            forUrl: normalizedUrl,
            blobUrl: normalizedUrl,
            error: true,
          });
          setIsLoading(false);
        }
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [normalizedUrl, shouldLoad]);

  // Derive final state from props and fetch result
  const finalUrl =
    fetchedData?.forUrl === normalizedUrl && shouldLoad
      ? fetchedData.blobUrl
      : normalizedUrl;
  const finalError =
    fetchedData?.forUrl === normalizedUrl && shouldLoad
      ? fetchedData.error
      : false;

  return {
    url: finalUrl,
    isLoading: shouldLoad && isLoading,
    isError: finalError,
  };
}
