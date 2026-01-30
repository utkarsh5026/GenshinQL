import React, { useState, useMemo, useEffect } from 'react';
import CharactersTable from './CharacterTable';
import FilterBar from './FilterBar';
import { useCharactersStore } from '@/stores';
import { Button } from '@/components/ui/button';

interface FilterOption {
  name: string;
  iconUrl: string;
}

const CharacterTableWithFilters: React.FC = () => {
  const { characters, loading, error, fetchCharacters } = useCharactersStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedElements, setSelectedElements] = useState<string[]>([]);
  const [selectedRarities, setSelectedRarities] = useState<string[]>([]);
  const [selectedRegions, setSelectedRegions] = useState<string[]>([]);

  useEffect(() => {
    fetchCharacters();
  }, [fetchCharacters]);

  // Extract unique filter options from characters
  const uniqueElements = useMemo<FilterOption[]>(() => {
    if (!characters) return [];
    const elementMap = new Map<string, string>();

    characters.forEach((char) => {
      if (char.element && char.element !== 'None') {
        elementMap.set(char.element, char.elementUrl);
      }
    });

    return Array.from(elementMap.entries())
      .map(([name, iconUrl]) => ({ name, iconUrl }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [characters]);

  const uniqueRarities = useMemo<string[]>(() => {
    if (!characters) return [];
    const rarities = new Set(
      characters
        .map((char) => char.rarity)
        .filter((rarity) => rarity && rarity !== 'None')
    );
    return Array.from(rarities).sort((a, b) => Number(b) - Number(a)); // Sort descending (5-star first)
  }, [characters]);

  const uniqueRegions = useMemo<FilterOption[]>(() => {
    if (!characters) return [];
    const regionMap = new Map<string, string>();

    characters.forEach((char) => {
      if (char.region && char.region !== 'None') {
        regionMap.set(char.region, char.regionUrl);
      }
    });

    return Array.from(regionMap.entries())
      .map(([name, iconUrl]) => ({ name, iconUrl }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [characters]);

  // Filter characters based on search and selected filters (AND logic)
  const filteredCharacters = useMemo(() => {
    if (!characters) return [];

    return characters.filter((char) => {
      // Search filter - match name (case-insensitive)
      const matchesSearch =
        searchQuery.trim() === '' ||
        char.name.toLowerCase().includes(searchQuery.toLowerCase());

      // Element filter - if no elements selected, show all
      const matchesElement =
        selectedElements.length === 0 ||
        selectedElements.includes(char.element);

      // Rarity filter - if no rarities selected, show all
      const matchesRarity =
        selectedRarities.length === 0 || selectedRarities.includes(char.rarity);

      // Region filter - if no regions selected, show all
      const matchesRegion =
        selectedRegions.length === 0 || selectedRegions.includes(char.region);

      // AND logic: must match ALL criteria
      return matchesSearch && matchesElement && matchesRarity && matchesRegion;
    });
  }, [
    characters,
    searchQuery,
    selectedElements,
    selectedRarities,
    selectedRegions,
  ]);

  // Toggle functions
  const toggleElement = (element: string) => {
    setSelectedElements((prev) =>
      prev.includes(element)
        ? prev.filter((e) => e !== element)
        : [...prev, element]
    );
  };

  const toggleRarity = (rarity: string) => {
    setSelectedRarities((prev) =>
      prev.includes(rarity)
        ? prev.filter((r) => r !== rarity)
        : [...prev, rarity]
    );
  };

  const toggleRegion = (region: string) => {
    setSelectedRegions((prev) =>
      prev.includes(region)
        ? prev.filter((r) => r !== region)
        : [...prev, region]
    );
  };

  const clearAllFilters = () => {
    setSearchQuery('');
    setSelectedElements([]);
    setSelectedRarities([]);
    setSelectedRegions([]);
  };

  if (loading) return <div className="p-4">Loading...</div>;
  if (error)
    return <div className="p-4 text-destructive">Error: {error.message}</div>;

  return (
    <div className="w-full">
      <FilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedElements={selectedElements}
        selectedRarities={selectedRarities}
        selectedRegions={selectedRegions}
        uniqueElements={uniqueElements}
        uniqueRarities={uniqueRarities}
        uniqueRegions={uniqueRegions}
        onToggleElement={toggleElement}
        onToggleRarity={toggleRarity}
        onToggleRegion={toggleRegion}
        onClearAll={clearAllFilters}
      />

      {filteredCharacters.length > 0 ? (
        <div className="overflow-x-auto">
          <CharactersTable characters={filteredCharacters} />
        </div>
      ) : (
        <div className="text-center py-12">
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

export default CharacterTableWithFilters;
