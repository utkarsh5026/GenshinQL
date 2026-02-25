import React, { useEffect, useMemo, useState } from 'react';

import { ScrollTabItem, ScrollTabs } from '@/components/ui/scroll-tabs';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { CachedImage } from '@/features/cache';
import { usePrimitivesStore } from '@/stores';

import { useTalentBooksStore } from '../../stores';
import { ViewToggle } from '../shared';
import TalentCalendarView from './talent-calendar-view';
import TalentTable from './talents-table';

const TalentCalender: React.FC = () => {
  const [isCalendar, setIsCalendar] = useState(false);
  const [activeTab, setActiveTab] = useState('');
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

  const tabItems = useMemo<ScrollTabItem[]>(
    () =>
      regionsWithIcons.map((region) => ({
        icon: region.iconUrl ? (
          <CachedImage
            src={region.iconUrl}
            alt={region.name}
            width={20}
            height={20}
            className="h-full w-full rounded-full object-cover"
          />
        ) : undefined,
        id: region.name,
        label: region.name,
      })),
    [regionsWithIcons]
  );

  const talentBooks = calendar || [];
  const currentTab = activeTab || locations[0] || '';

  if (locations.length > 0)
    return (
      <div>
        <ScrollTabs
          items={tabItems}
          activeId={currentTab}
          onChange={setActiveTab}
          className="m-2"
        />
        <Tabs value={currentTab}>
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
