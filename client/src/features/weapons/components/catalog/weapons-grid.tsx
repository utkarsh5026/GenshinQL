import React, { useState } from 'react';

import type { WeaponSummary } from '../../types';
import { getRarityColor } from '../../utils';
import WeaponCard from '../shared/card/weapon-card';

interface WeaponsDetailedGridProps {
  weapons: WeaponSummary[];
  selectedRarity: number | null;
  onRarityChange: (rarity: number | null) => void;
}

/**
 * WeaponsDetailedGrid component displays a grid of weapon cards with search and filtering.
 */
const WeaponsDetailedGrid: React.FC<WeaponsDetailedGridProps> = ({
  weapons,
  selectedRarity,
  onRarityChange,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const handleClearFilters = () => {
    setSearchTerm('');
    onRarityChange(null);
  };

  const handleRemoveRarityFilter = () => {
    onRarityChange(null);
  };

  const filteredWeapons = weapons
    .filter((weapon) =>
      selectedRarity ? weapon.rarity === selectedRarity : true
    )
    .filter((weapon) =>
      weapon.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

  const hasActiveFilters = searchTerm !== '' || selectedRarity !== null;

  return (
    <div className="mt-6 sm:mt-8 space-y-4 sm:space-y-6">
      {/* Search Bar - Primary Action */}
      <div className="flex justify-center">
        <div className="relative w-full max-w-3xl">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search weapons by name..."
            className="w-full px-4 py-3 sm:py-3.5 pl-11 sm:pl-12 pr-10 text-base rounded-xl border border-input bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all shadow-sm hover:shadow-md"
          />
          <svg
            className="absolute left-3.5 sm:left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1.5 rounded-md hover:bg-accent"
              aria-label="Clear search"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 bg-muted/30 rounded-lg border border-border/50">
          <div className="flex items-center gap-2 flex-wrap justify-center sm:justify-start">
            <span className="text-sm text-muted-foreground font-medium">
              Active:
            </span>

            {/* Search Term Chip */}
            {searchTerm && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary rounded-full text-sm border border-primary/20">
                <svg
                  className="h-3.5 w-3.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                <span className="font-medium max-w-37.5 truncate">
                  "{searchTerm}"
                </span>
                <button
                  onClick={() => setSearchTerm('')}
                  className="hover:bg-primary/20 rounded-full p-0.5 transition-colors"
                  aria-label="Remove search filter"
                >
                  <svg
                    className="h-3.5 w-3.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            )}

            {/* Rarity Chip */}
            {selectedRarity !== null &&
              (() => {
                const colors = getRarityColor(selectedRarity);
                return (
                  <div
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm border ${colors.background} ${colors.text}`}
                  >
                    <span className="font-medium">
                      {selectedRarity}★ Rarity
                    </span>
                    <button
                      onClick={handleRemoveRarityFilter}
                      className="hover:bg-black/10 dark:hover:bg-white/10 rounded-full p-0.5 transition-colors"
                      aria-label="Remove rarity filter"
                    >
                      <svg
                        className="h-3.5 w-3.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                );
              })()}
          </div>

          {/* Results Counter & Clear All */}
          <div className="flex items-center gap-3 text-sm">
            <span className="text-muted-foreground font-medium">
              {filteredWeapons.length} weapon
              {filteredWeapons.length !== 1 ? 's' : ''}
            </span>
            <button
              onClick={handleClearFilters}
              className="text-primary hover:text-primary/80 font-medium transition-colors flex items-center gap-1 hover:underline"
            >
              Clear all
            </button>
          </div>
        </div>
      )}

      {/* Weapons Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 auto-rows-fr">
        {filteredWeapons.length > 0 ? (
          filteredWeapons.map((weapon, index) => (
            <div key={weapon.name} className="h-full">
              <WeaponCard weapon={weapon} index={index} />
            </div>
          ))
        ) : (
          <div className="col-span-full flex flex-col items-center justify-center py-16 sm:py-20 text-center">
            <div className="relative mb-6">
              <svg
                className="h-16 w-16 sm:h-20 sm:w-20 text-muted-foreground/30"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="text-foreground text-lg sm:text-xl font-semibold mb-2">
              No weapons found
            </h3>
            <p className="text-muted-foreground text-sm sm:text-base max-w-md">
              Try adjusting your search term or filters to find what you're
              looking for
            </p>
            {hasActiveFilters && (
              <button
                onClick={handleClearFilters}
                className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium text-sm"
              >
                Clear all filters
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default WeaponsDetailedGrid;
