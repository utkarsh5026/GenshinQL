import React, { useRef, useState } from 'react';

import { Avatar, AvatarImage } from '@/components/ui/avatar.tsx';
import { Skeleton } from '@/components/ui/skeleton';
import { useLazyCachedAsset } from '@/hooks/useCachedAsset';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';
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

  // Only load when avatar is visible in viewport
  const isVisible = useIntersectionObserver(containerRef, {
    rootMargin: '200px',
  });

  // Load image when visible
  const { url: cachedImageUrl, isLoading: imageLoading } = useLazyCachedAsset(
    media.imageUrl,
    isVisible
  );

  // Only load video when both visible AND hovered
  const { url: cachedVideoUrl } = useLazyCachedAsset(
    media.videoUrl,
    isVisible && isHovered
  );

  // Show skeleton while image is loading
  if (imageLoading) {
    return (
      <div ref={containerRef} className={cn('relative', containerClassName)}>
        <Skeleton className="h-full w-full rounded-full" />
      </div>
    );
  }

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
          'relative h-full w-full cursor-pointer transition-all duration-300 ease-in-out',
          isHovered && hoverZIndex,
          enableWooshAnimation && isVideoLoaded && 'animate-woosh',
          avatarClassName
        )}
        style={{
          transform:
            isHovered && enableHoverAnimation
              ? `scale(${hoverScale})`
              : 'scale(1)',
        }}
      >
        <AvatarImage
          src={cachedImageUrl}
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
