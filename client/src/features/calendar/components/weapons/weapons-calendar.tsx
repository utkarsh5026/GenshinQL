import React, { useMemo, useState } from 'react';

import { useRegions } from '@/stores/usePrimitivesStore';

import { useWeaponFilter } from '../../hooks';
import {
  useWeaponMaterialError,
  useWeaponMaterialLoading,
  useWeaponMaterialSchedule,
} from '../../stores/useWeaponMaterialStore';
import { RegionTabs, ViewToggle } from '../shared';
import WeaponTable from './weapon-table';
import WeaponCalendarView from './weapons-calendar-view';

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
