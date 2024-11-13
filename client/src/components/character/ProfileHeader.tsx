import React from "react";
import { Avatar, AvatarImage } from "../ui/avatar";
import { AnimationMedia } from "@/graphql/types";
import AnimatedCover from "./AnimatedCover";

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
  return (
    <div className="relative w-full shadow-md flex flex-col items-center border-2 border-white rounded-lg">
      <div className="w-full h-44 overflow-hidden rounded-md relative">
        <AnimatedCover
          animation={idleOne}
          fallbackUrl={fallbackCoverUrl}
          className="w-full opacity-60 z-10"
        />
      </div>

      {/* Centered Avatar */}
      <div className="relative -mt-10">
        <Avatar className="bg-blue-400 border-2 border-orange-500 z-40 h-20 w-20">
          <AvatarImage src={avatarUrl} />
        </Avatar>
      </div>

      {/* Name below avatar */}
      <div className="mt-5 pb-3 text-center">
        <span className="font-medium">{name}</span>
      </div>
    </div>
  );
};

export default ProfileHeader;
