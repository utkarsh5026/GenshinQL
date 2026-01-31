import React from 'react';

import { CachedImage } from '@/components/utils/CachedImage';

type DisplaySize = 'sm' | 'md' | 'lg';

interface ElementDisplayProps {
  element: string;
  elementUrl: string;
  size?: DisplaySize;
  showLabel?: boolean;
}

export const ElementDisplay: React.FC<ElementDisplayProps> = ({
  element,
  elementUrl,
  size = 'md',
  showLabel = true,
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  const iconSize = {
    sm: 16,
    md: 24,
    lg: 32,
  };

  const textSize = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  return (
    <div className="flex items-center space-x-2">
      <CachedImage
        src={elementUrl}
        alt={element}
        width={iconSize[size]}
        height={iconSize[size]}
        className={`rounded-full ${sizeClasses[size]}`}
      />
      {showLabel && <span className={textSize[size]}>{element}</span>}
    </div>
  );
};

interface RarityDisplayProps {
  rarity: string;
  size?: DisplaySize;
}

export const RarityDisplay: React.FC<RarityDisplayProps> = ({
  rarity,
  size = 'md',
}) => {
  const rarityNum = Number.parseInt(rarity, 10);
  const starColor = rarityNum === 5 ? 'text-yellow-500' : 'text-violet-500';

  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-lg',
    lg: 'text-xl',
  };

  return (
    <div className="flex items-center justify-center">
      {Array.from({ length: rarityNum }).map((_, index) => (
        <span key={index} className={`${starColor} ${sizeClasses[size]}`}>
          ★
        </span>
      ))}
    </div>
  );
};
