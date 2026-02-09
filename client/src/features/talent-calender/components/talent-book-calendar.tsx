import { Aperture, CalendarDays } from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';

import { Button } from '@/components/ui/button.tsx';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs.tsx';
import { CachedImage } from '@/features/cache';
import TalentCalendarView from '@/features/talent-calender/components/talent-calendar-view';
import TalentTable from '@/features/talent-calender/components/talents-table';
import { usePrimitivesStore } from '@/stores';

import { useTalentBooksStore } from '../stores';

/**
 * TalentCalender component displays a calendar or table view of talent books.
 *
 * @returns {JSX.Element | null} The rendered component.
 */
const TalentCalender: React.FC = () => {
  const [isCalendar, setIsCalendar] = useState(false);
  const { calendar, fetchBooks } = useTalentBooksStore();
  const { primitives, fetchPrimitives } = usePrimitivesStore();

  useEffect(() => {
    fetchBooks();
    fetchPrimitives();
  }, [fetchBooks, fetchPrimitives]);

  const locations = useMemo(() => {
    const books = calendar || [];
    return books.map(({ location }) => location);
  }, [calendar]);

  const regionsWithIcons = useMemo(() => {
    if (!primitives?.regions) return [];

    return locations.map((location) => {
      const region = primitives.regions.find(
        (r) => r.name.toLowerCase() === location.toLowerCase()
      );
      return {
        name: location,
        iconUrl: region?.url || '',
      };
    });
  }, [locations, primitives]);

  const talentBooks = calendar || [];

  if (locations.length > 0)
    return (
      <div>
        <Tabs defaultValue={locations[0]}>
          <TabsList className="flex-wrap md:flex-nowrap justify-start overflow-x-auto">
            {regionsWithIcons.map((region) => {
              return (
                <TabsTrigger
                  key={region.name}
                  value={region.name}
                  className="text-xs md:text-sm px-3 md:px-4 flex items-center gap-2"
                >
                  {region.iconUrl && (
                    <CachedImage
                      src={region.iconUrl}
                      alt={region.name}
                      width={20}
                      height={20}
                      className="w-4 h-4 md:w-5 md:h-5 rounded-full"
                    />
                  )}
                  <span>{region.name}</span>
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
                    className="bg-success-200 text-success-900 border-2 text-xs md:text-sm h-9 md:h-10"
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
