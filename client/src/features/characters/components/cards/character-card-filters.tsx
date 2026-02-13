import React from 'react';

import { Button } from '@/components/ui/button';
import FilterBar from '@/components/utils/filter/FilterBar';

import { useCharacterFilters } from '../../hooks/useCharacterFilters';
import { useCharactersError, useCharactersStore } from '../../stores';
import CharacterCardGrid from './characters-grid';

const CharacterCardsWithFilters: React.FC = () => {
  const { loading } = useCharactersStore();
  const error = useCharactersError();

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
    <div className="w-full -m-4 md:-m-6">
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

      {filteredCharacters.length > 0 ? (
        <CharacterCardGrid characters={filteredCharacters} />
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
