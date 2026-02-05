import React, { useState } from 'react';

import { Card } from '@/components/ui/card';
import { getRarityBorderClass } from '@/lib/rarityColors';
import { WeaponDetailedType } from '@/types';

import WeaponAscension from './weapon-ascension';
import WeaponGallery from './weapon-gallery';
import WeaponMaterials from './weapon-materials';
import WeaponProfile from './weapon-profile';
import WeaponProfileHeader from './weapon-profile-header';

interface WeaponDescriptionProps {
  weapon: WeaponDetailedType | null;
}

type WeaponMenuItem = 'Profile' | 'Ascension' | 'Materials' | 'Gallery';

const menuItems: WeaponMenuItem[] = [
  'Profile',
  'Ascension',
  'Materials',
  'Gallery',
];

const WeaponDescription: React.FC<WeaponDescriptionProps> = ({ weapon }) => {
  const [selectedMenuItem, setSelectedMenuItem] =
    useState<WeaponMenuItem>('Profile');

  if (!weapon) return <div>Weapon not found</div>;

  const rarityBorder = getRarityBorderClass(weapon.rarity);

  return (
    <div
      className={`relative flex flex-col h-[90vh] overflow-auto ${rarityBorder} rounded-lg scrollbar-hide`}
    >
      {/* Background image with weapon primary image */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `url(${weapon.images[0] || weapon.iconUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          opacity: 0.05,
        }}
      />

      <div className="relative z-10 flex gap-4 p-4 h-full">
        {/* Sidebar - 25% width */}
        <div className="w-1/4 min-w-62.5">
          <WeaponProfileHeader
            name={weapon.name}
            iconUrl={weapon.iconUrl}
            rarity={weapon.rarity}
            images={weapon.images}
          />

          {/* Menu buttons */}
          <div className="flex flex-col gap-2 mt-4">
            {menuItems.map((item) => (
              <button
                onClick={() => setSelectedMenuItem(item)}
                key={item}
                className={`w-full text-left text-sm text-gray-500 border-2 border-white rounded-lg p-2 hover:bg-white hover:text-black cursor-pointer transition-all duration-300 ${
                  selectedMenuItem === item ? 'bg-white text-black' : ''
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        {/* Content area - 75% width */}
        <div className="flex grow overflow-auto h-[calc(100%-2rem)] scrollbar-hide">
          {selectedMenuItem === 'Profile' && (
            <WeaponCard>
              <WeaponProfile weapon={weapon} />
            </WeaponCard>
          )}
          {selectedMenuItem === 'Ascension' && (
            <WeaponCard>
              <WeaponAscension phases={weapon.ascension.phases} />
            </WeaponCard>
          )}
          {selectedMenuItem === 'Materials' && (
            <WeaponCard>
              <WeaponMaterials materials={weapon.materials} />
            </WeaponCard>
          )}
          {selectedMenuItem === 'Gallery' && (
            <WeaponCard>
              <WeaponGallery images={weapon.images} weaponName={weapon.name} />
            </WeaponCard>
          )}
        </div>
      </div>
    </div>
  );
};

// Wrapper card component
interface WeaponCardProps {
  children: React.ReactNode;
}

const WeaponCard: React.FC<WeaponCardProps> = ({ children }) => {
  return (
    <Card className="p-4 h-full w-full overflow-auto scrollbar-hide bg-transparent">
      {children}
    </Card>
  );
};

export default WeaponDescription;
