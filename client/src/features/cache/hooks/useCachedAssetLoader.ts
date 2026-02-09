import { RefObject } from 'react';

import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';

import { useCachedAsset } from './useCachedAsset';
import { useLazyCachedAsset } from './useLazyCachedAsset';

interface UseCachedAssetLoaderOptions {
  lazy?: boolean;
  rootMargin?: string;
  elementRef: RefObject<Element>;
}

/**
 * Unified hook for loading and caching assets
 *
 * Automatically handles both eager and lazy loading modes:
 * - Eager mode: Fetches and caches immediately using useCachedAsset
 * - Lazy mode: Fetches only when element is visible using useLazyCachedAsset
 */
export function useCachedAssetLoader(
  src: string | undefined | null,
  options: UseCachedAssetLoaderOptions
): {
  url: string;
  isLoading: boolean;
  isError: boolean;
} {
  const { lazy = false, rootMargin = '200px', elementRef } = options;
  const isIntersecting = useIntersectionObserver(elementRef, {
    rootMargin,
    enabled: lazy,
  });

  const lazyResult = useLazyCachedAsset(
    lazy ? src : null,
    lazy ? isIntersecting : false
  );
  const eagerUrl = useCachedAsset(lazy ? null : src);

  if (lazy) {
    return lazyResult;
  }

  return {
    url: eagerUrl,
    isLoading: false,
    isError: false,
  };
}
