import { Aperture, CalendarDays } from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useWeaponMaterialStore } from '@/stores';

import WeaponTable from '../../WeaponTable';
import WeaponCalendarView from './weapons-calendar-view';

const WeaponCalender: React.FC = () => {
  const [isCalendar, setIsCalendar] = useState(false);
  const { weaponMaterialSchedule, loading, error, fetchWeaponMaterials } =
    useWeaponMaterialStore();

  useEffect(() => {
    if (weaponMaterialSchedule === null) fetchWeaponMaterials();
  }, [weaponMaterialSchedule, fetchWeaponMaterials]);

  const nations = useMemo(() => {
    if (weaponMaterialSchedule === null) return [];
    return weaponMaterialSchedule.map((schedule) => schedule.nation);
  }, [weaponMaterialSchedule]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  if (weaponMaterialSchedule === null || nations.length === 0)
    return <div>No data</div>;

  return (
    <div>
      <Tabs defaultValue={nations[0]}>
        <TabsList className="flex-wrap md:flex-nowrap justify-start overflow-x-auto">
          {nations.map((nation) => (
            <TabsTrigger
              key={nation}
              value={nation}
              className="text-xs md:text-sm px-3 md:px-4"
            >
              {nation}
            </TabsTrigger>
          ))}
        </TabsList>
        {nations.map((nation) => {
          const schedule = weaponMaterialSchedule.find(
            (s) => s.nation === nation
          );
          return (
            <TabsContent key={nation} value={nation}>
              <div className="w-full flex justify-end my-3 md:my-5">
                <Button
                  className="bg-green-200 text-green-950 border-2 text-xs md:text-sm h-9 md:h-10"
                  onClick={() => {
                    setIsCalendar(!isCalendar);
                  }}
                >
                  <div className="flex gap-1.5 md:gap-2">
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

export default WeaponCalender;
