import { DAYS_OF_WEEK } from '@/constants';
import type { TalentBook } from '@/features/calendar';
import type { WeaponMaterial, WeaponSummary } from '@/features/weapons';
import type {
  Character,
  Day,
  TrackedCharacter,
  TrackedTeam,
  TrackingReason,
} from '@/types';
import { getCurrentDay } from '@/utils/day';

import type {
  EnrichedCharacter,
  PlannerDailyRoutine,
  RoutineFilters,
  TalentMaterialGroup,
  WeaponMaterialGroup,
} from '../types/routine';

// Stable empty arrays to prevent Zustand selector infinite loops
const EMPTY_WEAPONS: WeaponSummary[] = [];

// Tracking reason color classes (from RoutinePlanner.tsx)
const REASON_COLORS: Record<TrackingReason, string> = {
  building: 'bg-blue-500/20 text-blue-400 border-blue-500/50',
  farming: 'bg-green-500/20 text-green-400 border-green-500/50',
  wishlist: 'bg-purple-500/20 text-purple-400 border-purple-500/50',
};

const REASON_LABELS: Record<TrackingReason, string> = {
  building: 'Building',
  farming: 'Farming',
  wishlist: 'Wishlist',
};

/**
 * Enriches tracked characters with full context for display
 */
export function enrichTrackedCharacters(
  trackedCharacters: TrackedCharacter[],
  characterMap: Record<string, Character>,
  weaponMap: Record<string, WeaponSummary>,
  teams: TrackedTeam[]
): EnrichedCharacter[] {
  return trackedCharacters
    .map((tracked) => {
      const character = characterMap[tracked.name];
      if (!character) return null;

      // Get team info if character belongs to a team
      const team = teams.find((t) => t.id === tracked.teamId);

      // Get weapon objects for paired weapons
      const pairedWeapons = (tracked.pairedWeapons || [])
        .map((name) => weaponMap[name])
        .filter((w) => w !== undefined);

      const enriched: EnrichedCharacter = {
        // Core character data
        name: character.name,
        iconUrl: character.iconUrl,
        rarity: parseInt(character.rarity, 10),
        weaponType: character.weaponType,

        // Tracking context
        reason: tracked.reason,
        addedAt: tracked.addedAt,
        notes: tracked.notes,

        // Relationships
        pairedWeapons: pairedWeapons.length > 0 ? pairedWeapons : EMPTY_WEAPONS,
        teamId: tracked.teamId,
        teamName: team?.name,
        teamIcon: team?.icon,

        // Display helpers (pre-computed)
        reasonBadgeClass: REASON_COLORS[tracked.reason],
        reasonLabel: REASON_LABELS[tracked.reason],
      };

      return enriched;
    })
    .filter((char): char is EnrichedCharacter => char !== null);
}

/**
 * Builds daily material groups from enriched characters
 * This FIXES the overwriting bug by grouping characters by material instead of single assignment
 */
export function buildDailyMaterialGroups(
  enrichedCharacters: EnrichedCharacter[],
  talentCharMap: Record<string, TalentBook>,
  weaponMaterialMap: Record<string, WeaponMaterial>
): PlannerDailyRoutine[] {
  // Initialize routine map for all days
  const routineMap: Record<Day, PlannerDailyRoutine> = {} as Record<
    Day,
    PlannerDailyRoutine
  >;

  DAYS_OF_WEEK.forEach((day) => {
    routineMap[day] = {
      day,
      isToday: false,
      talentGroups: [],
      weaponGroups: [],
      totalCharacters: 0,
      totalWeapons: 0,
      hasFarming: false,
    };
  });

  const currentDay = getCurrentDay();

  // Track which talent book groups exist on each day
  const talentGroupsByDay: Record<
    Day,
    Map<string, TalentMaterialGroup>
  > = {} as Record<Day, Map<string, TalentMaterialGroup>>;

  DAYS_OF_WEEK.forEach((day) => {
    talentGroupsByDay[day] = new Map();
  });

  // Process talent materials - GROUP by book name instead of overwriting
  enrichedCharacters.forEach((character) => {
    const talentBook = talentCharMap[character.name];
    if (talentBook) {
      [talentBook.dayOne, talentBook.dayTwo].forEach((day) => {
        const cleanDay = day?.replace(/\/$/, '').trim() as Day;
        if (cleanDay && routineMap[cleanDay]) {
          const groupMap = talentGroupsByDay[cleanDay];
          const existingGroup = groupMap.get(talentBook.bookName);

          if (existingGroup) {
            // Add character to existing group
            existingGroup.characters.push(character);
          } else {
            // Create new group for this book
            groupMap.set(talentBook.bookName, {
              book: talentBook,
              characters: [character],
            });
          }
        }
      });
    }
  });

  // Convert talent groups from maps to arrays
  DAYS_OF_WEEK.forEach((day) => {
    routineMap[day].talentGroups = Array.from(talentGroupsByDay[day].values());
    if (routineMap[day].talentGroups.length > 0) {
      routineMap[day].hasFarming = true;
    }
  });

  // Track which weapon material groups exist on each day
  const weaponGroupsByDay: Record<
    Day,
    Map<string, WeaponMaterialGroup>
  > = {} as Record<Day, Map<string, WeaponMaterialGroup>>;

  DAYS_OF_WEEK.forEach((day) => {
    weaponGroupsByDay[day] = new Map();
  });

  // Process weapon materials - GROUP by material images
  enrichedCharacters.forEach((character) => {
    character.pairedWeapons.forEach((weapon) => {
      const material = weaponMaterialMap[weapon.name];
      if (material) {
        [material.dayOne, material.dayTwo].forEach((day) => {
          const cleanDay = day as Day;
          if (cleanDay && routineMap[cleanDay]) {
            const groupMap = weaponGroupsByDay[cleanDay];

            // Create unique key from material images
            const materialKey = material.materialImages
              .map((img) => img.url)
              .join('|');

            const existingGroup = groupMap.get(materialKey);

            if (existingGroup) {
              // Add character-weapon pair to existing group
              existingGroup.characterWeaponPairs.push({
                character,
                weapon,
              });
            } else {
              // Create new group for this material
              groupMap.set(materialKey, {
                dayOne: material.dayOne,
                dayTwo: material.dayTwo,
                materialImages: material.materialImages,
                materialName:
                  material.materialImages[0]?.caption || 'Unknown Material',
                characterWeaponPairs: [
                  {
                    character,
                    weapon,
                  },
                ],
              });
            }
          }
        });
      }
    });
  });

  // Convert weapon groups from maps to arrays
  DAYS_OF_WEEK.forEach((day) => {
    routineMap[day].weaponGroups = Array.from(weaponGroupsByDay[day].values());
    if (routineMap[day].weaponGroups.length > 0) {
      routineMap[day].hasFarming = true;
    }

    // Calculate totals
    const uniqueCharacters = new Set<string>();
    const uniqueWeapons = new Set<string>();

    routineMap[day].talentGroups.forEach((group) => {
      group.characters.forEach((char) => uniqueCharacters.add(char.name));
    });

    routineMap[day].weaponGroups.forEach((group) => {
      group.characterWeaponPairs.forEach((pair) => {
        uniqueCharacters.add(pair.character.name);
        uniqueWeapons.add(pair.weapon.name);
      });
    });

    routineMap[day].totalCharacters = uniqueCharacters.size;
    routineMap[day].totalWeapons = uniqueWeapons.size;
    routineMap[day].isToday = day === currentDay;
  });

  return DAYS_OF_WEEK.map((day) => routineMap[day]);
}

