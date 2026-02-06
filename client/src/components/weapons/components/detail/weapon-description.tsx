import React, { useState } from 'react';

import { Card } from '@/components/ui/card';
import {
  getRarityClasses,
  getRarityHexColor,
} from '@/components/weapons/utils/color-map';
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
  const rarityClasses = getRarityClasses(weapon.rarity);
  const rarityHexColor = getRarityHexColor(weapon.rarity);

  return (
    <div
      className={`relative flex flex-col h-[90vh] overflow-auto ${rarityBorder} rounded-lg scrollbar-hide`}
    >
      <div className="relative z-10 flex flex-col md:flex-row gap-3 md:gap-4 p-3 md:p-4 h-full">
        <div className="w-full md:w-64 md:shrink-0">
          <WeaponProfileHeader
            name={weapon.name}
            iconUrl={weapon.iconUrl}
            rarity={weapon.rarity}
            images={weapon.images}
          />

          {/* Menu Navigation */}
          <nav className="flex flex-row md:flex-col gap-1.5 mt-3 md:mt-4 overflow-x-auto md:overflow-x-visible scrollbar-hide">
            {menuItems.map((item) => {
              const isActive = selectedMenuItem === item;
              return (
                <button
                  onClick={() => setSelectedMenuItem(item)}
                  key={item}
                  className={`
                    relative w-auto md:w-full text-left text-xs md:text-sm font-medium rounded-lg px-4 py-2.5
                    transition-all duration-300 ease-out
                    border border-transparent
                    whitespace-nowrap
                    ${
                      isActive
                        ? rarityClasses.active
                        : 'text-starlight-400 hover:text-starlight-200 hover:bg-midnight-700/50 hover:border-starlight-600/20'
                    }
                  `}
                  style={
                    isActive
                      ? { boxShadow: `0 0 12px ${rarityHexColor}20` }
                      : undefined
                  }
                >
                  {/* Active indicator bar */}
                  {isActive && (
                    <>
                      {/* Desktop: left vertical bar */}
                      <span
                        className={`hidden md:block absolute left-0 top-1/2 -translate-y-1/2 w-1 h-4 rounded-r-full ${rarityClasses.indicator}`}
                      />
                      {/* Mobile: bottom horizontal bar */}
                      <span
                        className={`md:hidden absolute bottom-0 left-1/2 -translate-x-1/2 h-1 w-4 rounded-t-full ${rarityClasses.indicator}`}
                      />
                    </>
                  )}
                  {item}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content area - Fixed width */}
        <div className="flex shrink-0 grow-0 w-full md:w-[calc(100%-17rem)] overflow-auto h-full md:h-[calc(100%-2rem)] scrollbar-hide">
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
    <Card className="p-3 md:p-4 h-full w-full overflow-auto scrollbar-hide bg-transparent">
      {children}
    </Card>
  );
};

export default WeaponDescription;
