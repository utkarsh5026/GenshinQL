import React from 'react';

import WeaponShowCase from '@/features/weapons/components/shared/weapons-showcase';

import { WEAPON_CALENDAR_THEME } from '../../constants';
import { useWeaponCalendar } from '../../hooks/useWeaponCalendar';
import type { WeaponMaterialSchedule } from '../../stores/useWeaponMaterialStore';
import { CalendarGrid } from '../shared';
import MaterialImageList from './material-image-list';

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
        <WeaponShowCase
          weapons={data.weapons}
          enableFilters={false}
          enableNavigation={false}
        />
      )}
      sundayMiddleMessage="All materials can be farmed"
      sundayRightMessage="All weapons can be farmed"
      showTodayBadge
      theme={WEAPON_CALENDAR_THEME}
    />
  );
};

export default WeaponCalendarView;
