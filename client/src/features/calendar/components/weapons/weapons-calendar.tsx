import React, { useState } from 'react';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TabDisplay } from '@/components/utils/tab-display';
import { useRegions } from '@/stores/usePrimitivesStore';

import { useWeaponFilter } from '../../hooks';
import {
  useWeaponMaterialError,
  useWeaponMaterialLoading,
  useWeaponMaterialSchedule,
} from '../../stores/useWeaponMaterialStore';
import { ViewToggle } from '../shared';
import WeaponTable from './weapon-table';
import WeaponCalendarView from './weapons-calendar-view';

const WeaponCalendar: React.FC = () => {
  const [isCalendar, setIsCalendar] = useState(false);
  const weaponMaterialSchedule = useWeaponMaterialSchedule();
  const loading = useWeaponMaterialLoading();
  const error = useWeaponMaterialError();

  const nations = useRegions();

  const { filteredSchedule } = useWeaponFilter(weaponMaterialSchedule || []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  if (weaponMaterialSchedule === null || nations.length === 0)
    return <div>No data</div>;

  return (
    <div>
      <Tabs defaultValue={nations[0]?.name}>
        <TabsList className="h-auto md:h-10 flex-wrap md:flex-nowrap justify-start overflow-x-auto gap-1">
          {nations.map((nation) => (
            <TabsTrigger
              key={nation.name}
              value={nation.name}
              className="text-xs md:text-sm px-3 md:px-4"
            >
              <TabDisplay
                element={nation.name}
                elementUrl={nation.url}
                size="sm"
                showLabel={true}
              />
            </TabsTrigger>
          ))}
        </TabsList>
        {nations.map((nation) => {
          const schedule = filteredSchedule?.find(
            (s) => s.nation === nation.name
          );
          return (
            <TabsContent key={nation.name} value={nation.name}>
              <ViewToggle
                isCalendar={isCalendar}
                onToggle={() => setIsCalendar(!isCalendar)}
              />
              {schedule &&
                (isCalendar ? (
                  <WeaponCalendarView nDays={7} schedule={schedule} />
                ) : (
                  <WeaponTable schedule={schedule} />
                ))}
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
};

export default WeaponCalendar;
