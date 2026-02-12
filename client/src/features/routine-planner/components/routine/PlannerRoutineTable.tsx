import React, { useEffect, useMemo, useState } from 'react';

import {
  useTalentBooksStore,
  useWeaponMaterialStore,
} from '@/features/calendar';
import {
  useCharacterMap,
  useTrackedCharacters,
  useTrackedTeams,
  useWeaponMap,
} from '@/stores';

import type { RoutineFilters } from '../../types/routine';
import {
  buildDailyMaterialGroups,
  enrichTrackedCharacters,
  filterDailyRoutines,
  sortCharactersInGroups,
} from '../../utils/buildMaterialGroups';
import PlannerDayRow from './PlannerDayRow';
import PlannerRoutineToolbar from './PlannerRoutineToolbar';

/**
 * Main routine table component for the RoutinePlanner
 * Shows ALL tracked characters' materials grouped by day with visual tracking context
 *
 * Key improvements over character RoutineTable:
 * - Fixes talent book overwriting bug (groups characters by material)
 * - Shows character-material relationships
 * - Displays tracking reason badges (building/farming/wishlist)
 * - Team awareness with filtering
 * - Advanced filtering by day, reason, and team
 */
const PlannerRoutineTable: React.FC = () => {
  // State
  const [filters, setFilters] = useState<RoutineFilters>({
    selectedDay: 'all',
    selectedReasons: new Set(),
    selectedTeam: 'all',
    sortBy: 'priority',
  });

  // Data from stores
  const trackedCharacters = useTrackedCharacters();
  const teams = useTrackedTeams();
  const characterMap = useCharacterMap();
  const weaponMap = useWeaponMap();
  const { talentCharMap, fetchBooks } = useTalentBooksStore();
  const { weaponMap: weaponMaterialMap, fetchWeaponMaterials } =
    useWeaponMaterialStore();

  // Fetch material data on mount
  useEffect(() => {
    fetchBooks();
    fetchWeaponMaterials();
  }, [fetchBooks, fetchWeaponMaterials]);

  // Phase 1: Enrich tracked characters with full context
  const enrichedCharacters = useMemo(
    () =>
      enrichTrackedCharacters(
        trackedCharacters,
        characterMap,
        weaponMap,
        teams
      ),
    [trackedCharacters, characterMap, weaponMap, teams]
  );

  // Phase 2: Build daily material groups (FIXES OVERWRITING BUG)
  const dailyRoutines = useMemo(
    () =>
      buildDailyMaterialGroups(
        enrichedCharacters,
        talentCharMap,
        weaponMaterialMap
      ),
    [enrichedCharacters, talentCharMap, weaponMaterialMap]
  );

  // Phase 3: Apply filters
  const filteredRoutines = useMemo(
    () => filterDailyRoutines(dailyRoutines, filters),
    [dailyRoutines, filters]
  );

  // Phase 4: Apply sorting
  const sortedRoutines = useMemo(
    () => sortCharactersInGroups(filteredRoutines, filters.sortBy),
    [filteredRoutines, filters.sortBy]
  );

  // Loading state
  const isLoading =
    Object.keys(talentCharMap).length === 0 ||
    Object.keys(weaponMaterialMap).length === 0;

  if (isLoading) {
    return (
      <div className="w-full max-w-4xl mx-auto mt-4">
        <div className="rounded-lg border border-border p-8 text-center">
          <div className="text-muted-foreground">Loading material data...</div>
        </div>
      </div>
    );
  }

  // Empty state - no tracked characters
  if (trackedCharacters.length === 0) {
    return null; // Parent component handles empty state
  }

  return (
    <div className="w-full max-w-4xl mx-auto mt-4 space-y-4">
      {/* Toolbar */}
      <PlannerRoutineToolbar
        filters={filters}
        onFiltersChange={setFilters}
        teams={teams}
      />

      {/* Table */}
      <div className="rounded-lg border border-border overflow-hidden">
        {/* Header */}
        <div className="grid grid-cols-[150px_1fr] bg-midnight-700/50 border-b border-border">
          <div className="px-4 py-3 font-semibold text-sm text-starlight-200">
            Day
          </div>
          <div className="px-4 py-3 font-semibold text-sm text-starlight-200">
            Materials to Farm
          </div>
        </div>

        {/* Rows */}
        {sortedRoutines.map((routine) => (
          <PlannerDayRow key={routine.day} routine={routine} />
        ))}
      </div>

      {/* Filter Results Summary */}
      {(filters.selectedReasons.size > 0 ||
        filters.selectedTeam !== 'all' ||
        filters.selectedDay !== 'all') && (
        <div className="text-xs text-muted-foreground text-center">
          Showing filtered results •{' '}
          {sortedRoutines.filter((r) => r.hasFarming).length} days with farming
        </div>
      )}
    </div>
  );
};

export default PlannerRoutineTable;
