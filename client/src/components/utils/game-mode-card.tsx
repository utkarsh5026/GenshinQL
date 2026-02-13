import React from 'react';

import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface GameModeCardProps {
  bannerImage?: string;
  backgroundImage?: string;
  icon: React.ReactElement;
  title: string;
  badges?: React.ReactNode;
  description?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  bannerHeight?: string;
}

export const GameModeCard: React.FC<GameModeCardProps> = ({
  bannerImage,
  backgroundImage,
  icon,
  title,
  badges,
  description,
  children,
  className,
  bannerHeight = 'h-36',
}) => {
  const hasBanner = !!bannerImage;

  const headerContent = (
    <>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {React.cloneElement(icon, {
            className: cn(icon.props.className, hasBanner && 'drop-shadow-md'),
          })}
          <span
            className={cn(
              'text-lg font-semibold leading-none tracking-tight',
              hasBanner && 'text-white drop-shadow-md'
            )}
          >
            {title}
          </span>
        </div>
        {badges && <div className="flex items-center gap-1.5">{badges}</div>}
      </div>
      {description && (
        <div
          className={cn(
            'flex items-start gap-1.5 mt-1 text-sm',
            hasBanner ? 'text-white/80' : 'text-muted-foreground'
          )}
        >
          {description}
        </div>
      )}
    </>
  );

  return (
    <Card className={cn('overflow-hidden', className)}>
      {/* Hero Banner (with image) or plain header */}
      {bannerImage ? (
        <div className={cn('relative', bannerHeight)}>
          <img
            src={bannerImage}
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-linear-to-t from-card via-card/60 to-card/10" />
          <div className="relative z-10 flex flex-col justify-end h-full p-6 pb-3 space-y-1.5">
            {headerContent}
          </div>
        </div>
      ) : (
        <div className="flex flex-col space-y-1.5 p-6 pb-3">
          {headerContent}
        </div>
      )}

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
