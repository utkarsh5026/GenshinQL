import React from 'react';

import type { WeaponMaterialSchedule } from '@/stores/useWeaponMaterialStore';

import WeaponShowCase from '../shared/weapons-showcase';
import MaterialImageList from './material-image-list';

interface WeaponTableProps {
  schedule: WeaponMaterialSchedule;
}

const getTodayDayOfWeek = () => {
  const days = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ];
  const date = new Date();
  return days[date.getDay()];
};

const WeaponTable: React.FC<WeaponTableProps> = ({ schedule }) => {
  const { materials } = schedule;
  const todayDayOfWeek = getTodayDayOfWeek();

  // Sort materials to put today first
  const sortedMaterials = [...materials].sort((a, b) => {
    const aIsToday = a.day.includes(todayDayOfWeek);
    const bIsToday = b.day.includes(todayDayOfWeek);
    if (aIsToday && !bIsToday) return -1;
    if (!aIsToday && bIsToday) return 1;
    return 0;
  });

  return (
    <div className="font-sans max-w-350 mx-auto p-4 md:p-8">
      <div className="grid gap-px bg-white/6 rounded-xl overflow-hidden border border-white/8">
        <div className="hidden md:grid md:grid-cols-[200px_1fr_2fr] bg-white/2 border-b border-white/10">
          <div className="px-6 py-5 text-[0.6875rem] font-bold tracking-widest uppercase text-white/50 font-mono">
            Day
          </div>
          <div className="px-6 py-5 text-[0.6875rem] font-bold tracking-widest uppercase text-white/50 font-mono">
            Materials
          </div>
          <div className="px-6 py-5 text-[0.6875rem] font-bold tracking-widest uppercase text-white/50 font-mono">
            Weapons
          </div>
        </div>

        {sortedMaterials.map((material) => {
          const isToday = material.day.includes(getTodayDayOfWeek());

          return (
            <div
              key={material.day}
              className={`flex flex-col md:grid md:grid-cols-[200px_1fr_2fr] bg-black/20 transition-colors duration-150 border-b border-white/4 last:border-b-0 hover:bg-white/3 ${
                isToday
                  ? 'bg-linear-to-r from-success-500/8 to-success-500/4 md:border-l-[3px] border-l-success-500/60 hover:from-success-500/12 hover:to-success-500/6'
                  : ''
              }`}
            >
              <div className="px-4 py-4 md:px-6 md:py-7 flex flex-col gap-2 md:border-r border-white/6 bg-white/2 md:bg-transparent">
                <div className="text-sm md:text-[0.9375rem] font-medium text-white/95">
                  {material.day.replace(/\n/g, ' ')}
                </div>
                {isToday && (
                  <span className="inline-flex w-fit px-2.5 py-1 bg-success-500/15 rounded text-[0.6875rem] font-semibold tracking-wider uppercase text-success-500 font-mono border border-success-500/25">
                    Today
                  </span>
                )}
              </div>

              <div className="px-4 py-4 md:px-6 md:py-7 md:border-r border-white/6">
                <div className="md:hidden text-xs font-bold tracking-wider uppercase text-white/50 mb-2 font-mono">
                  Materials
                </div>
                <MaterialImageList materialImages={material.materialImages} />
              </div>

              <div className="px-4 py-4 md:px-6 md:py-7">
                <div className="md:hidden text-xs font-bold tracking-wider uppercase text-white/50 mb-2 font-mono">
                  Weapons
                </div>
                <WeaponShowCase
                  weapons={material.weapons}
                  enableFilters={false}
                  enableNavigation={false}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WeaponTable;
