import { Filter } from 'lucide-react';
import React from 'react';

import { AppInput } from '@/components/ui/app-input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { CachedImage } from '@/features/cache';
import { useElements, useRegions } from '@/stores';

import FilterChip from './filter-chip';
import styles from './FilterBar.module.css';

interface FilterBarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  selectedElements: string[];
  selectedRarities: string[];
  selectedRegions: string[];
  uniqueRarities: string[];
  onToggleElement: (element: string) => void;
  onToggleRarity: (rarity: string) => void;
  onToggleRegion: (region: string) => void;
  onClearAll: () => void;
}

interface FilterRowProps {
  id: string;
  checked: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

const FilterRow: React.FC<FilterRowProps> = ({
  id,
  checked,
  onToggle,
  children,
}) => (
  <div
    className={`flex items-center space-x-2 ${styles.filterItem} cursor-pointer`}
    onClick={onToggle}
    onKeyDown={(e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onToggle();
      }
    }}
    role="checkbox"
    aria-checked={checked}
    tabIndex={0}
  >
    <Checkbox
      id={id}
      checked={checked}
      onCheckedChange={onToggle}
      onClick={(e) => e.stopPropagation()}
    />
    <div
      className={`flex items-center gap-2 text-sm flex-1 ${styles.filterLabel}`}
    >
      {children}
    </div>
  </div>
);

interface FilterSectionProps {
  title: string;
  children: React.ReactNode;
}

const FilterSection: React.FC<FilterSectionProps> = ({ title, children }) => (
  <div className="space-y-2">
    <label className="text-sm font-medium text-foreground">{title}</label>
    <div className="space-y-2">{children}</div>
  </div>
);

const ELEMENT_ANIMATION_CLASSES: Record<string, string> = {
  anemo: styles.anemo,
  pyro: styles.pyro,
  hydro: styles.hydro,
  electro: styles.electro,
  cryo: styles.cryo,
  geo: styles.geo,
  dendro: styles.dendro,
};

const FilterBar: React.FC<FilterBarProps> = ({
  searchQuery,
  onSearchChange,
  selectedElements,
  selectedRarities,
  selectedRegions,
  uniqueRarities,
  onToggleElement,
  onToggleRarity,
  onToggleRegion,
  onClearAll,
}) => {
  const elements = useElements();
  const regions = useRegions();

  const activeFilterCount =
    selectedElements.length + selectedRarities.length + selectedRegions.length;

  const renderRarityStars = (rarity: string) => {
    const rarityNum = Number.parseInt(rarity, 10);
    const starColor = rarityNum === 5 ? 'text-yellow-500' : 'text-violet-500';

    return (
      <div className={styles.rarityStars}>
        {Array.from({ length: rarityNum }).map((_, index) => (
          <span
            key={`${rarity}-star-${index}`}
            className={`${starColor} text-base`}
            style={{ '--star-index': index } as React.CSSProperties}
          >
            ★
          </span>
        ))}
      </div>
    );
  };

  return (
    <div className="sticky top-0 z-20 bg-background border-b shadow-sm">
      {/* Controls row */}
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 p-3 sm:p-4">
        {/* Search - full width on mobile */}
        <div className="flex-1 w-full sm:w-auto">
          <AppInput
            placeholder="Search characters..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            onClear={() => onSearchChange('')}
            className="h-9 sm:h-10"
          />
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
            className="w-[calc(100vw-4rem)] sm:w-80 max-h-[70vh] overflow-y-auto"
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

              <FilterSection title="Element">
                {elements.map((element) => (
                  <FilterRow
                    key={element.name}
                    id={`element-${element.name}`}
                    checked={selectedElements.includes(element.name)}
                    onToggle={() => onToggleElement(element.name)}
                  >
                    <div
                      className={`${styles.iconContainer} ${ELEMENT_ANIMATION_CLASSES[element.name.toLowerCase()] ?? ''}`}
                    >
                      <CachedImage
                        src={element.url}
                        alt={element.name}
                        width={20}
                        height={20}
                        className="w-5 h-5 rounded-full"
                      />
                    </div>
                    <span>{element.name}</span>
                  </FilterRow>
                ))}
              </FilterSection>

              <Separator />

              <FilterSection title="Rarity">
                {uniqueRarities.map((rarity) => (
                  <FilterRow
                    key={rarity}
                    id={`rarity-${rarity}`}
                    checked={selectedRarities.includes(rarity)}
                    onToggle={() => onToggleRarity(rarity)}
                  >
                    {renderRarityStars(rarity)}
                  </FilterRow>
                ))}
              </FilterSection>

              <Separator />

              <FilterSection title="Region">
                {regions.map((region) => (
                  <FilterRow
                    key={region.name}
                    id={`region-${region.name}`}
                    checked={selectedRegions.includes(region.name)}
                    onToggle={() => onToggleRegion(region.name)}
                  >
                    <div
                      className={`${styles.iconContainer} ${styles.regionIcon}`}
                    >
                      <CachedImage
                        src={region.url}
                        alt={region.name}
                        width={20}
                        height={20}
                        className="w-5 h-5 rounded-full"
                      />
                    </div>
                    <span>{region.name}</span>
                  </FilterRow>
                ))}
              </FilterSection>
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

          {selectedElements.map((element) => {
            const elementData = elements.find((e) => e.name === element);
            return (
              <FilterChip
                key={element}
                label={element}
                icon={elementData?.url}
                type="element"
                onRemove={() => onToggleElement(element)}
              />
            );
          })}

          {selectedRarities.map((rarity) => (
            <FilterChip
              key={rarity}
              label={rarity}
              type="rarity"
              onRemove={() => onToggleRarity(rarity)}
            />
          ))}

          {selectedRegions.map((region) => {
            const regionData = regions.find((r) => r.name === region);
            return (
              <FilterChip
                key={region}
                label={region}
                icon={regionData?.url}
                type="region"
                onRemove={() => onToggleRegion(region)}
              />
            );
          })}

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
