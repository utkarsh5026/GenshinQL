import React from "react";
import { Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { CachedImage } from "@/components/utils/CachedImage";
import FilterChip from "./FilterChip";

interface FilterOption {
  name: string;
  iconUrl: string;
}

interface FilterBarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  selectedElements: string[];
  selectedRarities: string[];
  selectedRegions: string[];
  uniqueElements: FilterOption[];
  uniqueRarities: string[];
  uniqueRegions: FilterOption[];
  onToggleElement: (element: string) => void;
  onToggleRarity: (rarity: string) => void;
  onToggleRegion: (region: string) => void;
  onClearAll: () => void;
}

const FilterBar: React.FC<FilterBarProps> = ({
  searchQuery,
  onSearchChange,
  selectedElements,
  selectedRarities,
  selectedRegions,
  uniqueElements,
  uniqueRarities,
  uniqueRegions,
  onToggleElement,
  onToggleRarity,
  onToggleRegion,
  onClearAll,
}) => {
  const activeFilterCount =
    selectedElements.length + selectedRarities.length + selectedRegions.length;

  const renderRarityStars = (rarity: string) => {
    const rarityNum = Number.parseInt(rarity, 10);
    const starColor = rarityNum === 5 ? "text-yellow-500" : "text-violet-500";

    return (
      <div className="flex items-center">
        {Array.from({ length: rarityNum }).map((_, index) => (
          <span key={index} className={`${starColor} text-base`}>
            ★
          </span>
        ))}
      </div>
    );
  };

  return (
    <div className="sticky top-0 z-10 bg-background border-b shadow-sm">
      {/* Controls row */}
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 p-3 sm:p-4">
        {/* Search - full width on mobile */}
        <div className="flex-1 w-full sm:w-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search characters..."
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

              {/* Element Filter Section */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Element
                </label>
                <div className="space-y-2">
                  {uniqueElements.map((element) => (
                    <div
                      key={element.name}
                      className="flex items-center space-x-2"
                    >
                      <input
                        type="checkbox"
                        id={`element-${element.name}`}
                        checked={selectedElements.includes(element.name)}
                        onChange={() => onToggleElement(element.name)}
                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-2 focus:ring-primary cursor-pointer"
                      />
                      <label
                        htmlFor={`element-${element.name}`}
                        className="flex items-center gap-2 cursor-pointer text-sm flex-1"
                      >
                        <CachedImage
                          src={element.iconUrl}
                          alt={element.name}
                          width={20}
                          height={20}
                          className="w-5 h-5 rounded-full"
                        />
                        <span>{element.name}</span>
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Rarity Filter Section */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Rarity
                </label>
                <div className="space-y-2">
                  {uniqueRarities.map((rarity) => (
                    <div key={rarity} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={`rarity-${rarity}`}
                        checked={selectedRarities.includes(rarity)}
                        onChange={() => onToggleRarity(rarity)}
                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-2 focus:ring-primary cursor-pointer"
                      />
                      <label
                        htmlFor={`rarity-${rarity}`}
                        className="flex items-center gap-1 cursor-pointer flex-1"
                      >
                        {renderRarityStars(rarity)}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Region Filter Section */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Region
                </label>
                <div className="space-y-2">
                  {uniqueRegions.map((region) => (
                    <div
                      key={region.name}
                      className="flex items-center space-x-2"
                    >
                      <input
                        type="checkbox"
                        id={`region-${region.name}`}
                        checked={selectedRegions.includes(region.name)}
                        onChange={() => onToggleRegion(region.name)}
                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-2 focus:ring-primary cursor-pointer"
                      />
                      <label
                        htmlFor={`region-${region.name}`}
                        className="flex items-center gap-2 cursor-pointer text-sm flex-1"
                      >
                        <CachedImage
                          src={region.iconUrl}
                          alt={region.name}
                          width={20}
                          height={20}
                          className="w-5 h-5 rounded-full"
                        />
                        <span>{region.name}</span>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Active Filter Chips - only show if filters are active */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 px-3 sm:px-4 pb-2 sm:pb-3">
          <span className="text-xs sm:text-sm text-muted-foreground">
            Filters:
          </span>

          {/* Element chips */}
          {selectedElements.map((element) => {
            const elementData = uniqueElements.find(
              (e) => e.name === element
            );
            return (
              <FilterChip
                key={element}
                label={element}
                icon={elementData?.iconUrl}
                type="element"
                onRemove={() => onToggleElement(element)}
              />
            );
          })}

          {/* Rarity chips */}
          {selectedRarities.map((rarity) => (
            <FilterChip
              key={rarity}
              label={rarity}
              type="rarity"
              onRemove={() => onToggleRarity(rarity)}
            />
          ))}

          {/* Region chips */}
          {selectedRegions.map((region) => {
            const regionData = uniqueRegions.find((r) => r.name === region);
            return (
              <FilterChip
                key={region}
                label={region}
                icon={regionData?.iconUrl}
                type="region"
                onRemove={() => onToggleRegion(region)}
              />
            );
          })}

          {/* Clear all button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearAll}
            className="text-muted-foreground hover:text-foreground h-7 text-xs"
          >
            Clear all
          </Button>
        </div>
      )}
    </div>
  );
};

export default FilterBar;
