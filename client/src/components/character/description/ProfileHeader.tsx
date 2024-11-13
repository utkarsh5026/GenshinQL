import React, { useState } from "react";
import { Avatar, AvatarImage } from "../../ui/avatar.tsx";
import { AnimationMedia } from "@/graphql/types";
import AnimatedCover from "../../utils/AnimatedCover.tsx";
import { ChevronRight } from "lucide-react";

interface ProfileHeaderProps {
  name: string;
  avatarUrl: string;
  idleOne?: AnimationMedia;
  idleTwo?: AnimationMedia;
  fallbackCoverUrl?: string;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  name,
  avatarUrl,
  idleOne,
  idleTwo,
  fallbackCoverUrl,
}) => {
  const [currentAnimation, setCurrentAnimation] = useState<"one" | "two">(
    "one",
  );

  const handleNextAnimation = () => {
    setCurrentAnimation(currentAnimation === "one" ? "two" : "one");
  };

  return (
    <div className="relative w-full shadow-md flex flex-col items-center border-2 border-white rounded-lg">
      <div className="w-full h-44 overflow-hidden rounded-md relative group">
        <AnimatedCover
          animation={currentAnimation === "one" ? idleOne : idleTwo}
          fallbackUrl={fallbackCoverUrl}
          className="w-full opacity-80 z-10"
        />
        {idleTwo && (
          <button
            aria-label="Next animation"
            onClick={handleNextAnimation}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 z-20 opacity-0 group-hover:opacity-100 transition-all duration-200"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        )}
      </div>

      {/* Centered Avatar */}
      <div className="relative -mt-10">
        <Avatar className="bg-blue-400 border-2 border-orange-500 z-40 h-20 w-20">
          <AvatarImage src={avatarUrl} />
        </Avatar>
      </div>
      <div className="mt-5 pb-3 text-center">
        <span className="font-medium">{name}</span>
      </div>
    </div>
  );
};

export default ProfileHeader;