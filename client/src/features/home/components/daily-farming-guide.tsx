import { BookOpen, Calendar, Sparkles, Sword } from 'lucide-react';
import React, { useMemo } from 'react';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { CachedImage } from '@/features/cache';
import type {
  TalentBookCalendar,
  WeaponMaterialSchedule,
} from '@/features/calendar';
import {
  useTalentCalendar,
  useWeaponMaterialSchedule,
} from '@/features/calendar';
import { cn } from '@/lib/utils';
import {
  useTrackedCharacters,
  useTrackedWeapons,
} from '@/stores/useTrackerStore';
import type { ImageUrl } from '@/types';

import { DAY_SCHEDULE } from '../constants';
import { type DayType, getCurrentDayName, getDayType } from '../utils';

interface MaterialItemProps {
  name: string;
  iconUrl: string;
  isTracked?: boolean;
  onClick?: () => void;
}

const MaterialItem: React.FC<MaterialItemProps> = ({
  name,
  iconUrl,
  isTracked,
}) => {
  return (
    <div
      className={cn(
        'flex flex-col items-center gap-1 p-2 rounded-lg transition-all',
        'hover:bg-accent/50',
        isTracked && 'ring-2 ring-amber-500 bg-amber-500/10'
      )}
    >
      <div className="relative">
        <CachedImage
          src={iconUrl}
          alt={name}
          width={48}
          height={48}
          className="w-10 h-10 md:w-12 md:h-12 rounded-lg"
        />
        {isTracked && (
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-amber-500 rounded-full" />
        )}
      </div>
      <span className="text-[10px] md:text-xs text-center text-muted-foreground line-clamp-2 max-w-[60px]">
        {name}
      </span>
    </div>
  );
};

interface RegionMaterialsProps {
  region: string;
  books: { name: string; url: string }[];
  characters: { name: string; url: string }[];
  trackedCharacterNames: Set<string>;
}

const RegionTalentMaterials: React.FC<RegionMaterialsProps> = ({
  region,
  books,
  characters,
  trackedCharacterNames,
}) => {
  const trackedChars = characters.filter((c) =>
    trackedCharacterNames.has(c.name)
  );
  const otherChars = characters.filter(
    (c) => !trackedCharacterNames.has(c.name)
  );

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-foreground">{region}</span>
        <div className="flex gap-1">
          {books.map((book) => (
            <CachedImage
              key={book.name}
              src={book.url}
              alt={book.name}
              width={24}
              height={24}
              className="w-5 h-5 md:w-6 md:h-6 rounded"
            />
          ))}
        </div>
      </div>
      <div className="flex flex-wrap gap-1">
        {trackedChars.map((char) => (
          <MaterialItem
            key={char.name}
            name={char.name}
            iconUrl={char.url}
            isTracked
          />
        ))}
        {otherChars.slice(0, 8).map((char) => (
          <MaterialItem key={char.name} name={char.name} iconUrl={char.url} />
        ))}
        {otherChars.length > 8 && (
          <div className="flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-lg bg-muted text-muted-foreground text-xs">
            +{otherChars.length - 8}
          </div>
        )}
      </div>
    </div>
  );
};

interface WeaponMaterialsSectionProps {
  dayType: DayType;
  trackedWeaponNames: Set<string>;
}

interface WeaponData {
  name: string;
  url: string;
  isTracked: boolean;
}

interface NationWeaponData {
  nation: string;
  weapons: WeaponData[];
  materials: ImageUrl[];
}

