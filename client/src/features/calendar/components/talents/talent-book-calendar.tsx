import React, { useEffect, useMemo, useState } from 'react';

import { useTalentBooksStore } from '../../stores';
import { RegionTabs, ViewToggle } from '../shared';
import TalentCalendarView from './talent-calendar-view';
import TalentTable from './talents-table';

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
          <TalentTable talent={books} />
        ))}
    </div>
  );
};

export default TalentCalender;
