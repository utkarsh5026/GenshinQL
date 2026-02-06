import React, { useEffect } from 'react';

import { usePrimitivesStore, useWeaponsStore, useWeaponTypes } from '@/stores';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../ui/tabs';
import WeaponsDetailedGrid from './weapons-grid';

/**
 * WeaponsDetailed component displays a tabbed interface for different weapon types.
 */
const WeaponsDetailed: React.FC = () => {
  const { weapons, fetchWeapons, weaponTypeMap } = useWeaponsStore();
  const weaponTypes = useWeaponTypes();
  const { fetchPrimitives } = usePrimitivesStore();

  useEffect(() => {
    fetchWeapons();
    fetchPrimitives();
  }, [fetchWeapons, fetchPrimitives]);

  // Create a map of weapon type names to their icon URLs
  const weaponTypeIconMap = React.useMemo(() => {
    return weaponTypes.reduce(
      (acc, { name, url }) => {
        acc[name] = url;
        return acc;
      },
      {} as Record<string, string>
    );
  }, [weaponTypes]);

  if (!weaponTypeMap) return null;
  return (
    <Tabs defaultValue={Object.keys(weaponTypeMap)[0]}>
      <TabsList>
        {Object.keys(weaponTypeMap).map((type) => (
          <TabsTrigger key={type} value={type}>
            <div className="flex items-center gap-2">
              {weaponTypeIconMap[type] && (
                <img
                  src={weaponTypeIconMap[type]}
                  alt={type}
                  className="h-5 w-5 object-contain"
                />
              )}
              <span>{type}</span>
            </div>
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
