import React from 'react';

import CharacterGrid from '@/components/character/utils/CharacterGrid';

import { TALENT_CALENDAR_THEME } from '../../constants';
import { useTalentCalendar } from '../../hooks';
import type { TalentBookCalendar } from '../../types';
import { CalendarGrid } from '../shared';
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
    <CalendarGrid
      entries={calendar}
      columns={{ first: 'Date', middle: 'Talent Books', right: 'Characters' }}
      renderMiddle={(data) => <TalentBooks books={data.books} />}
      renderRight={(data) => <CharacterGrid characters={data.characters} />}
      sundayMiddleMessage="All books can be farmed"
      sundayRightMessage="All characters can be farmed"
      theme={TALENT_CALENDAR_THEME}
    />
  );
};

export default TalentCalendarView;
