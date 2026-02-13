import { Star } from 'lucide-react';
import React from 'react';

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { getElementColor } from '@/lib/elementColors';
import { getRarityBorderClass, getRarityStarColor } from '@/lib/rarityColors';
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

const starSizes = {
  sm: 'h-2 w-2',
  md: 'h-2.5 w-2.5',
  lg: 'h-3 w-3',
};

export const EnhancedCharacterCard: React.FC<EnhancedCharacterCardProps> = ({
  character,
  size = 'md',
}) => {
  const rarity = parseInt(character.rarity);
  const rarityBorderClass = getRarityBorderClass(rarity);
  const rarityStarColor = getRarityStarColor(rarity);
  const elementColor = getElementColor(character.element);

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
          <div
            className="
              absolute top-0 left-0 right-0
              bg-gradient-to-b from-black/70 via-black/30 to-transparent
              px-1 py-0.5
              flex items-center justify-center gap-0.5
            "
          >
            {Array.from({ length: rarity }).map((_, index) => (
              <Star
                key={index}
                className={`${starSizes[size]} ${rarityStarColor} fill-current`}
              />
            ))}
          </div>

          {/* Element Badge Overlay (Bottom-Right) */}
          <div
            className={`
              absolute -bottom-0.5 -right-0.5
              ${elementBadgeSizes[size]}
              rounded-full
              border-2 border-background
              bg-${elementColor}
              flex items-center justify-center
              shadow-lg
            `}
            style={{ backgroundColor: `var(--${elementColor})` }}
          >
            <img
              src={character.elementUrl}
              alt={character.element}
              className="h-full w-full p-0.5"
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
