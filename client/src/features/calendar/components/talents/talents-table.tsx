import React from 'react';

import CharacterGrid from '@/components/character/utils/CharacterGrid';

import { TALENT_CALENDAR_THEME } from '../../constants';
import type { TalentBookCalendar } from '../../types';
import { ScheduleTable } from '../shared';
import TalentBooks from './talent-books';

interface TalentTableProps {
  talent: TalentBookCalendar;
}

const TalentTable: React.FC<TalentTableProps> = ({ talent }) => {
  return (
    <ScheduleTable
      days={talent.days}
      columns={{ first: 'Day', middle: 'Talent Books', right: 'Characters' }}
      renderDay={(d) => d.day}
      renderMiddle={(d) => <TalentBooks books={d.books} />}
      renderRight={(d) => <CharacterGrid characters={d.characters} />}
      theme={TALENT_CALENDAR_THEME}
    />
  );
};

export default TalentTable;