/**
 * Filters material groups based on selected filters
 */
export function filterDailyRoutines(
  routines: PlannerDailyRoutine[],
  filters: RoutineFilters
): PlannerDailyRoutine[] {
  let filteredRoutines = routines;

  // Filter by day
  if (filters.selectedDay === 'today') {
    const today = getCurrentDay();
    filteredRoutines = filteredRoutines.filter((r) => r.day === today);
  } else if (filters.selectedDay !== 'all') {
    filteredRoutines = filteredRoutines.filter(
      (r) => r.day === filters.selectedDay
    );
  }

  // Filter by tracking reasons and team
  if (filters.selectedReasons.size > 0 || filters.selectedTeam !== 'all') {
    filteredRoutines = filteredRoutines.map((routine) => {
      const filteredTalentGroups = routine.talentGroups
        .map((group) => {
          const filteredCharacters = group.characters.filter((char) => {
            const reasonMatch =
              filters.selectedReasons.size === 0 ||
              filters.selectedReasons.has(char.reason);
            const teamMatch =
              filters.selectedTeam === 'all' ||
              char.teamId === filters.selectedTeam;
            return reasonMatch && teamMatch;
          });

          return filteredCharacters.length > 0
            ? { ...group, characters: filteredCharacters }
            : null;
        })
        .filter((group): group is TalentMaterialGroup => group !== null);

      const filteredWeaponGroups = routine.weaponGroups
        .map((group) => {
          const filteredPairs = group.characterWeaponPairs.filter((pair) => {
            const reasonMatch =
              filters.selectedReasons.size === 0 ||
              filters.selectedReasons.has(pair.character.reason);
            const teamMatch =
              filters.selectedTeam === 'all' ||
              pair.character.teamId === filters.selectedTeam;
            return reasonMatch && teamMatch;
          });

          return filteredPairs.length > 0
            ? { ...group, characterWeaponPairs: filteredPairs }
            : null;
        })
        .filter((group): group is WeaponMaterialGroup => group !== null);

      // Recalculate totals
      const uniqueCharacters = new Set<string>();
      const uniqueWeapons = new Set<string>();

      filteredTalentGroups.forEach((group) => {
        group.characters.forEach((char) => uniqueCharacters.add(char.name));
      });

      filteredWeaponGroups.forEach((group) => {
        group.characterWeaponPairs.forEach((pair) => {
          uniqueCharacters.add(pair.character.name);
          uniqueWeapons.add(pair.weapon.name);
        });
      });

      return {
        ...routine,
        talentGroups: filteredTalentGroups,
        weaponGroups: filteredWeaponGroups,
        totalCharacters: uniqueCharacters.size,
        totalWeapons: uniqueWeapons.size,
        hasFarming:
          filteredTalentGroups.length > 0 || filteredWeaponGroups.length > 0,
      };
    });
  }

  return filteredRoutines;
}

/**
 * Sorts characters within material groups
 */
export function sortCharactersInGroups(
  routines: PlannerDailyRoutine[],
  sortBy: 'priority' | 'alphabetical'
): PlannerDailyRoutine[] {
  const sortFn =
    sortBy === 'priority'
      ? (a: EnrichedCharacter, b: EnrichedCharacter) => a.addedAt - b.addedAt // Earlier = higher priority
      : (a: EnrichedCharacter, b: EnrichedCharacter) =>
          a.name.localeCompare(b.name);

  return routines.map((routine) => ({
    ...routine,
    talentGroups: routine.talentGroups.map((group) => ({
      ...group,
      characters: [...group.characters].sort(sortFn),
    })),
    weaponGroups: routine.weaponGroups.map((group) => ({
      ...group,
      characterWeaponPairs: [...group.characterWeaponPairs].sort((a, b) =>
        sortFn(a.character, b.character)
      ),
    })),
  }));
}
