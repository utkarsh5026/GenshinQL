import React, { useRef } from 'react';

import { Skeleton } from '@/components/ui/skeleton';
import { useCachedAsset, useLazyCachedAsset } from '@/hooks/useCachedAsset';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';

interface CachedImageProps extends Omit<
  React.ImgHTMLAttributes<HTMLImageElement>,
  'src'
> {
  src: string | undefined | null;
  fallback?: string;
  lazy?: boolean;
  rootMargin?: string;
  showSkeleton?: boolean;
  skeletonClassName?: string;
}

/**
 * Image component that automatically caches the image in IndexedDB
 * Subsequent loads will use the cached version instead of fetching from network
 *
 * @param lazy - Enable lazy loading (only fetch when in viewport)
 * @param rootMargin - Margin around viewport for intersection observer (default: "200px")
 * @param showSkeleton - Show skeleton while loading (default: true)
 * @param skeletonClassName - Custom className for skeleton
 */
export const CachedImage: React.FC<CachedImageProps> = ({
  src,
  fallback,
  alt = '',
  lazy = false,
  rootMargin = '200px',
  showSkeleton = true,
  skeletonClassName,
  className,
  style,
  ...props
}) => {
  const imgRef = useRef<HTMLImageElement>(null);
  const isIntersecting = useIntersectionObserver(imgRef, {
    rootMargin,
    enabled: lazy,
  });

  // Use lazy loading hook if lazy prop is true, otherwise use regular hook
  const lazyAsset = useLazyCachedAsset(src, lazy ? isIntersecting : true);
  const eagerCachedSrc = useCachedAsset(lazy ? null : src);

  const cachedSrc = lazy ? lazyAsset.url : eagerCachedSrc;
  const isLoading = lazy ? lazyAsset.isLoading : false;

  // Show skeleton while loading (only in lazy mode)
  if (lazy && showSkeleton && isLoading) {
    return (
      <Skeleton className={skeletonClassName || className} style={style} />
    );
  }

  return (
    <img
      {...props}
      ref={imgRef}
      src={cachedSrc || fallback || ''}
      alt={alt}
      className={className}
      style={style}
    />
  );
};

interface CachedVideoProps extends Omit<
  React.VideoHTMLAttributes<HTMLVideoElement>,
  'src'
> {
  src: string | undefined | null;
  fallback?: string;
  lazy?: boolean;
  rootMargin?: string;
  showSkeleton?: boolean;
  skeletonClassName?: string;
}

/**
 * Video component that automatically caches the video in IndexedDB
 * Subsequent loads will use the cached version instead of fetching from network
 *
 * @param lazy - Enable lazy loading (only fetch when in viewport)
 * @param rootMargin - Margin around viewport for intersection observer (default: "200px")
 * @param showSkeleton - Show skeleton while loading (default: true)
 * @param skeletonClassName - Custom className for skeleton
 */
export const CachedVideo: React.FC<CachedVideoProps> = ({
  src,
  fallback,
  lazy = false,
  rootMargin = '200px',
  showSkeleton = true,
  skeletonClassName,
  className,
  style,
  ...props
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const isIntersecting = useIntersectionObserver(videoRef, {
    rootMargin,
    enabled: lazy,
  });

  // Use lazy loading hook if lazy prop is true, otherwise use regular hook
  const lazyAsset = useLazyCachedAsset(src, lazy ? isIntersecting : true);
  const eagerCachedSrc = useCachedAsset(lazy ? null : src);

  const cachedSrc = lazy ? lazyAsset.url : eagerCachedSrc;
  const isLoading = lazy ? lazyAsset.isLoading : false;

  // Show skeleton while loading (only in lazy mode)
  if (lazy && showSkeleton && isLoading) {
    return (
      <Skeleton className={skeletonClassName || className} style={style} />
    );
  }

  if (!cachedSrc && !fallback) return null;

  return (
    <video
      {...props}
      ref={videoRef}
      src={cachedSrc || fallback || ''}
      className={className}
      style={style}
    />
  );
};
