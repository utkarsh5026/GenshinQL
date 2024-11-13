import React, { useState } from "react";
import { Avatar, AvatarImage } from "@/components/ui/avatar.tsx";
import { AnimationMedia } from "@/graphql/types";

interface CharacterMediaAvatarProps {
  media: AnimationMedia;
}

const CharacterMediaAvatar: React.FC<CharacterMediaAvatarProps> = ({
  media,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);

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
          src={media.imageUrl}
          alt={media.caption}
          loading="lazy"
          className="h-full w-full"
        />
        {isHovered && media.videoUrl && (
          <video
            src={media.videoUrl}
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