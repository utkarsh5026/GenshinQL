import React, { useCallback, useRef, useState } from 'react';

import { ImageSkeleton } from '@/components/utils/ImageSkeleton';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';
import { cn } from '@/lib/utils';

import { useCachedAsset, useLazyCachedAsset } from '../hooks/useCachedAsset';

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
  skeletonShape?: 'circle' | 'rounded' | 'square';
  skeletonSize?: 'sm' | 'md' | 'lg';
}

/**
 * Image component that automatically caches the image in IndexedDB
 * Subsequent loads will use the cached version instead of fetching from network
 * Shows an animated skeleton until the image is fully loaded and rendered
 */
export const CachedImage: React.FC<CachedImageProps> = ({
  src,
  fallback,
  alt = '',
  lazy = false,
  rootMargin = '200px',
  showSkeleton = true,
  skeletonClassName,
  skeletonShape = 'circle',
  skeletonSize = 'md',
  className,
  style,
  ...props
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const isIntersecting = useIntersectionObserver(containerRef, {
    rootMargin,
    enabled: lazy,
  });

  const lazyAsset = useLazyCachedAsset(src, lazy ? isIntersecting : true);
  const eagerCachedSrc = useCachedAsset(lazy ? null : src);

  const cachedSrc = lazy ? lazyAsset.url : eagerCachedSrc;
  const isFetchingUrl = lazy ? lazyAsset.isLoading : false;

  const handleImageLoad = useCallback(() => {
    setIsImageLoaded(true);
  }, []);

  const shouldShowSkeleton = showSkeleton && (isFetchingUrl || !isImageLoaded);

  if (isFetchingUrl && showSkeleton) {
    return (
      <div
        ref={containerRef}
        className={cn('relative', skeletonClassName)}
        style={style}
      >
        <ImageSkeleton
          size={skeletonSize}
          shape={skeletonShape}
          className={skeletonClassName}
          style={style}
        />
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative inline-block" style={style}>
      {shouldShowSkeleton && (
        <div className="absolute inset-0 z-10">
          <ImageSkeleton
            size={skeletonSize}
            shape={skeletonShape}
            className={skeletonClassName}
            style={style}
          />
        </div>
      )}
      <img
        {...props}
        src={cachedSrc || fallback || ''}
        alt={alt}
        onLoad={handleImageLoad}
        className={cn(
          className,
          'transition-opacity duration-300',
          isImageLoaded ? 'opacity-100' : 'opacity-0'
        )}
      />
    </div>
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

  const lazyAsset = useLazyCachedAsset(src, lazy ? isIntersecting : true);
  const eagerCachedSrc = useCachedAsset(lazy ? null : src);

  const cachedSrc = lazy ? lazyAsset.url : eagerCachedSrc;
  const isLoading = lazy ? lazyAsset.isLoading : false;

  if (lazy && showSkeleton && isLoading) {
    return (
      <ImageSkeleton className={skeletonClassName || className} style={style} />
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
