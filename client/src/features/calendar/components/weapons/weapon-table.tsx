import React from 'react';

import WeaponAvatar from '@/features/weapons/components/shared/card/weapon-avatar';

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

export default WeaponTable;
