import React, { useMemo } from 'react';

import CharacterGrid from '@/components/character/utils/CharacterGrid.tsx';
import TalentBooks from '@/components/talents/TalentBooks.tsx';
import type { TalentBookCalendar } from '@/types';

interface TalentTableProps {
  talent: TalentBookCalendar;
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

/**
 * TalentTable component displays a table of talent books and characters.
 *
 * @param {TalentTableProps} props - The props for the component.
 * @param {TalentBookCalendar} props.talent - The talent book calendar data.
 * @returns {JSX.Element} The rendered table component.
 */
const TalentTable: React.FC<TalentTableProps> = ({ talent }) => {
  const days = useMemo(() => talent.days, [talent.days]);

  return (
    <div className="font-sans max-w-[1400px] mx-auto p-4 md:p-8">
      <div className="grid gap-px bg-white/[0.06] rounded-xl overflow-hidden border border-white/[0.08]">
        <div className="hidden md:grid md:grid-cols-[200px_1fr_2fr] bg-white/[0.02] border-b border-white/10">
          <div className="px-6 py-5 text-[0.6875rem] font-bold tracking-[0.1em] uppercase text-white/50 font-mono">
            Day
          </div>
          <div className="px-6 py-5 text-[0.6875rem] font-bold tracking-[0.1em] uppercase text-white/50 font-mono">
            Talent Books
          </div>
          <div className="px-6 py-5 text-[0.6875rem] font-bold tracking-[0.1em] uppercase text-white/50 font-mono">
            Characters
          </div>
        </div>

        {days.map((d) => {
          const { day, books, characters } = d;
          const isToday = day.includes(getTodayDayOfWeek());

          return (
            <div
              key={day}
              className={`flex flex-col md:grid md:grid-cols-[200px_1fr_2fr] bg-black/20 transition-colors duration-150 border-b border-white/[0.04] last:border-b-0 hover:bg-white/[0.03] ${
                isToday
                  ? 'bg-gradient-to-r from-[#a8a29e]/[0.08] to-[#a8a29e]/[0.04] md:border-l-[3px] border-l-[#d4af37]/60 hover:from-[#a8a29e]/[0.12] hover:to-[#a8a29e]/[0.06]'
                  : ''
              }`}
            >
              <div className="px-4 py-4 md:px-6 md:py-7 flex flex-col gap-2 md:border-r border-white/[0.06] bg-white/[0.02] md:bg-transparent">
                <div className="text-sm md:text-[0.9375rem] font-medium text-white/95">
                  {day}
                </div>
                {isToday && (
                  <span className="inline-flex w-fit px-2.5 py-1 bg-[#d4af37]/15 rounded text-[0.6875rem] font-semibold tracking-wider uppercase text-[#d4af37]/90 font-mono border border-[#d4af37]/25">
                    Today
                  </span>
                )}
              </div>

              <div className="px-4 py-4 md:px-6 md:py-7 md:border-r border-white/[0.06]">
                <div className="md:hidden text-xs font-bold tracking-wider uppercase text-white/50 mb-2 font-mono">
                  Talent Books
                </div>
                <TalentBooks books={books} />
              </div>

              <div className="px-4 py-4 md:px-6 md:py-7">
                <div className="md:hidden text-xs font-bold tracking-wider uppercase text-white/50 mb-2 font-mono">
                  Characters
                </div>
                <CharacterGrid characters={characters} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TalentTable;
