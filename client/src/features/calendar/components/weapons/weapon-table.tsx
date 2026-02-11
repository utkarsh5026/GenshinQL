import React from 'react';

import WeaponShowCase from '@/features/weapons/components/shared/weapons-showcase';

import { WEAPON_CALENDAR_THEME } from '../../constants';
import type { WeaponMaterialSchedule } from '../../stores/useWeaponMaterialStore';
import { ScheduleTable } from '../shared';
import MaterialImageList from './material-image-list';

interface WeaponTableProps {
  schedule: WeaponMaterialSchedule;
}

const WeaponTable: React.FC<WeaponTableProps> = ({ schedule }) => {
  return (
    <ScheduleTable
      days={schedule.materials}
      columns={{ first: 'Day', middle: 'Materials', right: 'Weapons' }}
      renderDay={(d) => `${d.dayOne} / ${d.dayTwo}`}
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
