import React from 'react';

import CharacterGrid from '@/components/character/utils/CharacterGrid.tsx';

import { useTalentCalendar } from '../hooks';
import type { TalentBookCalendar } from '../types';
import TalentBooks from './talent-books';

interface TalentCalendarViewProps {
  nDays: number;
  talent: TalentBookCalendar;
}

const TalentCalendarView: React.FC<TalentCalendarViewProps> = ({
  nDays,
  talent,
}) => {
  const { calendar } = useTalentCalendar(nDays, talent);

  return (
    <div className="font-sans max-w-350 mx-auto p-4 md:p-8">
      <div className="grid gap-px bg-surface-200 rounded-xl overflow-hidden border border-border">
        <div className="hidden md:grid md:grid-cols-[200px_1fr_2fr] bg-surface-100 border-b border-border">
          <div className="px-4 md:px-6 py-5 text-[0.6875rem] font-bold tracking-widest uppercase text-muted-foreground font-mono">
            Date
          </div>
          <div className="px-4 md:px-6 py-5 text-[0.6875rem] font-bold tracking-widest uppercase text-muted-foreground font-mono">
            Talent Books
          </div>
          <div className="px-4 md:px-6 py-5 text-[0.6875rem] font-bold tracking-widest uppercase text-muted-foreground font-mono">
            Characters
          </div>
        </div>

        {calendar.map((d) => (
          <div
            key={d.date}
            className={`flex flex-col md:grid md:grid-cols-[200px_1fr_2fr] bg-card transition-colors duration-150 border-b border-border last:border-b-0 hover:bg-accent ${
              d.isSunday
                ? 'bg-linear-to-r from-celestial-800/20 to-celestial-800/10 md:border-l-[3px] border-l-celestial-500 hover:from-celestial-800/30 hover:to-celestial-800/15'
                : ''
            }`}
          >
            <div className="px-4 py-4 md:px-6 md:py-7 flex flex-col gap-1.5 md:gap-2 md:border-r border-border bg-surface-100 md:bg-transparent">
              <div className="text-sm md:text-[0.9375rem] font-medium text-foreground font-mono">
                {d.date}
              </div>
              <div className="text-xs md:text-xs text-muted-foreground font-normal tracking-wide">
                {d.currDay}
              </div>
            </div>

            <div className="px-4 py-4 md:px-6 md:py-7 md:border-r border-border">
              <div className="md:hidden text-xs font-bold tracking-wider uppercase text-muted-foreground mb-2 font-mono">
                Talent Books
              </div>
              {d.isSunday ? (
                <div className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-2.5 text-sm md:text-sm text-celestial-300 font-medium">
                  <span className="inline-flex px-2.5 py-1 bg-celestial-500/20 rounded text-[0.6875rem] font-semibold tracking-wider uppercase font-mono border border-celestial-500/30">
                    All Available
                  </span>
                  <span className="text-xs md:text-sm">
                    All books can be farmed
                  </span>
                </div>
              ) : (
                <TalentBooks books={d.books} />
              )}
            </div>

            <div className="px-4 py-4 md:px-6 md:py-7">
              <div className="md:hidden text-xs font-bold tracking-wider uppercase text-muted-foreground mb-2 font-mono">
                Characters
              </div>
              {d.isSunday ? (
                <div className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-2.5 text-sm md:text-sm text-celestial-300 font-medium">
                  <span className="inline-flex px-2.5 py-1 bg-celestial-500/20 rounded text-[0.6875rem] font-semibold tracking-wider uppercase font-mono border border-celestial-500/30">
                    All Available
                  </span>
                  <span className="text-xs md:text-sm">
                    All characters can be farmed
                  </span>
                </div>
              ) : (
                <CharacterGrid characters={d.characters} />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TalentCalendarView;
