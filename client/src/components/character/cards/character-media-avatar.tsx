import React, { useRef, useState } from 'react';

import { Avatar, AvatarImage } from '@/components/ui/avatar.tsx';
import { Skeleton } from '@/components/ui/skeleton';
import { useLazyCachedAsset } from '@/hooks/useCachedAsset';
import { useSharedIntersectionObserver } from '@/hooks/useSharedIntersectionObserver';
import { cn } from '@/lib/utils';
import { AnimationMedia } from '@/types';

interface CharacterMediaAvatarProps {
  media: AnimationMedia;
  containerClassName?: string;
  avatarClassName?: string;
  imageClassName?: string;
  videoClassName?: string;
  hoverScale?: number;
  enableHoverAnimation?: boolean;
  enableWooshAnimation?: boolean;
  hoverZIndex?: string;
}

const CharacterMediaAvatar: React.FC<CharacterMediaAvatarProps> = ({
  media,
  containerClassName,
  avatarClassName,
  imageClassName,
  videoClassName,
  hoverScale = 1.2,
  enableHoverAnimation = true,
  enableWooshAnimation = false,
  hoverZIndex = 'z-10',
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Only load when avatar is visible in viewport - using shared observer
  const isVisible = useSharedIntersectionObserver(containerRef, {
    rootMargin: '200px',
  });

  // Load fallback image (character icon) immediately when visible
  const { url: cachedFallbackUrl, isLoading: fallbackLoading } =
    useLazyCachedAsset(media.fallbackUrl || media.imageUrl, isVisible);

  // Load main image (GIF) when visible
  const { url: cachedImageUrl } = useLazyCachedAsset(
    media.imageUrl,
    isVisible && !!media.fallbackUrl
  );

  // Only load video when both visible AND hovered
  const { url: cachedVideoUrl } = useLazyCachedAsset(
    media.videoUrl,
    isVisible && isHovered
  );

  // Show skeleton while fallback is loading
  if (fallbackLoading) {
    return (
      <div ref={containerRef} className={cn('relative', containerClassName)}>
        <Skeleton className="h-full w-full rounded-full" />
      </div>
    );
  }

  // Determine which image to show: GIF if loaded, otherwise fallback
  const displayImageUrl = cachedImageUrl || cachedFallbackUrl;

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative',
        isHovered && 'overflow-visible',
        containerClassName
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setIsVideoLoaded(false);
      }}
    >
      <Avatar
        className={cn(
          'relative h-full w-full cursor-pointer transition-transform duration-300 ease-in-out',
          isHovered && hoverZIndex,
          enableWooshAnimation && isVideoLoaded && 'animate-woosh',
          avatarClassName
        )}
        style={{
          transform:
            isHovered && enableHoverAnimation
              ? `scale3d(${hoverScale}, ${hoverScale}, 1)`
              : 'scale3d(1, 1, 1)',
          willChange: 'transform',
        }}
      >
        <AvatarImage
          src={displayImageUrl}
          alt={media.caption}
          loading="lazy"
          className={cn('h-full w-full', imageClassName)}
        />
        {isHovered && cachedVideoUrl && (
          <video
            src={cachedVideoUrl}
            autoPlay
            loop
            muted
            className={cn(
              'absolute inset-0 h-full w-full object-cover rounded-full transition-opacity duration-300',
              isVideoLoaded ? 'opacity-100' : 'opacity-0',
              videoClassName
            )}
            onCanPlayThrough={() => setIsVideoLoaded(true)}
          />
        )}
      </Avatar>
    </div>
  );
};

export default CharacterMediaAvatar;
