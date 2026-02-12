import React, { useEffect } from 'react';

import { useTalentBooksStore } from '@/features/calendar';
import { useCharactersStore } from '@/features/characters';
import { useWeaponMaterialStore, useWeaponsStore } from '@/features/weapons';
import { usePrimitivesStore } from '@/stores';

import { DailyFarmingGuide } from './daily-farming-guide';
import { GameModesSection } from './game-modes';
import { HeroSection } from './hero-section';
import { TrackerSection } from './tracker-section';

export const Home: React.FC = () => {
  const { fetchCharacters } = useCharactersStore();
  const { fetchWeapons } = useWeaponsStore();
  const { fetchBooks } = useTalentBooksStore();
  const { fetchPrimitives } = usePrimitivesStore();
  const { fetchWeaponMaterials } = useWeaponMaterialStore();

  useEffect(() => {
    fetchCharacters();
    fetchWeapons();
    fetchBooks();
    fetchPrimitives();
    fetchWeaponMaterials();
  }, [
    fetchCharacters,
    fetchWeapons,
    fetchBooks,
    fetchPrimitives,
    fetchWeaponMaterials,
  ]);

  return (
    <div className="space-y-6">
      {/* Hero Section with dynamic wallpaper and version info */}
      <HeroSection />

      {/* Daily Farming Guide - Most important section */}
      <DailyFarmingGuide />

      {/* User's tracked items */}
      <TrackerSection />

      {/* Game mode recommendations */}
      <GameModesSection />
    </div>
  );
};

export default Home;
