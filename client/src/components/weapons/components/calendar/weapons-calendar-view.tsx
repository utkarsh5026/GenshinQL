import React, { useMemo } from 'react';

import { WeaponMaterialSchedule } from '@/stores/useWeaponMaterialStore';

import WeaponShowCase from '../shared/weapons-showcase';
import MaterialImageList from './material-image-list';

function getNextNDaysFromToday(n: number) {
  const today = new Date();
  const dates: Date[] = [];
  for (let i = 0; i < n; i++) {
    const nextDay = new Date(today);
    nextDay.setDate(today.getDate() + i);
    dates.push(nextDay);
  }
  return dates;
}

interface WeaponCalendarViewProps {
  nDays: number;
  schedule: WeaponMaterialSchedule;
}

const WeaponCalendarView: React.FC<WeaponCalendarViewProps> = ({
  nDays,
  schedule,
}) => {
  const dates = getNextNDaysFromToday(nDays);
  const data = useMemo(() => {
    const days = [
      'Sunday',
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
    ];
    return dates.map((date) => {
      const currDay = days[date.getDay()];
      const filteredMaterial = schedule.materials.find((material) =>
        material.day.includes(currDay)
      );

      if (filteredMaterial === undefined)
        return {
          date: date.toDateString(),
          isSunday: true,
          currDay,
          materialImages: [],
          weapons: [],
        };

      return {
        date: date.toDateString(),
        isSunday: false,
        currDay,
        materialImages: filteredMaterial.materialImages,
        weapons: filteredMaterial.weapons,
      };
    });
  }, [dates, schedule.materials]);

  return (
    <div className="font-sans max-w-350 mx-auto p-4 md:p-8">
      <div className="grid gap-px bg-white/6 rounded-xl overflow-hidden border border-white/8">
        <div className="hidden md:grid md:grid-cols-[200px_1fr_2fr] bg-white/2 border-b border-white/10">
          <div className="px-4 md:px-6 py-5 text-[0.6875rem] font-bold tracking-widest uppercase text-white/50 font-mono">
            Date
          </div>
          <div className="px-4 md:px-6 py-5 text-[0.6875rem] font-bold tracking-widest uppercase text-white/50 font-mono">
            Materials
          </div>
          <div className="px-4 md:px-6 py-5 text-[0.6875rem] font-bold tracking-widest uppercase text-white/50 font-mono">
            Weapons
          </div>
        </div>

        {data.map((d, index) => (
          <div
            key={d.date}
            className={`flex flex-col md:grid md:grid-cols-[200px_1fr_2fr] bg-black/20 transition-colors duration-150 border-b border-white/4 last:border-b-0 hover:bg-white/3 ${
              d.isSunday
                ? 'bg-linear-to-r from-warning-500/8 to-warning-500/4 md:border-l-[3px] border-l-warning-500/60 hover:from-warning-500/12 hover:to-warning-500/6'
                : ''
            }`}
          >
            <div className="px-4 py-4 md:px-6 md:py-7 flex flex-col gap-1.5 md:gap-2 md:border-r border-white/6 bg-white/2 md:bg-transparent">
              <div className="text-sm md:text-[0.9375rem] font-medium text-white/95 font-mono">
                {d.date}
              </div>
              <div className="text-xs md:text-xs text-white/40 font-normal tracking-wide">
                {d.currDay}
              </div>
              {index === 0 && (
                <span className="inline-flex w-fit px-2.5 py-1 bg-success-500/15 rounded text-[0.6875rem] font-semibold tracking-wider uppercase text-success-500 font-mono border border-success-500/25">
                  Today
                </span>
              )}
            </div>

            <div className="px-4 py-4 md:px-6 md:py-7 md:border-r border-white/6">
              <div className="md:hidden text-xs font-bold tracking-wider uppercase text-white/50 mb-2 font-mono">
                Materials
              </div>
              {d.isSunday ? (
                <div className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-2.5 text-sm md:text-sm text-warning-500 font-medium">
                  <span className="inline-flex px-2.5 py-1 bg-warning-500/15 rounded text-[0.6875rem] font-semibold tracking-wider uppercase font-mono border border-warning-500/25">
                    All Available
                  </span>
                  <span className="text-xs md:text-sm">
                    All materials can be farmed
                  </span>
                </div>
              ) : (
                <MaterialImageList materialImages={d.materialImages} />
              )}
            </div>

            <div className="px-4 py-4 md:px-6 md:py-7">
              <div className="md:hidden text-xs font-bold tracking-wider uppercase text-white/50 mb-2 font-mono">
                Weapons
              </div>
              {d.isSunday ? (
                <div className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-2.5 text-sm md:text-sm text-warning-500 font-medium">
                  <span className="inline-flex px-2.5 py-1 bg-warning-500/15 rounded text-[0.6875rem] font-semibold tracking-wider uppercase font-mono border border-warning-500/25">
                    All Available
                  </span>
                  <span className="text-xs md:text-sm">
                    All weapons can be farmed
                  </span>
                </div>
              ) : (
                <WeaponShowCase
                  weapons={d.weapons}
                  enableFilters={false}
                  enableNavigation={false}
                />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WeaponCalendarView;
