import React, { useMemo } from 'react';

import CharacterGrid from '@/components/character/utils/CharacterGrid.tsx';
import TalentBooks from '@/components/talents/talent-books';
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
    <div className="font-sans max-w-350 mx-auto p-4 md:p-8">
      <div className="grid gap-px bg-surface-200 rounded-xl overflow-hidden border border-border">
        <div className="hidden md:grid md:grid-cols-[200px_1fr_2fr] bg-surface-100 border-b border-border">
          <div className="px-6 py-5 text-[0.6875rem] font-bold tracking-widest uppercase text-muted-foreground font-mono">
            Day
          </div>
          <div className="px-6 py-5 text-[0.6875rem] font-bold tracking-widest uppercase text-muted-foreground font-mono">
            Talent Books
          </div>
          <div className="px-6 py-5 text-[0.6875rem] font-bold tracking-widest uppercase text-muted-foreground font-mono">
            Characters
          </div>
        </div>

        {days.map((d) => {
          const { day, books, characters } = d;
          const isToday = day.includes(getTodayDayOfWeek());

          return (
            <div
              key={day}
              className={`flex flex-col md:grid md:grid-cols-[200px_1fr_2fr] bg-card transition-colors duration-150 border-b border-border last:border-b-0 hover:bg-accent ${
                isToday
                  ? 'bg-linear-to-r from-celestial-800/20 to-celestial-800/10 md:border-l-[3px] border-l-celestial-500 hover:from-celestial-800/30 hover:to-celestial-800/15'
                  : ''
              }`}
            >
              <div className="px-4 py-4 md:px-6 md:py-7 flex flex-col gap-2 md:border-r border-border bg-surface-100 md:bg-transparent">
                <div className="text-sm md:text-[0.9375rem] font-medium text-foreground">
                  {day}
                </div>
                {isToday && (
                  <span className="inline-flex w-fit px-2.5 py-1 bg-celestial-500/20 rounded text-[0.6875rem] font-semibold tracking-wider uppercase text-celestial-300 font-mono border border-celestial-500/30">
                    Today
                  </span>
                )}
              </div>

              <div className="px-4 py-4 md:px-6 md:py-7 md:border-r border-border">
                <div className="md:hidden text-xs font-bold tracking-wider uppercase text-muted-foreground mb-2 font-mono">
                  Talent Books
                </div>
                <TalentBooks books={books} />
              </div>

              <div className="px-4 py-4 md:px-6 md:py-7">
                <div className="md:hidden text-xs font-bold tracking-wider uppercase text-muted-foreground mb-2 font-mono">
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
