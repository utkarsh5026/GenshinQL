import React, { useEffect, useMemo } from 'react';

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

const DAYS_OF_WEEK: Day[] = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

/**
 * Parses a day string like "Monday/Thursday" or "Monday/\nThursday" into an array of days
 */
function parseDays(dayString: string): Day[] {
  return dayString
    .split(/\s*\/\s*|\n/)
    .map((day) => day.trim())
    .filter((day) => day.length > 0) as Day[];
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

  // Add talent materials for character
  const talentBook = talentCharMap[character.name];
  if (talentBook) {
    [talentBook.dayOne, talentBook.dayTwo].forEach((day) => {
      if (day && routineMap[day as Day]) {
        routineMap[day as Day].talentMaterials = talentBook;
        routineMap[day as Day].hasFarming = true;
      }
    });
  }

  // Add weapon materials for selected weapons
  selectedWeapons.forEach((weapon) => {
    const material = weaponMap[weapon.name];
    if (material) {
      parseDays(material.day).forEach((day) => {
        if (routineMap[day]) {
          routineMap[day].weaponMaterials.push(material);
          routineMap[day].hasFarming = true;
        }
      });
    }
  });

  // Convert to ordered array
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
  return (
    <div className="text-muted-foreground">
      <p className="text-sm mb-2">No farming today! Consider:</p>
      <ul className="text-xs space-y-1 pl-4">
        <li>• Farm Mora (Ley Line Outcrops - Blossom of Wealth)</li>
        <li>
          • Farm Character EXP Materials (Ley Line Blossoms of Revelation)
        </li>
        <li>• Farm Weekly Bosses for talent materials</li>
        <li>• Farm Artifact Domains</li>
        <li>• Complete Daily Commissions</li>
      </ul>
    </div>
  );
};

export default RoutineTable;
