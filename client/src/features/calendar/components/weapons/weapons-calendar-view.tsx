import React from 'react';

import WeaponAvatar from '@/features/weapons/components/shared/card/weapon-avatar';

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

export default WeaponCalendarView;
