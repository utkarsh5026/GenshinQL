import React from 'react';

import { useCachedAsset } from '@/hooks/useCachedAsset';

interface CachedImageProps
  extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  src: string | undefined | null;
  fallback?: string;
}

/**
 * Image component that automatically caches the image in IndexedDB
 * Subsequent loads will use the cached version instead of fetching from network
 */
export const CachedImage: React.FC<CachedImageProps> = ({
  src,
  fallback,
  alt = '',
  ...props
}) => {
  const cachedSrc = useCachedAsset(src);

  return <img {...props} src={cachedSrc || fallback || ''} alt={alt} />;
};

interface CachedVideoProps
  extends Omit<React.VideoHTMLAttributes<HTMLVideoElement>, 'src'> {
  src: string | undefined | null;
  fallback?: string;
}

/**
 * Video component that automatically caches the video in IndexedDB
 * Subsequent loads will use the cached version instead of fetching from network
 */
export const CachedVideo: React.FC<CachedVideoProps> = ({
  src,
  fallback,
  ...props
}) => {
  const cachedSrc = useCachedAsset(src);

  if (!cachedSrc && !fallback) return null;

  return <video {...props} src={cachedSrc || fallback || ''} />;
};
