import { Calendar, Home as HomeIcon, Sparkles } from 'lucide-react';
import React, { useEffect, useMemo } from 'react';

import {
  useCharactersStore,
  usePrimitivesStore,
  useTalentBooksStore,
  useWeaponMaterialStore,
  useWeaponsStore,
} from '@/stores';

import { DailyFarmingGuide } from './daily-farming/DailyFarmingGuide';
import { GameModesSection } from './game-modes/GameModesSection';
import { TrackerSection } from './tracker/TrackerSection';

const DAY_NAMES = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

function getFormattedDate(): string {
  const now = new Date();
  const day = DAY_NAMES[now.getDay()];
  const month = MONTH_NAMES[now.getMonth()];
  const date = now.getDate();
  return `${day}, ${month} ${date}`;
}

const DashboardHeader: React.FC = () => {
  const formattedDate = useMemo(() => getFormattedDate(), []);

  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-2">
        <HomeIcon className="w-6 h-6 text-sky-500" />
        <h1 className="text-2xl md:text-3xl font-bold">Dashboard</h1>
      </div>
      <div className="flex items-center gap-2 text-muted-foreground">
        <Calendar className="w-4 h-4" />
        <span className="text-sm md:text-base">{formattedDate}</span>
        <Sparkles className="w-3 h-3 ml-2 text-amber-500" />
        <span className="text-xs text-amber-500">
          Track your Genshin progress
        </span>
      </div>
    </div>
  );
};

export const Home: React.FC = () => {
  // Fetch all required data on mount
  const { fetchCharacters } = useCharactersStore();
  const { fetchWeapons } = useWeaponsStore();
  const { fetchBooks } = useTalentBooksStore();
  const { fetchPrimitives } = usePrimitivesStore();
  const { fetchWeaponMaterials } = useWeaponMaterialStore();

  useEffect(() => {
    // Fetch data that's needed for the home page
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
      <DashboardHeader />

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
