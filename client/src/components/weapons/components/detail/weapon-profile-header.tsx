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

  return (
    <div className="relative w-full shadow-md flex flex-col items-center border-2 border-white rounded-lg">
      {/* Cover image with navigation */}
      <div className="w-full h-44 overflow-hidden rounded-md relative group bg-gray-900">
        <img
          src={images[currentImageIndex] || iconUrl}
          alt={name}
          className="w-full h-full object-contain opacity-90"
        />
        {images.length > 1 && (
          <button
            aria-label="Next image"
            onClick={handleNextImage}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 z-20 opacity-0 group-hover:opacity-100 transition-all duration-200"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        )}
      </div>

      {/* Centered weapon icon */}
      <div className="relative -mt-10">
        <Avatar className="bg-gray-800 border-4 border-white z-40 h-20 w-20">
          <AvatarImage src={iconUrl} />
        </Avatar>
      </div>

      {/* Weapon name and rarity */}
      <div className="mt-5 pb-3 text-center px-2">
        <span className="font-medium block mb-1">{name}</span>
        <span className={`text-2xl ${starColor}`}>{rarityStars}</span>
      </div>
    </div>
  );
};

export default WeaponProfileHeader;
