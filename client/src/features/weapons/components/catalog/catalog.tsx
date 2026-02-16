import React, { useEffect, useState } from 'react';

import { Tabs, TabsContent } from '@/components/ui/tabs';
import { usePrimitivesStore, useWeaponsStore, useWeaponTypes } from '@/stores';

import { UnifiedWeaponFilters } from '../filters/weapon-filters';
import WeaponsDetailedGrid from './weapons-grid';

/**
 * WeaponsCatalog component displays a tabbed interface for different weapon types.
 */
const WeaponsCatalog: React.FC = () => {
  const { weapons, fetchWeapons, weaponTypeMap } = useWeaponsStore();
  const weaponTypes = useWeaponTypes();
  const { fetchPrimitives } = usePrimitivesStore();
  const [selectedRarity, setSelectedRarity] = useState<number | null>(null);
  const [selectedWeaponType, setSelectedWeaponType] = useState<string>(() => {
    if (weaponTypeMap) {
      const firstType = Object.keys(weaponTypeMap)[0];
      return firstType || '';
    }
    return '';
  });

  useEffect(() => {
    fetchWeapons();
    fetchPrimitives();
  }, [fetchWeapons, fetchPrimitives]);

  const handleWeaponTypeChange = (type: string) => {
    setSelectedWeaponType(type);
  };

  const handleRarityToggle = (rarity: number) => {
    setSelectedRarity(selectedRarity === rarity ? null : rarity);
  };

  const handleClearAll = () => {
    setSelectedRarity(null);
  };

  if (!weaponTypeMap || !selectedWeaponType) return null;

  return (
    <Tabs value={selectedWeaponType} onValueChange={setSelectedWeaponType}>
      {/* Unified Filter Bar: Weapon Types + Rarity */}
      <UnifiedWeaponFilters
        selectedWeaponTypes={[selectedWeaponType]}
        selectedRarities={selectedRarity ? [selectedRarity] : []}
        weaponTypes={weaponTypes}
        availableRarities={[4, 5]}
        onToggleWeaponType={handleWeaponTypeChange}
        onToggleRarity={handleRarityToggle}
        onClearAll={handleClearAll}
        displayMode="tabs"
        variant="midnight"
        showActiveFilters={false}
        showSubstats={false}
        className="rounded-lg"
      />

      {Object.entries(weaponTypeMap).map(([type, indices]) => (
        <TabsContent key={type} value={type}>
          <WeaponsDetailedGrid
            weapons={indices.map((index) => weapons[index])}
            selectedRarity={selectedRarity}
            onRarityChange={setSelectedRarity}
          />
        </TabsContent>
      ))}
    </Tabs>
  );
};

export default WeaponsCatalog;
