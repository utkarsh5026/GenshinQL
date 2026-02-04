import React from 'react';

import type { WeaponMaterialSchedule } from '@/types';

import AvatarWithSkeleton from '../utils/AvatarWithSkeleton';
import WeaponShowCase from './WeaponShowCase';

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

  return (
    <div className="font-sans max-w-[1400px] mx-auto p-4 md:p-8">
      <div className="grid gap-px bg-white/[0.06] rounded-xl overflow-hidden border border-white/[0.08]">
        <div className="hidden md:grid md:grid-cols-[200px_1fr_2fr] bg-white/[0.02] border-b border-white/10">
          <div className="px-6 py-5 text-[0.6875rem] font-bold tracking-[0.1em] uppercase text-white/50 font-mono">
            Day
          </div>
          <div className="px-6 py-5 text-[0.6875rem] font-bold tracking-[0.1em] uppercase text-white/50 font-mono">
            Materials
          </div>
          <div className="px-6 py-5 text-[0.6875rem] font-bold tracking-[0.1em] uppercase text-white/50 font-mono">
            Weapons
          </div>
        </div>

        {materials.map((material) => {
          const isToday = material.day.includes(getTodayDayOfWeek());

          return (
            <div
              key={material.day}
              className={`flex flex-col md:grid md:grid-cols-[200px_1fr_2fr] bg-black/20 transition-colors duration-150 border-b border-white/[0.04] last:border-b-0 hover:bg-white/[0.03] ${
                isToday
                  ? 'bg-gradient-to-r from-[#a8a29e]/[0.08] to-[#a8a29e]/[0.04] md:border-l-[3px] border-l-[#d4af37]/60 hover:from-[#a8a29e]/[0.12] hover:to-[#a8a29e]/[0.06]'
                  : ''
              }`}
            >
              <div className="px-4 py-4 md:px-6 md:py-7 flex flex-col gap-2 md:border-r border-white/[0.06] bg-white/[0.02] md:bg-transparent">
                <div className="text-sm md:text-[0.9375rem] font-medium text-white/95">
                  {material.day.replace(/\n/g, ' ')}
                </div>
                {isToday && (
                  <span className="inline-flex w-fit px-2.5 py-1 bg-[#d4af37]/15 rounded text-[0.6875rem] font-semibold tracking-wider uppercase text-[#d4af37]/90 font-mono border border-[#d4af37]/25">
                    Today
                  </span>
                )}
              </div>

              <div className="px-4 py-4 md:px-6 md:py-7 md:border-r border-white/[0.06]">
                <div className="md:hidden text-xs font-bold tracking-wider uppercase text-white/50 mb-2 font-mono">
                  Materials
                </div>
                <div className="flex flex-wrap gap-3">
                  {material.materialImages.map((image) => (
                    <div key={image.url} className="flex flex-col items-center">
                      <AvatarWithSkeleton
                        name={image.caption}
                        url={image.url}
                        avatarClassName="w-12 h-12 border border-white/10 rounded-lg p-1"
                      />
                      <span className="text-[0.625rem] text-white/40 mt-1 text-center max-w-[60px] truncate">
                        {image.caption}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="px-4 py-4 md:px-6 md:py-7">
                <div className="md:hidden text-xs font-bold tracking-wider uppercase text-white/50 mb-2 font-mono">
                  Weapons
                </div>
                <WeaponShowCase weapons={material.weapons} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WeaponTable;