const WeaponMaterialsSection: React.FC<WeaponMaterialsSectionProps> = ({
  dayType,
  trackedWeaponNames,
}) => {
  const schedule = useWeaponMaterialSchedule();

  const todayWeapons = useMemo((): NationWeaponData[] => {
    if (!schedule || schedule.length === 0) return [];

    return schedule.map((nationSchedule: WeaponMaterialSchedule) => {
      const dayData =
        dayType === 'all'
          ? nationSchedule.materials
          : nationSchedule.materials.filter(
              (m) => m.day === DAY_SCHEDULE[dayType]
            );

      const weapons: WeaponData[] = dayData.flatMap((d) =>
        d.weapons.map((w) => ({
          name: w.name,
          url: w.iconUrl,
          isTracked: trackedWeaponNames.has(w.name),
        }))
      );

      const materials: ImageUrl[] = dayData.flatMap((d) => d.materialImages);

      return {
        nation: nationSchedule.nation,
        weapons,
        materials,
      };
    });
  }, [schedule, dayType, trackedWeaponNames]);

  if (todayWeapons.length === 0) return null;

  return (
    <div className="space-y-4">
      {todayWeapons.map(({ nation, weapons, materials }: NationWeaponData) => {
        if (weapons.length === 0) return null;

        const trackedWeapons = weapons.filter((w: WeaponData) => w.isTracked);
        const otherWeapons = weapons.filter((w: WeaponData) => !w.isTracked);

        return (
          <div key={nation} className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-foreground">
                {nation}
              </span>
              <div className="flex gap-1">
                {materials.slice(0, 4).map((mat: ImageUrl) => (
                  <CachedImage
                    key={mat.caption}
                    src={mat.url}
                    alt={mat.caption}
                    width={24}
                    height={24}
                    className="w-5 h-5 md:w-6 md:h-6 rounded"
                  />
                ))}
              </div>
            </div>
            <div className="flex flex-wrap gap-1">
              {trackedWeapons.map((weapon: WeaponData) => (
                <MaterialItem
                  key={weapon.name}
                  name={weapon.name}
                  iconUrl={weapon.url}
                  isTracked
                />
              ))}
              {otherWeapons.slice(0, 6).map((weapon: WeaponData) => (
                <MaterialItem
                  key={weapon.name}
                  name={weapon.name}
                  iconUrl={weapon.url}
                />
              ))}
              {otherWeapons.length > 6 && (
                <div className="flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-lg bg-muted text-muted-foreground text-xs">
                  +{otherWeapons.length - 6}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export const DailyFarmingGuide: React.FC = () => {
  const calendar = useTalentCalendar();
  const trackedCharacters = useTrackedCharacters();
  const trackedWeapons = useTrackedWeapons();

  const dayType = useMemo(() => getDayType(), []);
  const currentDay = useMemo(() => getCurrentDayName(), []);

  const trackedCharacterNames = useMemo(
    () => new Set(trackedCharacters.map((c) => c.name)),
    [trackedCharacters]
  );

  const trackedWeaponNames = useMemo(
    () => new Set(trackedWeapons.map((w) => w.name)),
    [trackedWeapons]
  );

  const todayTalentData = useMemo(() => {
    if (!calendar) return [];

    return calendar.map((region: TalentBookCalendar) => {
      const dayData =
        dayType === 'all'
          ? region.days
          : region.days.filter((d) => d.day === DAY_SCHEDULE[dayType]);

      return {
        region: region.location,
        books: dayData.flatMap((d) => d.books),
        characters: dayData.flatMap((d) => d.characters),
      };
    });
  }, [calendar, dayType]);

  const isSunday = dayType === 'all';

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {/* Talent Materials Card */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-purple-500" />
              <CardTitle className="text-lg">Talent Materials</CardTitle>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="w-4 h-4" />
              <span>{currentDay}</span>
            </div>
          </div>
          <CardDescription>
            {isSunday ? (
              <span className="flex items-center gap-1 text-amber-500">
                <Sparkles className="w-3 h-3" />
                All materials available today!
              </span>
            ) : (
              `Available talent books for ${currentDay}`
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {todayTalentData.map(({ region, books, characters }) => (
            <RegionTalentMaterials
              key={region}
              region={region}
              books={books}
              characters={characters}
              trackedCharacterNames={trackedCharacterNames}
            />
          ))}
        </CardContent>
      </Card>

      {/* Weapon Materials Card */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sword className="w-5 h-5 text-orange-500" />
              <CardTitle className="text-lg">Weapon Materials</CardTitle>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="w-4 h-4" />
              <span>{currentDay}</span>
            </div>
          </div>
          <CardDescription>
            {isSunday ? (
              <span className="flex items-center gap-1 text-amber-500">
                <Sparkles className="w-3 h-3" />
                All materials available today!
              </span>
            ) : (
              `Available weapon materials for ${currentDay}`
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <WeaponMaterialsSection
            dayType={dayType}
            trackedWeaponNames={trackedWeaponNames}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default DailyFarmingGuide;
