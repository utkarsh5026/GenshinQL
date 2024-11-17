import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Skeleton } from "../ui/skeleton";

interface AvatarWithSkeletonProps {
  name: string;
  url: string;
  avatarClassName?: string;
  imageClassName?: string;
}

const AvatarWithSkeleton: React.FC<AvatarWithSkeletonProps> = ({
  name,
  url,
  avatarClassName,
  imageClassName,
}) => {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <Avatar className={avatarClassName}>
      <AvatarImage
        className={imageClassName}
        src={url}
        onLoadingStatusChange={(status) => {
          setIsLoading(status === "loading");
        }}
      />
      <AvatarFallback>
        {isLoading ? <Skeleton className="w-full h-full rounded-full" /> : name}
      </AvatarFallback>
    </Avatar>
  );
};

export default AvatarWithSkeleton;
