import React, { useEffect } from 'react';

import { useWeaponsStore } from '@/stores';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import WeaponsDetailedGrid from './WeaponsDetailedGrid';

/**
 * WeaponsDetailed component displays a tabbed interface for different weapon types.
 * It fetches weapon data on mount and organizes weapons by their types.
 * Each tab shows a grid of weapons filtered by the selected weapon type.
 *
 * @returns A tabbed interface showing weapon grids organized by type, or null if weapon data is not loaded
 */
const WeaponsDetailed: React.FC = () => {
  const { weapons, fetchWeapons, weaponTypeMap } = useWeaponsStore();

  useEffect(() => {
    fetchWeapons();
  }, [fetchWeapons]);

  if (!weaponTypeMap) return null;
  return (
    <Tabs defaultValue={Object.keys(weaponTypeMap)[0]}>
      <TabsList>
        {Object.keys(weaponTypeMap).map((type) => (
          <TabsTrigger key={type} value={type}>
            {type}
          </TabsTrigger>
        ))}
      </TabsList>

      {Object.entries(weaponTypeMap).map(([type, indices]) => (
        <TabsContent key={type} value={type}>
          <WeaponsDetailedGrid
            weapons={indices.map((index) => weapons[index])}
          />
        </TabsContent>
      ))}
    </Tabs>
  );
};

export default WeaponsDetailed;
