import { useEffect, useState } from 'react';

import { fetchAndCacheAsset } from '../utils/assetCache';

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
    if (!normalizedUrl || !shouldLoad) {
      return;
    }

    let isMounted = true;
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
      } catch {
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
