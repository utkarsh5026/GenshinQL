import { ChevronRight } from 'lucide-react';
import React, { useState } from 'react';

import { Avatar, AvatarImage } from '@/components/ui/avatar';
import { getRarityStarColor } from '@/lib/rarityColors';

interface WeaponProfileHeaderProps {
  name: string;
  iconUrl: string;
  rarity: number;
  images: string[];
}

const WeaponProfileHeader: React.FC<WeaponProfileHeaderProps> = ({
  name,
  iconUrl,
  rarity,
  images,
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const starColor = getRarityStarColor(rarity);
  const rarityStars = '★'.repeat(rarity);

  // Rarity-based glow colors using theme colors
  const rarityGlow =
    {
      1: 'shadow-common-400/50',
      2: 'shadow-uncommon-400/50',
      3: 'shadow-rare-400/50',
      4: 'shadow-epic-500/50',
      5: 'shadow-legendary-500/50',
    }[rarity] || 'shadow-white/50';

  const rarityBorderGlow =
    {
      1: 'hover:border-common-400',
      2: 'hover:border-uncommon-400',
      3: 'hover:border-rare-400',
      4: 'hover:border-epic-500',
      5: 'hover:border-legendary-500',
    }[rarity] || 'hover:border-white';

  return (
    <div
      className={`relative w-full shadow-xl flex flex-col items-center border-2 border-border ${rarityBorderGlow} rounded-lg overflow-hidden transition-all duration-300 hover:shadow-2xl group/card shrink-0`}
    >
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-linear-to-br from-background via-background/95 to-background/90 opacity-0 group-hover/card:opacity-100 transition-opacity duration-500" />

      {/* Cover image with navigation */}
      <div className="w-full h-44 overflow-hidden relative group/image bg-linear-to-b from-surface-50 to-card">
        {/* Gradient overlay for depth */}
        <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent z-10 pointer-events-none" />

        <img
          src={images[currentImageIndex] || iconUrl}
          alt={name}
          className="w-full h-full object-contain opacity-90 transition-transform duration-300 group-hover/image:scale-105"
        />

        {/* Shine effect on hover */}
        <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover/card:translate-x-full transition-transform duration-1000 pointer-events-none" />

        {images.length > 1 && (
          <button
            aria-label="Next image"
            onClick={handleNextImage}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 backdrop-blur-sm text-white p-2 rounded-full hover:bg-black/70 hover:scale-110 z-20 opacity-0 group-hover/image:opacity-100 transition-all duration-200"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        )}

        {/* Image indicator dots */}
        {images.length > 1 && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
            {images.map((_, idx) => (
              <div
                key={idx}
                className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                  idx === currentImageIndex
                    ? 'bg-white w-4'
                    : 'bg-white/50 hover:bg-white/75'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Centered weapon icon with glow */}
      <div className="relative -mt-10 z-20">
        <div
          className={`absolute inset-0 blur-xl ${rarityGlow} rounded-full animate-pulse`}
        />
        <Avatar
          className={`relative bg-linear-to-br from-surface-50 to-card border-4 border-border hover:border-white h-20 w-20 transition-all duration-300 hover:scale-110 shadow-2xl ${rarityGlow}`}
        >
          <AvatarImage src={iconUrl} className="p-1" />
        </Avatar>
      </div>

      {/* Weapon name and rarity */}
      <div className="relative mt-5 pb-4 text-center px-3 z-10">
        <span className="font-semibold text-lg block mb-2 tracking-wide drop-shadow-md">
          {name}
        </span>
        <div className="flex justify-center items-center gap-1">
          <span
            className={`text-2xl ${starColor} drop-shadow-lg transition-transform duration-300 hover:scale-110 inline-block`}
          >
            {rarityStars}
          </span>
        </div>
      </div>
    </div>
  );
};

export default WeaponProfileHeader;
