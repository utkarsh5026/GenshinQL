import React, { useState } from 'react';

import { WeaponDetailed } from '@/stores/useWeaponsStore';

import { getRarityColor } from '../../utils/color-map';
import WeaponCard from '../shared/weapon-card';

interface WeaponsDetailedGridProps {
  weapons: WeaponDetailed[];
}

/**
 * WeaponsDetailedGrid component displays a grid of weapon cards with filtering capabilities.
 *
 * Features:
 * - Search weapons by name
 * - Filter weapons by rarity (1-5 stars)
 * - Responsive grid layout
 *
 * @component
 * @param {Object} props
 * @param {Weapon[]} props.weapons - Array of weapon objects to display
 */
const WeaponsDetailedGrid: React.FC<WeaponsDetailedGridProps> = ({
  weapons,
}) => {
  const [selectedRarity, setSelectedRarity] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const handleRarityClick = (rarity: number) => {
    setSelectedRarity(rarity);
  };

  const handleClearSearch = () => {
    setSearchTerm('');
  };

  const filteredWeapons = weapons
    .filter((weapon) =>
      selectedRarity ? weapon.rarity === selectedRarity : true
    )
    .filter((weapon) =>
      weapon.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

  return (
    <div className="mt-8">
      {/* Search Input */}
      <div className="flex justify-center mb-6">
        <div className="relative w-full max-w-md">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search weapons..."
            className="w-full px-4 py-2.5 rounded-lg border border-input bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
          />
          {searchTerm && (
            <button
              onClick={handleClearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Clear search"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Rarity Filter Buttons */}
      <div className="flex flex-wrap gap-2 mb-6 justify-center">
        {[1, 2, 3, 4, 5].map((rarity) => {
          const colors = getRarityColor(rarity);
          const isSelected = selectedRarity === rarity;

          return (
            <button
              key={rarity}
              onClick={() => handleRarityClick(rarity)}
              className={`px-4 py-2 rounded-full font-medium transition-all duration-200 ${
                isSelected
                  ? `${colors.background} ${colors.text} ring-2 ${colors.border} shadow-lg scale-105`
                  : `bg-surface-200 dark:bg-surface-200 text-muted-foreground hover:${colors.background} hover:${colors.text} hover:scale-105`
              }`}
            >
              {rarity} ★
            </button>
          );
        })}
      </div>

      {/* Weapons Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
        {filteredWeapons.map((weapon) => (
          <WeaponCard key={weapon.name} weapon={weapon} />
        ))}
      </div>
    </div>
  );
};

export default WeaponsDetailedGrid;
