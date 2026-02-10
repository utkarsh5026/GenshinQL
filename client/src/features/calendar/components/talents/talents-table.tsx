import React from 'react';

import CharacterGrid from '@/features/characters/components/utils/characters-grid';

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
      renderRight={(d) => (
        <CharacterGrid characterNames={d.characters.map((c) => c.name)} />
      )}
      theme={TALENT_CALENDAR_THEME}
    />
  );
};

export default TalentTable;
