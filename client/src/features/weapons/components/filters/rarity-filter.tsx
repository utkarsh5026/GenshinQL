import React from 'react';

import { cn } from '@/lib/utils';

import { getRarityColor } from '../../utils/color-map';

interface RarityFilterProps {
  selectedRarities: number[];
  availableRarities: number[];
  onToggleRarity: (rarity: number) => void;
  variant?: 'default' | 'midnight';
}

/**
 * Rarity filter component with star symbols
 * Displays "All" button + individual rarity buttons (4★, 5★, etc.)
 * Mobile-responsive with compact sizing
 */
export const RarityFilter: React.FC<RarityFilterProps> = ({
  selectedRarities,
  availableRarities,
  onToggleRarity,
}) => {
  const hasSelection = selectedRarities.length > 0;

  const handleClearAll = () => {
    selectedRarities.forEach((rarity) => onToggleRarity(rarity));
  };

  const getRarityButtonClasses = (rarity: number, isSelected: boolean) => {
    const colors = getRarityColor(rarity);

    if (isSelected) {
      return cn('bg-primary/20 border-primary', colors?.text || 'text-primary');
    }

    return 'bg-muted/30 border-border/30 text-muted-foreground hover:bg-muted/50';
  };

  return (
    <div className="flex items-center gap-2">
      {/* Optional "Rarity:" label - hidden on mobile */}
      <span className="text-xs text-muted-foreground font-medium shrink-0 hidden sm:inline">
        Rarity:
      </span>

      <div className="flex gap-1.5">
        {/* "All" button to clear selection */}
        <button
          onClick={handleClearAll}
          className={cn(
            'shrink-0 px-2 py-1 text-xs sm:px-2.5 sm:py-1.5 sm:text-sm rounded-md font-medium border transition-all',
            !hasSelection
              ? 'bg-primary/20 border-primary text-primary'
              : 'bg-muted/30 border-border/30 text-muted-foreground hover:bg-muted/50'
          )}
          type="button"
          aria-label="Show all rarities"
          aria-pressed={!hasSelection}
        >
          All
        </button>

        {/* Individual rarity buttons */}
        {availableRarities.map((rarity) => {
          const isSelected = selectedRarities.includes(rarity);

          return (
            <button
              key={rarity}
              onClick={() => onToggleRarity(rarity)}
              className={cn(
                'shrink-0 px-2 py-1 text-xs sm:px-2.5 sm:py-1.5 sm:text-sm rounded-md font-medium border transition-all',
                getRarityButtonClasses(rarity, isSelected)
              )}
              type="button"
              aria-label={`Filter by ${rarity} star rarity`}
              aria-pressed={isSelected}
            >
              {rarity}★
            </button>
          );
        })}
      </div>
    </div>
  );
};
