import React, { useCallback, useMemo, useState } from 'react';

import { ElementDisplay } from '@/components/character/utils/DisplayComponents';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { parseSubstat } from '@/features/weapons/utils/substat-utils';
import { useRegions, useWeaponTypes } from '@/stores/usePrimitivesStore';

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

  const [selectedWeaponTypes, setSelectedWeaponTypes] = useState<string[]>([]);
  const [selectedRarities, setSelectedRarities] = useState<number[]>([]);
  const [selectedSubstats, setSelectedSubstats] = useState<string[]>([]);

  const regions = useRegions();
  const weaponTypes = useWeaponTypes();

  const nations = useMemo(() => {
    if (weaponMaterialSchedule === null || regions.length === 0) return [];
    return regions.filter((region) =>
      weaponMaterialSchedule.some((s) => s.nation === region.name)
    );
  }, [weaponMaterialSchedule, regions]);

  // Compute unique filter options from schedule data
  const { uniqueRarities, uniqueSubstats } = useMemo(() => {
    if (!weaponMaterialSchedule)
      return { uniqueRarities: [], uniqueSubstats: [] };

    const raritySet = new Set<number>();
    const substatSet = new Set<string>();

    weaponMaterialSchedule.forEach((schedule) => {
      schedule.materials.forEach((material) => {
        material.weapons.forEach((weapon) => {
          raritySet.add(weapon.rarity);
          const parsed = parseSubstat(weapon.subStat);
          if (parsed.type !== 'None' && parsed.type !== 'Physical DMG Bonus') {
            substatSet.add(parsed.type);
          }
        });
      });
    });

    return {
      uniqueRarities: Array.from(raritySet).sort((a, b) => b - a), // 5→1
      uniqueSubstats: Array.from(substatSet).sort(),
    };
  }, [weaponMaterialSchedule]);

  // Toggle functions
  const toggleWeaponType = useCallback((type: string) => {
    setSelectedWeaponTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  }, []);

  const toggleRarity = useCallback((rarity: number) => {
    setSelectedRarities((prev) =>
      prev.includes(rarity)
        ? prev.filter((r) => r !== rarity)
        : [...prev, rarity]
    );
  }, []);

  const toggleSubstat = useCallback((substat: string) => {
    setSelectedSubstats((prev) =>
      prev.includes(substat)
        ? prev.filter((s) => s !== substat)
        : [...prev, substat]
    );
  }, []);

  const clearAllFilters = useCallback(() => {
    setSelectedWeaponTypes([]);
    setSelectedRarities([]);
    setSelectedSubstats([]);
  }, []);

  // Filter schedule data
  const filteredSchedule = useMemo(() => {
    if (!weaponMaterialSchedule) return null;

    const hasActiveFilters =
      selectedWeaponTypes.length > 0 ||
      selectedRarities.length > 0 ||
      selectedSubstats.length > 0;

    if (!hasActiveFilters) return weaponMaterialSchedule;

    return weaponMaterialSchedule.map((schedule) => ({
      ...schedule,
      materials: schedule.materials.map((material) => ({
        ...material,
        weapons: material.weapons.filter((weapon) => {
          const matchesType =
            selectedWeaponTypes.length === 0 ||
            selectedWeaponTypes.includes(weapon.weaponType);

          const matchesRarity =
            selectedRarities.length === 0 ||
            selectedRarities.includes(weapon.rarity);

          let matchesSubstat = true;
          if (selectedSubstats.length > 0) {
            const parsed = parseSubstat(weapon.subStat);
            matchesSubstat = selectedSubstats.includes(parsed.type);
          }

          return matchesType && matchesRarity && matchesSubstat;
        }),
      })),
    }));
  }, [
    weaponMaterialSchedule,
    selectedWeaponTypes,
    selectedRarities,
    selectedSubstats,
  ]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  if (weaponMaterialSchedule === null || nations.length === 0)
    return <div>No data</div>;

  return (
    <div>
      {/* Filters */}
      <WeaponCalendarFilters
        selectedWeaponTypes={selectedWeaponTypes}
        selectedRarities={selectedRarities}
        selectedSubstats={selectedSubstats}
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
