import React, { useEffect, useMemo, useState } from 'react';

import CharacterGrid from '@/features/characters/components/utils/characters-grid';

import { TALENT_CALENDAR_THEME } from '../../constants';
import { useTalentCalendar } from '../../hooks';
import { useTalentBooksStore } from '../../stores';
import type { TalentBookCalendar } from '../../types';
import { CalendarGrid, RegionTabs, ScheduleTable, ViewToggle } from '../shared';

interface TalentBooksProps {
  books: {
    name: string;
    url: string;
  }[];
}

const TalentBooks: React.FC<TalentBooksProps> = ({ books }) => {
  return (
    <div className="flex flex-col gap-2">
      {books.map(({ name, url }) => (
        <div key={name} className="flex items-center gap-3">
          <img
            src={url}
            alt={name}
            className="h-10 w-10 md:h-12 md:w-12 shrink-0"
          />
          <span className="text-xs md:text-sm font-light text-white/90">
            {name}
          </span>
        </div>
      ))}
    </div>
  );
};

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
    <CalendarGrid
      entries={calendar}
      columns={{ first: 'Date', middle: 'Talent Books', right: 'Characters' }}
      renderMiddle={(data) => <TalentBooks books={data.books} />}
      renderRight={(data) => (
        <CharacterGrid characterNames={data.characters.map((c) => c.name)} />
      )}
      sundayMiddleMessage="All books can be farmed"
      sundayRightMessage="All characters can be farmed"
      theme={TALENT_CALENDAR_THEME}
    />
  );
};

const TalentCalender: React.FC = () => {
  const [isCalendar, setIsCalendar] = useState(false);
  const [activeTab, setActiveTab] = useState('');
  const { calendar, fetchBooks } = useTalentBooksStore();

  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);

  const locations = useMemo(
    () => (calendar || []).map(({ location }) => location),
    [calendar]
  );

  const currentTab = activeTab || locations[0] || '';

  if (locations.length === 0) return null;

  const books = (calendar || []).find((book) => book.location === currentTab);

  return (
    <div>
      <RegionTabs
        regions={locations}
        activeRegion={currentTab}
        onChange={setActiveTab}
        className="m-2"
      />
      <ViewToggle
        isCalendar={isCalendar}
        onToggle={() => setIsCalendar(!isCalendar)}
      />
      {books &&
        (isCalendar ? (
          <TalentCalendarView nDays={7} talent={books} />
        ) : (
          <ScheduleTable
            days={books.days}
            columns={{ left: 'Talent Books', right: 'Characters' }}
            renderDay={(d) => `${d.dayOne} / ${d.dayTwo}`}
            renderLeft={(d) => <TalentBooks books={d.books} />}
            renderRight={(d) => (
              <CharacterGrid characterNames={d.characters.map((c) => c.name)} />
            )}
            theme={TALENT_CALENDAR_THEME}
          />
        ))}
    </div>
  );
};

export default TalentCalender;
