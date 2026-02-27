import { Loader2 } from 'lucide-react';
import React, { useCallback, useRef, useState } from 'react';

import { cn } from '@/lib/utils';

import { useCachedAssetLoader } from '../hooks/useCachedAssetLoader';

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

  const { url: cachedSrc, isLoading: isFetchingUrl } = useCachedAssetLoader(
    src,
    {
      lazy,
      rootMargin,
      elementRef: containerRef,
    }
  );

  const handleImageLoad = useCallback(() => {
    setIsImageLoaded(true);
  }, []);

  const shouldShowSkeleton = showSkeleton && (isFetchingUrl || !isImageLoaded);

  if (isFetchingUrl && showSkeleton) {
    return (
      <div
        ref={containerRef}
        className={cn(
          'relative flex items-center justify-center',
          skeletonClassName
        )}
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
        <div className="absolute inset-0 z-10 flex items-center justify-center">
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

  const { url: cachedSrc, isLoading } = useCachedAssetLoader(src, {
    lazy,
    rootMargin,
    elementRef: videoRef,
  });

  if (lazy && showSkeleton && isLoading) {
    return (
      <div
        className={cn(
          'flex items-center justify-center',
          skeletonClassName || className
        )}
        style={style}
      >
        <ImageSkeleton />
      </div>
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

interface ImageSkeletonProps {
  size?: 'sm' | 'md' | 'lg';
  shape?: 'circle' | 'rounded' | 'square';
  className?: string;
  style?: React.CSSProperties;
}

const sizeMap = {
  sm: { icon: 10 },
  md: { icon: 16 },
  lg: { icon: 24 },
};

const shapeMap = {
  circle: 'rounded-full',
  rounded: 'rounded-lg',
  square: 'rounded-none',
};

export const ImageSkeleton: React.FC<ImageSkeletonProps> = ({
  size = 'md',
  shape = 'circle',
  className,
  style,
}) => {
  const { icon } = sizeMap[size];

  return (
    <div
      className={cn(
        'flex h-full w-full items-center justify-center bg-midnight-800/60',
        shapeMap[shape],
        className
      )}
      style={style}
    >
      <Loader2 size={icon} className="animate-spin text-green-400" />
    </div>
  );
};
