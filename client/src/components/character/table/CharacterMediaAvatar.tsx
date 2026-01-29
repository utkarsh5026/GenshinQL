import React, { useState } from "react";
import { Avatar, AvatarImage } from "@/components/ui/avatar.tsx";
import { AnimationMedia } from "@/types";
import { useCachedAsset } from "@/hooks/useCachedAsset";

interface CharacterMediaAvatarProps {
  media: AnimationMedia;
}

const CharacterMediaAvatar: React.FC<CharacterMediaAvatarProps> = ({
  media,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);

  const cachedImageUrl = useCachedAsset(media.imageUrl);
  const cachedVideoUrl = useCachedAsset(media.videoUrl);

  return (
    <div
      className="relative h-12 w-12"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setIsVideoLoaded(false);
      }}
    >
      <Avatar
        className={`relative h-full w-full cursor-pointer transition duration-300 ease-in-out hover:scale-150 ${
          isVideoLoaded ? "animate-woosh" : ""
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
                   isVideoLoaded ? "opacity-100" : "opacity-0"
                 }`}
            onCanPlayThrough={() => setIsVideoLoaded(true)}
          />
        )}
      </Avatar>
    </div>
  );
};

export default CharacterMediaAvatar;