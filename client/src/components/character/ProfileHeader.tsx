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
    <div className="relative w-full shadow-md flex flex-col items-center">
      <div className="w-full h-32 overflow-hidden rounded-md relative">
        <img
          src={coverUrl}
          alt="Profile Cover"
          className="w-full h-full object-cover opacity-40 z-10"
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
