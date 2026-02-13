import { useCallback, useEffect, useMemo, useState } from 'react';

import { usePrimitivesStore } from '@/stores/usePrimitivesStore';

import { useCharactersStore } from '../stores';

type CharacterFilter = {
  regions: string[];
  rarities: string[];
  elements: string[];
};

export function useCharacterFilters() {
  const { characters, fetchCharacters } = useCharactersStore();
  const { fetchPrimitives } = usePrimitivesStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<CharacterFilter>({
    elements: [],
    rarities: [],
    regions: [],
  });

  useEffect(() => {
    fetchCharacters();
    fetchPrimitives();
  }, [fetchCharacters, fetchPrimitives]);

  const uniqueRarities = useMemo<string[]>(() => {
    if (!characters) return [];
    const rarities = new Set(
      characters
        .map((char) => char.rarity)
        .filter((rarity) => rarity && rarity !== 'None')
    );
    return Array.from(rarities).sort((a, b) => Number(b) - Number(a));
  }, [characters]);

  const filteredCharacters = useMemo(() => {
    if (!characters) return [];

    return characters.filter((char) => {
      const matchesSearch =
        searchQuery.trim() === '' ||
        char.name.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesElement =
        filters.elements.length === 0 ||
        filters.elements.includes(char.element);

      const matchesRarity =
        filters.rarities.length === 0 || filters.rarities.includes(char.rarity);

      const matchesRegion =
        filters.regions.length === 0 || filters.regions.includes(char.region);

      return matchesSearch && matchesElement && matchesRarity && matchesRegion;
    });
  }, [characters, searchQuery, filters]);

  const toggleElement = useCallback((element: string) => {
    setFilters((prev) => ({
      ...prev,
      elements: prev.elements.includes(element)
        ? prev.elements.filter((e) => e !== element)
        : [...prev.elements, element],
    }));
  }, []);

  const toggleRarity = useCallback((rarity: string) => {
    setFilters((prev) => ({
      ...prev,
      rarities: prev.rarities.includes(rarity)
        ? prev.rarities.filter((r) => r !== rarity)
        : [...prev.rarities, rarity],
    }));
  }, []);

  const toggleRegion = useCallback((region: string) => {
    setFilters((prev) => ({
      ...prev,
      regions: prev.regions.includes(region)
        ? prev.regions.filter((r) => r !== region)
        : [...prev.regions, region],
    }));
  }, []);

  const clearAllFilters = useCallback(() => {
    setSearchQuery('');
    setFilters({
      elements: [],
      rarities: [],
      regions: [],
    });
  }, []);

  return {
    characters: filteredCharacters,
    allCharacters: characters || [],

    searchQuery,
    setSearchQuery,

    uniqueRarities,
    filters,

    toggleElement,
    toggleRarity,
    toggleRegion,
    clearAllFilters,
  };
}
