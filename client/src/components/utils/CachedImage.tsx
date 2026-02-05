import React, { useCallback, useRef, useState } from 'react';

import { ImageSkeleton } from '@/components/utils/ImageSkeleton';
import { useCachedAsset, useLazyCachedAsset } from '@/hooks/useCachedAsset';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';
import { cn } from '@/lib/utils';

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
  /** Custom skeleton component to show while loading */
  customSkeleton?: React.ReactNode;
  /** Skeleton shape: circle, rounded, or square */
  skeletonShape?: 'circle' | 'rounded' | 'square';
  /** Skeleton size: sm (20px), md (40px), lg (64px) */
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
  customSkeleton,
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

  // Use lazy loading hook if lazy prop is true, otherwise use regular hook
  const lazyAsset = useLazyCachedAsset(src, lazy ? isIntersecting : true);
  const eagerCachedSrc = useCachedAsset(lazy ? null : src);

  const cachedSrc = lazy ? lazyAsset.url : eagerCachedSrc;
  const isFetchingUrl = lazy ? lazyAsset.isLoading : false;

  const handleImageLoad = useCallback(() => {
    setIsImageLoaded(true);
  }, []);

  // Determine if we should show the skeleton
  // Show skeleton if: we're fetching the URL OR the image hasn't loaded yet
  const shouldShowSkeleton = showSkeleton && (isFetchingUrl || !isImageLoaded);

  // Render skeleton component
  const renderSkeleton = () => {
    if (customSkeleton) {
      return <>{customSkeleton}</>;
    }
    return (
      <ImageSkeleton
        size={skeletonSize}
        shape={skeletonShape}
        className={skeletonClassName}
        style={style}
      />
    );
  };

  // If we don't have a URL yet (still fetching), show skeleton only
  if (isFetchingUrl && showSkeleton) {
    return (
      <div
        ref={containerRef}
        className={cn('relative', skeletonClassName)}
        style={style}
      >
        {renderSkeleton()}
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative inline-block" style={style}>
      {/* Skeleton overlay - shown until image loads */}
      {shouldShowSkeleton && (
        <div className="absolute inset-0 z-10">{renderSkeleton()}</div>
      )}

      {/* Actual image - starts hidden, fades in when loaded */}
      <img
        {...props}
        src={cachedSrc || fallback || ''}
        alt={alt}
        onLoad={handleImageLoad}
        className={cn(
          className,
          // Fade-in transition when image loads
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
