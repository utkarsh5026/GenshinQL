import React, { useEffect, useMemo, useState } from 'react';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs.tsx';
import TalentTable from '@/components/talents/TalentTable.tsx';
import { Button } from '@/components/ui/button.tsx';
import { Aperture, CalendarDays } from 'lucide-react';
import TalentCalendarView from '@/components/talents/TalentCalendarView.tsx';
import { useTalentBooksStore } from '@/stores';

/**
 * TalentCalender component displays a calendar or table view of talent books.
 *
 * @returns {JSX.Element | null} The rendered component.
 */
const TalentCalender: React.FC = () => {
  const [isCalendar, setIsCalendar] = useState(false);
  const { calendar, loading, fetchBooks } = useTalentBooksStore();

  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);

  const locations = useMemo(() => {
    const books = calendar || [];
    return books.map(({ location }) => location);
  }, [calendar]);

  const talentBooks = calendar || [];

  console.log(talentBooks.length, loading);

  if (locations.length > 0)
    return (
      <div>
        <Tabs defaultValue={locations[0]}>
          <TabsList className="flex-wrap md:flex-nowrap justify-start overflow-x-auto">
            {locations.map((loc) => {
              return (
                <TabsTrigger key={loc} value={loc} className="text-xs md:text-sm px-3 md:px-4">
                  {loc}
                </TabsTrigger>
              );
            })}
          </TabsList>
          {locations.map((loc) => {
            const books = talentBooks.find((book) => book.location === loc);
            return (
              <TabsContent key={loc} value={loc}>
                <div className="w-full flex justify-end my-3 md:my-5">
                  <Button
                    className="bg-green-200 text-green-950 border-2 text-xs md:text-sm h-9 md:h-10"
                    onClick={() => {
                      setIsCalendar(!isCalendar);
                    }}
                  >
                    <div className={'flex gap-1.5 md:gap-2'}>
                      {isCalendar ? (
                        <CalendarDays size={16} className="md:w-5 md:h-5" />
                      ) : (
                        <Aperture size={16} className="md:w-5 md:h-5" />
                      )}

                      <div className="hidden sm:block">
                        {isCalendar ? 'Switch to Table' : 'Switch to Calendar'}
                      </div>
                      <div className="sm:hidden">
                        {isCalendar ? 'Table' : 'Calendar'}
                      </div>
                    </div>
                  </Button>
                </div>
                {books &&
                  (isCalendar ? (
                    <TalentCalendarView nDays={7} talent={books} />
                  ) : (
                    <TalentTable talent={books} />
                  ))}
              </TabsContent>
            );
          })}
        </Tabs>
      </div>
    );
};

export default TalentCalender;
