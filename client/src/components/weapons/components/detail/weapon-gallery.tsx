import React, { useState } from 'react';

import { CachedImage } from '@/components/utils';

interface WeaponGalleryProps {
  images: string[];
  weaponName: string;
}

const WeaponGallery: React.FC<WeaponGalleryProps> = ({
  images,
  weaponName,
}) => {
  const [selectedImage, setSelectedImage] = useState(0);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-2">Gallery</h2>
        <p className="text-sm text-gray-500">
          View different angles and artwork for {weaponName}
        </p>
      </div>

      {/* Main image display */}
      <div className="w-full h-96 bg-gray-900 rounded-lg overflow-hidden flex items-center justify-center">
        <CachedImage
          src={images[selectedImage]}
          alt={`${weaponName} - Image ${selectedImage + 1}`}
          className="max-w-full max-h-full object-contain"
        />
      </div>

      {/* Thumbnail strip */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {images.map((image, index) => (
          <button
            key={index}
            onClick={() => setSelectedImage(index)}
            className={`flex-shrink-0 w-20 h-20 rounded border-2 overflow-hidden transition-all ${
              selectedImage === index
                ? 'border-amber-500 scale-110'
                : 'border-gray-600 hover:border-gray-400'
            }`}
          >
            <CachedImage
              src={image}
              alt={`Thumbnail ${index + 1}`}
              className="w-full h-full object-cover"
            />
          </button>
        ))}
      </div>
    </div>
  );
};

export default WeaponGallery;
