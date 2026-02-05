import React, { useState } from 'react';

import { Card } from '@/components/ui/card';
import { getRarityBorderClass } from '@/lib/rarityColors';
import { WeaponDetailedType } from '@/types';

import WeaponAscension from './weapon-ascension';
import WeaponMaterials from './weapon-materials';
import WeaponProfile from './weapon-profile';
import WeaponProfileHeader from './weapon-profile-header';

interface WeaponDescriptionProps {
  weapon: WeaponDetailedType | null;
}

type WeaponMenuItem = 'Profile' | 'Ascension' | 'Materials' | 'Gallery';

const menuItems: WeaponMenuItem[] = ['Profile', 'Ascension', 'Materials'];

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

      <div className="relative z-10 flex gap-4 p-4 h-full">
        {/* Sidebar - Fixed width */}
        <div className="w-64 shrink-0">
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
                className={`w-full text-left text-sm text-muted-foreground border-2 border-border rounded-lg p-2 hover:bg-card hover:text-card-foreground cursor-pointer transition-all duration-300 ${
                  selectedMenuItem === item
                    ? 'bg-card text-card-foreground'
                    : ''
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        {/* Content area - Fixed width */}
        <div className="flex shrink-0 grow-0 w-[calc(100%-17rem)] overflow-auto h-[calc(100%-2rem)] scrollbar-hide">
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
