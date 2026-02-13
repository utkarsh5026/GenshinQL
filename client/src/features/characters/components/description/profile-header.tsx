import { ChevronRight } from 'lucide-react';
import React, { useState } from 'react';

import { Avatar } from '@/components/ui/avatar';
import { AnimatedCover } from '@/components/utils';
import { CachedImage } from '@/features/cache/components/cached-asset';
import { AnimationMedia } from '@/types';

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
  const [currentAnimation, setCurrentAnimation] = useState<'one' | 'two'>(
    'one'
  );

  const handleNextAnimation = () => {
    setCurrentAnimation(currentAnimation === 'one' ? 'two' : 'one');
  };

  return (
    <div className="relative w-full flex flex-col items-center rounded-xl overflow-hidden bg-midnight-800/50 border border-midnight-600/40 shadow-lg">
      <div className="w-full h-48 overflow-hidden relative group">
        <AnimatedCover
          animation={currentAnimation === 'one' ? idleOne : idleTwo}
          fallbackUrl={fallbackCoverUrl}
          className="w-full h-full object-cover"
        />

        <div className="absolute inset-0 bg-linear-to-t from-midnight-900/90 via-midnight-900/20 to-transparent pointer-events-none" />

        {idleTwo && (
          <button
            aria-label="Next animation"
            onClick={handleNextAnimation}
            className="absolute right-3 top-1/2 -translate-y-1/2 bg-midnight-800/70 backdrop-blur-sm text-starlight-300 p-2 rounded-full border border-starlight-600/30 hover:bg-midnight-700/80 hover:text-celestial-400 hover:border-celestial-500/50 z-20 opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-lg"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        )}
      </div>

      <div className="relative -mt-12 z-10">
        <div
          className="p-1 rounded-full bg-linear-to-br from-celestial-400 via-celestial-500 to-celestial-600 shadow-lg"
          style={{ boxShadow: '0 0 20px rgba(255, 200, 100, 0.3)' }}
        >
          <Avatar className="h-20 w-20 border-2 border-midnight-900 bg-midnight-800">
            <CachedImage
              src={avatarUrl}
              alt={name}
              className="object-cover rounded-full"
              skeletonShape="circle"
              skeletonSize="lg"
            />
          </Avatar>
        </div>
      </div>

      <div className="mt-4 pb-4 text-center px-4">
        <h2 className="text-lg font-semibold text-foreground tracking-wide">
          {name}
        </h2>
        <div className="mt-1.5 w-12 h-0.5 mx-auto bg-linear-to-r from-transparent via-celestial-500/60 to-transparent rounded-full" />
      </div>
    </div>
  );
};

export default ProfileHeader;
