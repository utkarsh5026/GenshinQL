import React, { useCallback, useRef, useState } from 'react';

import { cn } from '@/lib/utils';

type GenshinImageShape = 'circle' | 'rounded' | 'square' | 'auto';

interface GenshinImageProps extends Omit<
  React.ImgHTMLAttributes<HTMLImageElement>,
  'onLoad' | 'onError'
> {
  /**
   * Shape of the image and its skeleton placeholder.
   * - 'circle'  → rounded-full
   * - 'rounded' → rounded-lg
   * - 'square'  → no border radius
   * - 'auto'    → inherits border radius from className (default)
   */
  shape?: GenshinImageShape;
  /**
   * Show a loading spinner while the image is loading.
   * Defaults to true.
   */
  showSkeleton?: boolean;
  /**
   * Extra class names applied to the outer wrapper div.
   */
  wrapperClassName?: string;
  /**
   * Fallback src to use when the primary src fails to load.
   */
  fallbackSrc?: string;
  /** Called when the img has finished loading and the reveal animation starts. */
  onLoad?: (e: React.SyntheticEvent<HTMLImageElement>) => void;
  /** Called when the img fails to load. */
  onError?: (e: React.SyntheticEvent<HTMLImageElement>) => void;
}

const shapeMap: Record<GenshinImageShape, string> = {
  circle: 'rounded-full',
  rounded: 'rounded-lg',
  square: 'rounded-none',
  auto: '',
};

/**
 * GenshinImage — a premium drop-in replacement for <img>.
 *
 * Features (no caching):
 * - Loading spinner while image is loading
 * - Smooth blur → sharp reveal
 * - Scale + opacity fade-in on load
 * - Optional fallback src on error
 */
export const GenshinImage: React.FC<GenshinImageProps> = ({
  src,
  alt = '',
  shape = 'auto',
  showSkeleton = true,
  className,
  wrapperClassName,
  fallbackSrc,
  style,
  onLoad,
  onError,
  ...props
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const shapeClass = shapeMap[shape];

  const handleLoad = useCallback(
    (e: React.SyntheticEvent<HTMLImageElement>) => {
      setIsLoaded(true);
      onLoad?.(e);
    },
    [onLoad]
  );

  const handleError = useCallback(
    (e: React.SyntheticEvent<HTMLImageElement>) => {
      if (fallbackSrc && e.currentTarget.src !== fallbackSrc) {
        e.currentTarget.src = fallbackSrc;
        return;
      }
      setHasError(true);
      setIsLoaded(true); // stop showing skeleton
      onError?.(e);
    },
    [fallbackSrc, onError]
  );

  const effectiveSrc = hasError ? (fallbackSrc ?? '') : (src ?? '');

  return (
    <div
      className={cn('relative overflow-hidden', shapeClass, wrapperClassName)}
      style={style}
    >
      {/* Loading spinner — visible until image is loaded */}
      {showSkeleton && !isLoaded && (
        <div
          aria-hidden
          className={cn(
            'absolute inset-0 z-10 flex items-center justify-center',
            'bg-midnight-800/60',
            shapeClass
          )}
        >
          <div className="h-1/3 w-1/3 max-h-8 max-w-8 min-h-4 min-w-4 animate-spin rounded-full border-2 border-white/10 border-t-white/60" />
        </div>
      )}

      {/* The actual image */}
      <img
        {...props}
        ref={imgRef}
        src={effectiveSrc}
        alt={alt}
        onLoad={handleLoad}
        onError={handleError}
        className={cn(
          'w-full h-full object-cover',
          shapeClass,
          // blur → sharp
          'transition-[opacity,filter,transform] duration-500 ease-out',
          isLoaded
            ? 'opacity-100 blur-0 scale-100'
            : 'opacity-0 blur-sm scale-[1.04]',
          className
        )}
      />
    </div>
  );
};
