import React from 'react';

import { RarityStars } from '@/components/ui/genshin-game-icons';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { CachedImage } from '@/features/cache';
import { getRarityBorderClass } from '@/lib/rarityColors';
import type { Character } from '@/types';

interface EnhancedCharacterCardProps {
  character: Character;
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = {
  sm: 'h-12 w-12',
  md: 'h-16 w-16',
  lg: 'h-20 w-20',
};

const elementBadgeSizes = {
  sm: 'h-4 w-4',
  md: 'h-5 w-5',
  lg: 'h-6 w-6',
};

export const EnhancedCharacterCard: React.FC<EnhancedCharacterCardProps> = ({
  character,
  size = 'md',
}) => {
  const rarity = parseInt(character.rarity);
  const rarityBorderClass = getRarityBorderClass(rarity);

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div
          className={`
            relative rounded-lg overflow-hidden
            ${sizeClasses[size]}
            ${rarityBorderClass}
            transition-transform duration-200
            hover:scale-105
            cursor-grab active:cursor-grabbing
          `}
        >
          {/* Character Icon */}
          <img
            src={character.iconUrl}
            alt={character.name}
            className="h-full w-full object-cover"
            loading="lazy"
          />

          {/* Rarity Stars Overlay (Top) */}
          <div className="absolute top-0 left-0 right-0 bg-linear-to-b from-black/70 via-black/30 to-transparent px-1 py-0.5 flex items-center justify-center">
            <RarityStars rarity={rarity} size="xs" />
          </div>

          {/* Element Badge Overlay (Bottom-Right) */}
          <div
            className={`absolute -bottom-0.5 -right-0.5 ${elementBadgeSizes[size]} rounded-full border-2 border-background bg-background/80 flex items-center justify-center shadow-lg`}
          >
            <CachedImage
              src={character.elementUrl}
              alt={character.element}
              width={20}
              height={20}
              className="h-full w-full p-0.5 object-contain"
              skeletonShape="circle"
              skeletonSize="sm"
            />
          </div>
        </div>
      </TooltipTrigger>

      <TooltipContent side="top" className="max-w-xs">
        <div className="space-y-1">
          <p className="font-semibold">{character.name}</p>
          <div className="text-xs text-muted-foreground space-y-0.5">
            <p>
              ⭐ {character.rarity}-Star • {character.element}
            </p>
            <p>
              {character.weaponType} • {character.region}
            </p>
          </div>
        </div>
      </TooltipContent>
    </Tooltip>
  );
};
