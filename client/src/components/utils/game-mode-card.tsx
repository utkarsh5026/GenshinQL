import React from 'react';

import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface GameModeCardProps {
  bannerImage: string;
  backgroundImage?: string;
  header: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  bannerHeight?: string;
}

export const GameModeCard: React.FC<GameModeCardProps> = ({
  bannerImage,
  backgroundImage,
  header,
  children,
  className,
  bannerHeight = 'h-36',
}) => {
  return (
    <Card className={cn('overflow-hidden', className)}>
      {/* Hero Banner */}
      <div className={cn('relative', bannerHeight)}>
        <img
          src={bannerImage}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-linear-to-t from-card via-card/60 to-card/10" />
        <div className="relative z-10 flex flex-col justify-end h-full p-6 pb-3 space-y-1.5">
          {header}
        </div>
      </div>

      {/* Content with subtle background */}
      <div className="relative">
        {backgroundImage && (
          <div
            className="absolute inset-0 opacity-[0.06] bg-cover bg-center"
            style={{ backgroundImage: `url(${backgroundImage})` }}
          />
        )}
        <CardContent className="relative space-y-4 pt-4">
          {children}
        </CardContent>
      </div>
    </Card>
  );
};
