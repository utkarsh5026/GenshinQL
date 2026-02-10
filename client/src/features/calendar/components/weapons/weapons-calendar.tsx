import React, { useState } from 'react';

import { ElementDisplay } from '@/components/character/utils/DisplayComponents';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useRegions, useWeaponTypes } from '@/stores/usePrimitivesStore';

import { useWeaponFilter } from '../../hooks';
import {
  useWeaponMaterialError,
  useWeaponMaterialLoading,
  useWeaponMaterialSchedule,
} from '../../stores/useWeaponMaterialStore';
import { ViewToggle } from '../shared';
import WeaponCalendarFilters from './weapon-calendar-filters';
import WeaponTable from './weapon-table';
import WeaponCalendarView from './weapons-calendar-view';

const WeaponCalendar: React.FC = () => {
  const [isCalendar, setIsCalendar] = useState(false);
  const weaponMaterialSchedule = useWeaponMaterialSchedule();
  const loading = useWeaponMaterialLoading();
  const error = useWeaponMaterialError();

  const nations = useRegions();
  const weaponTypes = useWeaponTypes();

  const {
    filters,
    filteredSchedule,
    uniqueRarities,
    uniqueSubstats,
    toggleWeaponType,
    toggleRarity,
    toggleSubstat,
    clearAllFilters,
  } = useWeaponFilter(weaponMaterialSchedule || []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  if (weaponMaterialSchedule === null || nations.length === 0)
    return <div>No data</div>;

  return (
    <div>
      {/* Filters */}
      <WeaponCalendarFilters
        selectedWeaponTypes={filters.weaponTypes}
        selectedRarities={filters.rarities}
        selectedSubstats={filters.substats}
        weaponTypes={weaponTypes}
        uniqueRarities={uniqueRarities}
        uniqueSubstats={uniqueSubstats}
        onToggleWeaponType={toggleWeaponType}
        onToggleRarity={toggleRarity}
        onToggleSubstat={toggleSubstat}
        onClearAll={clearAllFilters}
      />

      <Tabs defaultValue={nations[0]?.name}>
        <TabsList className="flex-wrap md:flex-nowrap justify-start overflow-x-auto">
          {nations.map((nation) => (
            <TabsTrigger
              key={nation.name}
              value={nation.name}
              className="text-xs md:text-sm px-3 md:px-4"
            >
              <ElementDisplay
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
