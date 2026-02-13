import { motion } from 'framer-motion';
import type React from 'react';

import { Skeleton } from '@/components/ui/skeleton';
import AvatarWithSkeleton from '@/components/utils/AvatarWithSkeleton';
import { useRandomSticker } from '@/hooks/useRandomSticker';
import { cn } from '@/lib/utils';
import type { AvatarSize } from '@/utils/avatar-utils';
import { AVATAR_SIZE_CLASSES } from '@/utils/avatar-utils';

interface RandomStickerAvatarProps {
  size?: AvatarSize;
  className?: string;
}

export const RandomStickerAvatar: React.FC<RandomStickerAvatarProps> = ({
  size = 'sm',
  className,
}) => {
  const { sticker, loading, error } = useRandomSticker();

  if (error) {
    return null;
  }

  if (loading || !sticker) {
    return (
      <Skeleton
        className={cn('rounded-full', AVATAR_SIZE_CLASSES[size], className)}
      />
    );
  }

  return (
    <motion.div
      className={cn(
        'hover:scale-110',
        'transition-transform duration-300 ease-out',
        'transform-gpu will-change-transform',
        'cursor-pointer'
      )}
      animate={{
        y: [0, -4, 0, 4, 0],
        rotate: [0, -2, 2, -2, 0],
      }}
      transition={{
        y: {
          duration: 4.5,
          ease: 'easeInOut',
          repeat: Infinity,
          repeatType: 'loop' as const,
        },
        rotate: {
          duration: 7,
          ease: 'easeInOut',
          repeat: Infinity,
          repeatType: 'loop' as const,
        },
      }}
    >
      <AvatarWithSkeleton
        name={sticker.characterName}
        url={sticker.url}
        avatarClassName={cn(AVATAR_SIZE_CLASSES[size], className)}
      />
    </motion.div>
  );
};
