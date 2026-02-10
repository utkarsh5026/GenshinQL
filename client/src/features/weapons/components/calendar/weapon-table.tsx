import React from 'react';

import { ScheduleTable } from '@/features/calendar';

import { WEAPON_CALENDAR_THEME } from '../../constants';
import type { WeaponMaterialSchedule } from '../../stores/useWeaponMaterialStore';
import WeaponShowCase from '../shared/weapons-showcase';
import MaterialImageList from './material-image-list';

interface WeaponTableProps {
  schedule: WeaponMaterialSchedule;
}

const WeaponTable: React.FC<WeaponTableProps> = ({ schedule }) => {
  return (
    <ScheduleTable
      days={schedule.materials}
      columns={{ first: 'Day', middle: 'Materials', right: 'Weapons' }}
      renderDay={(d) => d.day.replace(/\n/g, ' ')}
      renderMiddle={(d) => (
        <MaterialImageList materialImages={d.materialImages} />
      )}
      renderRight={(d) => (
        <WeaponShowCase
          weapons={d.weapons}
          enableFilters={false}
          enableNavigation={false}
        />
      )}
      sortTodayFirst
      theme={WEAPON_CALENDAR_THEME}
    />
  );
};

export default WeaponTable;
