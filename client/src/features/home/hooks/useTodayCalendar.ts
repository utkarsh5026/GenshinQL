import { useMemo } from 'react';

import type {
  TalentBookCalendar,
  WeaponMaterialSchedule,
} from '@/features/calendar';
import {
  useTalentCalendar,
  useWeaponMaterialSchedule,
} from '@/features/calendar';
import { useRegions } from '@/stores/usePrimitivesStore';
import {
  useTrackedCharacters,
  useTrackedWeapons,
} from '@/stores/useTrackerStore';

import { DAY_SCHEDULE } from '../constants';
import type {
  MaterialItem,
  TalentMaterialsByRegion,
  TodayCalendarData,
  WeaponMaterialsByNation,
} from '../types';
import { getCurrentDayName, getDayType } from '../utils';

/**
 * Hook that provides today's farmable talent books and weapon materials
 * with tracking information integrated.
 *
 * Filters calendar data based on the current day and enriches it with:
 * - Region/nation icon URLs
 * - Character/weapon tracking status
 * - Day context (day name, type, isSunday flag)
 *
 * @returns Complete today's calendar data ready for rendering
 */
export function useTodayCalendar(): TodayCalendarData {
  const dayType = getDayType();
  const currentDay = getCurrentDayName();
  const isSunday = dayType === 'all';

  const calendar = useTalentCalendar();
  const schedule = useWeaponMaterialSchedule();
  const regions = useRegions();
  const trackedCharacters = useTrackedCharacters();
  const trackedWeapons = useTrackedWeapons();

  const trackedCharacterNames = useMemo(
    () => new Set(trackedCharacters.map((c) => c.name)),
    [trackedCharacters]
  );

  const trackedWeaponNames = useMemo(
    () => new Set(trackedWeapons.map((w) => w.name)),
    [trackedWeapons]
  );

  const regionUrlMap = useMemo(() => {
    const map: Record<string, string> = {};
    regions.forEach((region) => {
      map[region.name] = region.url;
    });
    return map;
  }, [regions]);

  const talentMaterials = useMemo((): TalentMaterialsByRegion[] => {
    if (!calendar || calendar.length === 0) return [];

    return calendar.map((regionCalendar: TalentBookCalendar) => {
      const dayData =
        dayType === 'all'
          ? regionCalendar.days
          : regionCalendar.days.filter(
              (d) => `${d.dayOne}/${d.dayTwo}` === DAY_SCHEDULE[dayType]
            );

      const books = dayData.flatMap((d) => d.books);
      const characters: MaterialItem[] = dayData.flatMap((d) =>
        d.characters.map((char) => ({
          name: char.name,
          url: char.url,
          isTracked: trackedCharacterNames.has(char.name),
        }))
      );

      return {
        region: regionCalendar.location,
        regionIconUrl: regionUrlMap[regionCalendar.location],
        books,
        characters,
      };
    });
  }, [calendar, dayType, trackedCharacterNames, regionUrlMap]);

  const weaponMaterials = useMemo((): WeaponMaterialsByNation[] => {
    if (!schedule || schedule.length === 0) return [];

    return schedule.map((nationSchedule: WeaponMaterialSchedule) => {
      const dayData =
        dayType === 'all'
          ? nationSchedule.materials
          : nationSchedule.materials.filter(
              (m) => `${m.dayOne}/${m.dayTwo}` === DAY_SCHEDULE[dayType]
            );

      const weapons: MaterialItem[] = dayData.flatMap((d) =>
        d.weapons.map((weapon) => ({
          name: weapon.name,
          url: weapon.iconUrl,
          isTracked: trackedWeaponNames.has(weapon.name),
        }))
      );

      const materials = dayData.flatMap((d) => d.materialImages);

      return {
        nation: nationSchedule.nation,
        nationIconUrl: regionUrlMap[nationSchedule.nation],
        materials,
        weapons,
      };
    });
  }, [schedule, dayType, trackedWeaponNames, regionUrlMap]);

  return {
    dayType,
    currentDay,
    isSunday,
    talentMaterials,
    weaponMaterials,
    regionUrlMap,
  };
}
