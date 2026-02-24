import { LayoutGrid, List } from 'lucide-react';
import React, { useState } from 'react';

import { Button } from '@/components/ui/button';
import FilterBar from '@/components/utils/filter/FilterBar';
import { cn } from '@/lib/utils';

import { useCharacterFilters } from '../../hooks/useCharacterFilters';
import { useCharactersError, useCharactersStore } from '../../stores';
import styles from './CharacterCard.module.css';
import CharacterCardGrid from './characters-grid';
import CharacterTable from './characters-table';

type ViewMode = 'grid' | 'table';

const CharacterCardsWithFilters: React.FC = () => {
  const { loading } = useCharactersStore();
  const error = useCharactersError();
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

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
    <div className="w-full -m-4 md:-m-6 flex-col gap-8">
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

        <div className={styles.viewToggle}>
          <button
            type="button"
            className={cn(
              styles.viewToggleBtn,
              viewMode === 'grid' && styles.viewToggleBtnActive
            )}
            onClick={() => setViewMode('grid')}
            title="Grid view"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            type="button"
            className={cn(
              styles.viewToggleBtn,
              viewMode === 'table' && styles.viewToggleBtnActive
            )}
            onClick={() => setViewMode('table')}
            title="Table view"
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {filteredCharacters.length > 0 ? (
        viewMode === 'grid' ? (
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
