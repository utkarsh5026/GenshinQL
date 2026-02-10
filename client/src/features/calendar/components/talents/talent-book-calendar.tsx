import React, { useEffect, useMemo, useState } from 'react';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CachedImage } from '@/features/cache';
import { usePrimitivesStore } from '@/stores';

import { useTalentBooksStore } from '../../stores';
import { ViewToggle } from '../shared';
import TalentCalendarView from './talent-calendar-view';
import TalentTable from './talents-table';

const TalentCalender: React.FC = () => {
  const [isCalendar, setIsCalendar] = useState(false);
  const { calendar, fetchBooks } = useTalentBooksStore();
  const { primitives } = usePrimitivesStore();

  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);

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
              </TabsContent>
            );
          })}
        </Tabs>
      </div>
    );
};

export default TalentCalender;
