import { LayoutGrid, List } from 'lucide-react';
import React, { useState } from 'react';

import { Button } from '@/components/ui/button';
import FilterBar from '@/components/utils/filter/filter-bar';
import { cn } from '@/lib/utils';

import { useCharacterFilters } from '../../hooks/useCharacterFilters';
import { useCharactersError, useCharactersStore } from '../../stores';
import CharacterCardGrid from './characters-grid';
import CharacterTable from './characters-table';

type ViewMode = 'grid' | 'table';

const CharacterCardsWithFilters: React.FC = () => {
  const { loading } = useCharactersStore();
  const error = useCharactersError();
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const isMobile = window.matchMedia('(max-width: 767px)').matches;
  const effectiveViewMode: ViewMode = isMobile ? 'grid' : viewMode;

  const {
    characters: filteredCharacters,
    searchQuery,
    setSearchQuery,
    uniqueRarities,
    filters,
    toggleElement,
    toggleRarity,
    toggleRegion,
    clearAllFilters,
  } = useCharacterFilters();

  if (loading) return <div className="p-4">Loading...</div>;
  if (error)
    return <div className="p-4 text-destructive">Error: {error.message}</div>;

  return (
    <div className="-m-4 md:-m-6 flex flex-col gap-8">
      <div className="flex items-center gap-3 px-4 md:px-6 pt-4 md:pt-6">
        <div className="flex-1">
          <FilterBar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            selectedElements={filters.elements}
            selectedRarities={filters.rarities}
            selectedRegions={filters.regions}
            uniqueRarities={uniqueRarities}
            onToggleElement={toggleElement}
            onToggleRarity={toggleRarity}
            onToggleRegion={toggleRegion}
            onClearAll={clearAllFilters}
          />
        </div>

        <div className="hidden md:flex items-center gap-1 p-0.75 bg-muted/50 border border-border rounded-lg">
          <button
            type="button"
            className={cn(
              'flex items-center justify-center w-8.5 h-8.5 rounded-md bg-transparent border border-transparent text-muted-foreground cursor-pointer transition-all duration-200 ease-out hover:text-foreground hover:bg-muted/80',
              viewMode === 'grid' &&
                'bg-background border-border text-foreground shadow-sm'
            )}
            onClick={() => setViewMode('grid')}
            title="Grid view"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            type="button"
            className={cn(
              'flex items-center justify-center w-8.5 h-8.5 rounded-md bg-transparent border border-transparent text-muted-foreground cursor-pointer transition-all duration-200 ease-out hover:text-foreground hover:bg-muted/80',
              viewMode === 'table' &&
                'bg-background border-border text-foreground shadow-sm'
            )}
            onClick={() => setViewMode('table')}
            title="Table view"
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {filteredCharacters.length > 0 ? (
        effectiveViewMode === 'grid' ? (
          <CharacterCardGrid characters={filteredCharacters} />
        ) : (
          <CharacterTable characters={filteredCharacters} />
        )
      ) : (
        <div className="text-center py-12 px-4 md:px-6">
          <p className="text-muted-foreground mb-2">
            No characters found matching your criteria.
          </p>
          <Button variant="link" onClick={clearAllFilters}>
            Clear all filters
          </Button>
        </div>
      )}
    </div>
  );
};

export default CharacterCardsWithFilters;
