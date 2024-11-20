import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Skeleton } from "../ui/skeleton";
import { motion } from "framer-motion";

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
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.05, ease: "easeInOut" }}
      >
        <AvatarImage
          className={imageClassName}
          src={url}
          onLoadingStatusChange={(status) => {
            setIsLoading(status === "loading");
          }}
        />
      </motion.div>
      <AvatarFallback>
        {isLoading ? <Skeleton className="w-full h-full rounded-full" /> : name}
      </AvatarFallback>
    </Avatar>
  );
};

export default AvatarWithSkeleton;
