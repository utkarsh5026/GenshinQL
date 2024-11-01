import React from "react";
import { Avatar, AvatarImage } from "../ui/avatar";

interface ProfileHeaderProps {
  name: string;
  avatarUrl: string;
  coverUrl: string;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  name,
  avatarUrl,
  coverUrl,
}) => {
  return (
    <div className="relative w-full shadow-md">
      {/* Cover Image */}
      <div className="w-full h-20 overflow-hidden rounded-md relative">
        <div className="absolute inset-0 bg-gradient-to-r from-black/30 to-white/30 z-10" />
        <img
          src={coverUrl}
          alt="Profile Cover"
          className="w-full h-full object-cover object-center"
        />
      </div>

      {/* Centered Avatar */}
      <div className="absolute left-1/2 -translate-x-1/2 top-14">
        <Avatar className="bg-blue-400 border-2 border-orange-500">
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
