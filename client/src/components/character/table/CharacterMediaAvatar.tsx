import React, { useRef, useState } from 'react';

import { Avatar, AvatarImage } from '@/components/ui/avatar.tsx';
import { Skeleton } from '@/components/ui/skeleton';
import { useLazyCachedAsset } from '@/hooks/useCachedAsset';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';
import { AnimationMedia } from '@/types';

interface CharacterMediaAvatarProps {
  media: AnimationMedia;
}

const CharacterMediaAvatar: React.FC<CharacterMediaAvatarProps> = ({
  media,
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
      <div ref={containerRef} className="relative h-12 w-12">
        <Skeleton className="h-full w-full rounded-full" />
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="relative h-12 w-12"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setIsVideoLoaded(false);
      }}
    >
      <Avatar
        className={`relative h-full w-full cursor-pointer transition duration-300 ease-in-out hover:scale-150 ${
          isVideoLoaded ? 'animate-woosh' : ''
        }`}
      >
        <AvatarImage
          src={cachedImageUrl}
          alt={media.caption}
          loading="lazy"
          className="h-full w-full"
        />
        {isHovered && cachedVideoUrl && (
          <video
            src={cachedVideoUrl}
            autoPlay
            loop
            muted
            className={`absolute inset-0 h-full w-full object-cover
                 transition-opacity duration-300 ${
                   isVideoLoaded ? 'opacity-100' : 'opacity-0'
                 }`}
            onCanPlayThrough={() => setIsVideoLoaded(true)}
          />
        )}
      </Avatar>
    </div>
  );
};

export default CharacterMediaAvatar;
