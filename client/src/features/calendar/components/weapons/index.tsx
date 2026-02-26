import React, { useMemo, useState } from 'react';

import { CachedImage } from '@/features/cache';
import WeaponAvatar from '@/features/weapons/components/shared/card/weapon-avatar';
import { useRegions } from '@/stores/usePrimitivesStore';

import { WEAPON_CALENDAR_THEME } from '../../constants';
import { useWeaponCalendar, useWeaponFilter } from '../../hooks';
import {
  useWeaponMaterialError,
  useWeaponMaterialLoading,
  useWeaponMaterialSchedule,
  type WeaponMaterialSchedule,
} from '../../stores/useWeaponMaterialStore';
import { CalendarGrid, RegionTabs, ScheduleTable, ViewToggle } from '../shared';

interface MaterialImage {
  url: string;
  caption: string;
}

interface MaterialImageListProps {
  materialImages: MaterialImage[];
}

const MaterialImageList: React.FC<MaterialImageListProps> = ({
  materialImages,
}) => {
  return (
    <div className="flex flex-wrap gap-3">
      {materialImages.map(({ url, caption }) => (
        <div key={url} className="flex flex-col items-center">
          <CachedImage
            src={url}
            alt={caption}
            className="w-12 h-12 border border-border rounded-lg p-1"
            lazy={true}
            showSkeleton={true}
            skeletonShape="rounded"
            skeletonSize="md"
          />
          <span className="text-[0.625rem] text-muted-foreground mt-1 text-center max-w-15 truncate">
            {caption}
          </span>
        </div>
      ))}
    </div>
  );
};

interface WeaponCalendarViewProps {
  nDays: number;
  schedule: WeaponMaterialSchedule;
}

const WeaponCalendarView: React.FC<WeaponCalendarViewProps> = ({
  nDays,
  schedule,
}) => {
  const { calendar } = useWeaponCalendar(nDays, schedule);

  return (
    <CalendarGrid
      entries={calendar}
      columns={{ first: 'Date', middle: 'Materials', right: 'Weapons' }}
      renderMiddle={(data) => (
        <MaterialImageList materialImages={data.materialImages} />
      )}
      renderRight={(data) => (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-4 lg:grid-cols-6 gap-2">
          {data.weapons.map((weapon) => (
            <WeaponAvatar
              key={weapon.name}
              weaponName={weapon.name}
              size="sm"
            />
          ))}
        </div>
      )}
      sundayMiddleMessage="All materials can be farmed"
      sundayRightMessage="All weapons can be farmed"
      showTodayBadge
      theme={WEAPON_CALENDAR_THEME}
    />
  );
};

// ─── WeaponTable ──────────────────────────────────────────────────────────────

interface WeaponTableProps {
  schedule: WeaponMaterialSchedule;
}

const WeaponTable: React.FC<WeaponTableProps> = ({ schedule }) => {
  return (
    <ScheduleTable
      days={schedule.materials}
      columns={{ left: 'Materials', right: 'Weapons' }}
      renderDay={(d) => `${d.dayOne} / ${d.dayTwo}`}
      renderLeft={(d) => (
        <MaterialImageList materialImages={d.materialImages} />
      )}
      renderRight={(d) => (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-4 lg:grid-cols-6 gap-2">
          {d.weapons.map(({ name }) => (
            <WeaponAvatar key={name} weaponName={name} showName size="md" />
          ))}
        </div>
      )}
      sortTodayFirst
      theme={WEAPON_CALENDAR_THEME}
    />
  );
};

const WeaponCalendar: React.FC = () => {
  const [isCalendar, setIsCalendar] = useState(false);
  const [activeNation, setActiveNation] = useState('');

  const weaponMaterialSchedule = useWeaponMaterialSchedule();
  const loading = useWeaponMaterialLoading();
  const error = useWeaponMaterialError();

  const nations = useRegions();
  const nationNames = useMemo(() => nations.map((n) => n.name), [nations]);

  const currentNation = activeNation || nationNames[0] || '';

  const { filteredSchedule } = useWeaponFilter(weaponMaterialSchedule || []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  if (weaponMaterialSchedule === null || nations.length === 0)
    return <div>No data</div>;

  const schedule = filteredSchedule?.find((s) => s.nation === currentNation);

  return (
    <div>
      <RegionTabs
        regions={nationNames}
        activeRegion={currentNation}
        onChange={setActiveNation}
        className="m-2"
      />
      <ViewToggle
        isCalendar={isCalendar}
        onToggle={() => setIsCalendar(!isCalendar)}
      />
      {schedule &&
        (isCalendar ? (
          <WeaponCalendarView nDays={7} schedule={schedule} />
        ) : (
          <WeaponTable schedule={schedule} />
        ))}
    </div>
  );
};

export default WeaponCalendar;
