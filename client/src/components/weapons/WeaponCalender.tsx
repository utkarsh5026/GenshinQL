import React, { useEffect, useMemo } from 'react';

import { useWeaponMaterialStore } from '@/stores';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import ScheduleTable from './ScheduleTable';

const WeaponCalender: React.FC = () => {
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
      <Tabs defaultValue={nations[0]} defaultChecked>
        <TabsList>
          {nations.map((nation) => {
            return (
              <TabsTrigger key={nation} value={nation}>
                {nation}
              </TabsTrigger>
            );
          })}
        </TabsList>
        {nations.map((nation, index) => {
          return (
            <TabsContent key={nation} value={nation}>
              <ScheduleTable schedule={weaponMaterialSchedule[index]} />
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
};

export default WeaponCalender;
