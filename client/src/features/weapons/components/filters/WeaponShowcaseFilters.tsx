import { Filter, Search, X } from 'lucide-react';
import React from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface WeaponShowcaseFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  selectedRarities: number[];
  onToggleRarity: (rarity: number) => void;
  onClearAll: () => void;
}

/**
 * WeaponShowcaseFilters component provides search and rarity filtering
 * for the weapon showcase display
 */
const WeaponShowcaseFilters: React.FC<WeaponShowcaseFiltersProps> = ({
  searchQuery,
  onSearchChange,
  selectedRarities,
  onToggleRarity,
  onClearAll,
}) => {
  const activeFilterCount = selectedRarities.length;
  const rarities = [1, 2, 3, 4, 5];

  const renderRarityStars = (rarity: number) => {
    const starColor = rarity === 5 ? 'text-yellow-500' : 'text-violet-500';
    return (
      <div className="flex items-center gap-px">
        {Array.from({ length: rarity }).map((_, index) => (
          <span
            key={`${rarity}-star-${index}`}
            className={`${starColor} text-base`}
          >
            ★
          </span>
        ))}
      </div>
    );
  };

  const renderRarityChip = (rarity: number) => {
    const starColor = rarity === 5 ? 'text-yellow-500' : 'text-violet-500';
    return (
      <div
        key={rarity}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm border border-primary/20 hover:bg-primary/15 transition-colors"
      >
        <div className="flex items-center">
          {Array.from({ length: rarity }).map((_, index) => (
            <span key={index} className={`${starColor} text-sm`}>
              ★
            </span>
          ))}
        </div>
        <button
          onClick={() => onToggleRarity(rarity)}
          className="ml-1 hover:bg-primary/20 rounded-full p-0.5 transition-colors"
          aria-label={`Remove ${rarity} star filter`}
          type="button"
        >
          <X className="h-3 w-3" />
        </button>
      </div>
    );
  };

  return (
    <div className="sticky top-0 z-20 bg-background border-b shadow-sm">
      {/* Controls row */}
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 p-3 sm:p-4">
        {/* Search - full width on mobile */}
        <div className="flex-1 w-full sm:w-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search weapons..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 h-9 sm:h-10"
            />
          </div>
        </div>

        {/* Filter button - full width on mobile */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-full sm:w-auto justify-center sm:justify-start relative"
            >
              <Filter className="mr-2 h-4 w-4" />
              Filters
              {activeFilterCount > 0 && (
                <Badge className="ml-2 h-5 min-w-5 text-xs px-1.5">
                  {activeFilterCount}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>

          <PopoverContent
            className="w-[calc(100vw-2rem)] sm:w-80 max-h-[70vh] overflow-y-auto"
            align="start"
            side="bottom"
          >
            <div className="space-y-4">
              {/* Header */}
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-base">Filters</h4>
                {activeFilterCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onClearAll}
                    className="h-8 text-xs"
                  >
                    Clear all
                  </Button>
                )}
              </div>

              {/* Rarity Filter Section */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Rarity
                </label>
                <div className="space-y-2">
                  {rarities.map((rarity) => (
                    <div
                      key={rarity}
                      className="flex items-center space-x-2 cursor-pointer transition-all hover:bg-accent/50 rounded-md p-1"
                      onClick={() => onToggleRarity(rarity)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          onToggleRarity(rarity);
                        }
                      }}
                      role="checkbox"
                      aria-checked={selectedRarities.includes(rarity)}
                      tabIndex={0}
                    >
                      <Checkbox
                        id={`rarity-${rarity}`}
                        checked={selectedRarities.includes(rarity)}
                        onCheckedChange={() => onToggleRarity(rarity)}
                        onClick={(e) => e.stopPropagation()}
                      />
                      <div className="flex items-center gap-1 flex-1">
                        {renderRarityStars(rarity)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Active Filter Chips - only show if filters are active */}
      {(activeFilterCount > 0 || searchQuery.trim() !== '') && (
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 px-3 sm:px-4 pb-2 sm:pb-3">
          <span className="text-xs sm:text-sm text-muted-foreground">
            Filters:
          </span>

          {/* Search query chip */}
          {searchQuery.trim() !== '' && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm border border-primary/20 hover:bg-primary/15 transition-colors">
              <span className="text-xs">Search: {searchQuery}</span>
              <button
                onClick={() => onSearchChange('')}
                className="ml-1 hover:bg-primary/20 rounded-full p-0.5 transition-colors"
                aria-label="Clear search"
                type="button"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          )}

          {/* Rarity chips */}
          {selectedRarities.map((rarity) => renderRarityChip(rarity))}

          {/* Clear all button */}
          {(activeFilterCount > 0 || searchQuery.trim() !== '') && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                onClearAll();
                onSearchChange('');
              }}
              className="text-muted-foreground hover:text-foreground h-7 text-xs"
            >
              Clear all
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default WeaponShowcaseFilters;
