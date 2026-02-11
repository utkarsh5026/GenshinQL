import { CheckCircle2, Coins, Package, Sparkles, Swords } from 'lucide-react';
import React, { useEffect, useMemo } from 'react';

import { DAYS_OF_WEEK } from '@/constants';
import {
  type TalentBook,
  useTalentBooksStore,
  useWeaponMaterialStore,
} from '@/features/calendar';
import type { WeaponMaterial, WeaponSummary } from '@/features/weapons';
import { Day } from '@/types';
import { getCurrentDay } from '@/utils/day';

import type { Character } from '../../../types';
import MaterialsCell, { type DailyRoutine } from './materials-cell';

interface RoutineTableProps {
  character: Character;
  selectedWeapons: WeaponSummary[];
}

/**
 * Builds a daily routine schedule combining talent and weapon materials
 */
function buildDailyRoutines(
  character: Character,
  selectedWeapons: WeaponSummary[],
  talentCharMap: Record<string, TalentBook>,
  weaponMap: Record<string, WeaponMaterial>
): DailyRoutine[] {
  const routineMap: Record<Day, DailyRoutine> = {
    Monday: {
      day: 'Monday',
      talentMaterials: null,
      weaponMaterials: [],
      hasFarming: false,
    },
    Tuesday: {
      day: 'Tuesday',
      talentMaterials: null,
      weaponMaterials: [],
      hasFarming: false,
    },
    Wednesday: {
      day: 'Wednesday',
      talentMaterials: null,
      weaponMaterials: [],
      hasFarming: false,
    },
    Thursday: {
      day: 'Thursday',
      talentMaterials: null,
      weaponMaterials: [],
      hasFarming: false,
    },
    Friday: {
      day: 'Friday',
      talentMaterials: null,
      weaponMaterials: [],
      hasFarming: false,
    },
    Saturday: {
      day: 'Saturday',
      talentMaterials: null,
      weaponMaterials: [],
      hasFarming: false,
    },
    Sunday: {
      day: 'Sunday',
      talentMaterials: null,
      weaponMaterials: [],
      hasFarming: false,
    },
  };

  const talentBook = talentCharMap[character.name];
  if (talentBook) {
    [talentBook.dayOne, talentBook.dayTwo].forEach((day) => {
      const cleanDay = day?.replace(/\/$/, '').trim();
      if (cleanDay && routineMap[cleanDay as Day]) {
        routineMap[cleanDay as Day].talentMaterials = talentBook;
        routineMap[cleanDay as Day].hasFarming = true;
      }
    });
  }

  selectedWeapons.forEach((weapon) => {
    const material = weaponMap[weapon.name];
    if (material) {
      [material.dayOne, material.dayTwo].forEach((day) => {
        if (routineMap[day as Day]) {
          const existingGroup = routineMap[day as Day].weaponMaterials.find(
            (group) =>
              group.materialImages.length === material.materialImages.length &&
              group.materialImages.every(
                (img, idx) => img.url === material.materialImages[idx]?.url
              )
          );

          if (existingGroup) {
            existingGroup.weapons.push(weapon);
          } else {
            routineMap[day as Day].weaponMaterials.push({
              dayOne: material.dayOne,
              dayTwo: material.dayTwo,
              materialImages: material.materialImages,
              weapons: [weapon],
            });
          }
          routineMap[day as Day].hasFarming = true;
        }
      });
    }
  });

  return DAYS_OF_WEEK.map((day) => routineMap[day]);
}

/**
 * RoutineTable component displays a 2-column weekly schedule showing
 * what materials can be farmed each day for the selected character and weapons.
 */
const RoutineTable: React.FC<RoutineTableProps> = ({
  character,
  selectedWeapons,
}) => {
  const currentDay = getCurrentDay();
  const { talentCharMap, fetchBooks } = useTalentBooksStore();
  const { weaponMap, fetchWeaponMaterials } = useWeaponMaterialStore();

  useEffect(() => {
    fetchBooks();
    fetchWeaponMaterials();
  }, [fetchBooks, fetchWeaponMaterials]);

  const dailyRoutines = useMemo(
    () =>
      buildDailyRoutines(character, selectedWeapons, talentCharMap, weaponMap),
    [character, selectedWeapons, talentCharMap, weaponMap]
  );

  return (
    <div className="w-full max-w-4xl mx-auto mt-4">
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
        {dailyRoutines.map((routine) => {
          const isToday = routine.day === currentDay;

          return (
            <div
              key={routine.day}
              className={`grid grid-cols-[150px_1fr] border-b border-border last:border-b-0 transition-colors ${
                isToday
                  ? 'bg-celestial-500/10 hover:bg-celestial-500/15'
                  : 'hover:bg-midnight-700/30'
              }`}
            >
              {/* Day Cell */}
              <div className="px-4 py-4 flex flex-col gap-2">
                <span className="font-medium text-foreground">
                  {routine.day}
                </span>
                {isToday && (
                  <span className="text-xs bg-celestial-500/20 text-celestial-300 px-2 py-1 rounded w-fit border border-celestial-500/30">
                    Today
                  </span>
                )}
              </div>

              {/* Materials Cell */}
              <div className="px-4 py-4">
                {routine.hasFarming ? (
                  <MaterialsCell routine={routine} />
                ) : (
                  <EmptyDaySuggestions />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/**
 * Component displayed on days when there are no talent or weapon materials to farm.
 * Provides helpful suggestions for alternative farming activities.
 */
const EmptyDaySuggestions: React.FC = () => {
  const suggestions = [
    {
      icon: Coins,
      title: 'Mora',
      color: 'text-amber-400/70',
      hoverColor: 'group-hover:text-amber-400',
    },
    {
      icon: Sparkles,
      title: 'Character EXP',
      color: 'text-purple-400/70',
      hoverColor: 'group-hover:text-purple-400',
    },
    {
      icon: Swords,
      title: 'Weekly Bosses',
      color: 'text-red-400/70',
      hoverColor: 'group-hover:text-red-400',
    },
    {
      icon: Package,
      title: 'Artifacts',
      color: 'text-blue-400/70',
      hoverColor: 'group-hover:text-blue-400',
    },
    {
      icon: CheckCircle2,
      title: 'Commissions',
      color: 'text-green-400/70',
      hoverColor: 'group-hover:text-green-400',
    },
  ];

  return (
    <div className="flex flex-wrap items-center gap-3">
      <span className="text-xs text-muted-foreground/60">No farming •</span>
      {suggestions.map((suggestion) => {
        const Icon = suggestion.icon;
        return (
          <div
            key={suggestion.title}
            className="group flex items-center gap-1.5 transition-all"
          >
            <Icon
              className={`w-3.5 h-3.5 ${suggestion.color} ${suggestion.hoverColor} transition-colors`}
            />
            <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors">
              {suggestion.title}
            </span>
          </div>
        );
      })}
    </div>
  );
};

export default RoutineTable;
