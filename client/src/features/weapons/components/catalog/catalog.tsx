import React, { useEffect, useState } from 'react';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { usePrimitivesStore, useWeaponsStore, useWeaponTypes } from '@/stores';

import WeaponsDetailedGrid from './weapons-grid';

/**
 * WeaponsCatalog component displays a tabbed interface for different weapon types.
 */
const WeaponsCatalog: React.FC = () => {
  const { weapons, fetchWeapons, weaponTypeMap } = useWeaponsStore();
  const weaponTypes = useWeaponTypes();
  const { fetchPrimitives } = usePrimitivesStore();
  const [selectedRarity, setSelectedRarity] = useState<number | null>(null);

  useEffect(() => {
    fetchWeapons();
    fetchPrimitives();
  }, [fetchWeapons, fetchPrimitives]);

  const weaponTypeIconMap = React.useMemo(() => {
    return weaponTypes.reduce(
      (acc, { name, url }) => {
        acc[name] = url;
        return acc;
      },
      {} as Record<string, string>
    );
  }, [weaponTypes]);

  const rarities = [4, 5];

  const getRarityColor = (rarity: number, isSelected: boolean) => {
    const colors = {
      1: isSelected ? 'text-gray-200' : 'text-gray-400',
      2: isSelected ? 'text-green-200' : 'text-green-400',
      3: isSelected ? 'text-blue-200' : 'text-blue-400',
      4: isSelected ? 'text-purple-200' : 'text-purple-400',
      5: isSelected ? 'text-yellow-200' : 'text-yellow-400',
    };
    return colors[rarity as keyof typeof colors];
  };

  if (!weaponTypeMap) return null;
  return (
    <Tabs defaultValue={Object.keys(weaponTypeMap)[0]}>
      {/* Unified Filter Bar: Weapon Types + Rarity in One Line */}
      <div className="w-full overflow-x-auto scrollbar-hide bg-midnight-800 rounded-lg p-2">
        <div className="flex items-center gap-3 min-w-max">
          {/* Weapon Types Section */}
          <div className="flex items-center gap-2 pr-3 border-r border-border/50">
            <span className="text-xs text-muted-foreground font-medium shrink-0 hidden sm:inline">
              Type:
            </span>
            <TabsList className="p-0 bg-transparent h-auto gap-1">
              {Object.keys(weaponTypeMap).map((type) => (
                <TabsTrigger
                  key={type}
                  value={type}
                  className="shrink-0 min-w-10 px-2 sm:px-3 py-1.5 h-auto data-[state=active]:bg-primary/20 data-[state=active]:text-primary"
                >
                  <div className="flex items-center gap-1.5">
                    {weaponTypeIconMap[type] && (
                      <img
                        src={weaponTypeIconMap[type]}
                        alt={type}
                        className="h-4 w-4 object-contain shrink-0"
                      />
                    )}
                    <span className="hidden sm:inline text-xs">{type}</span>
                  </div>
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {/* Rarity Filter Section */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground font-medium shrink-0 hidden sm:inline">
              Rarity:
            </span>
            <div className="flex gap-1.5">
              <button
                onClick={() => setSelectedRarity(null)}
                className={`shrink-0 px-2.5 py-1.5 rounded-md text-xs font-medium border transition-all ${
                  selectedRarity === null
                    ? 'bg-primary/20 border-primary text-primary'
                    : 'bg-muted/30 border-border/30 text-muted-foreground hover:bg-muted/50'
                }`}
              >
                All
              </button>
              {rarities.map((rarity) => (
                <button
                  key={rarity}
                  onClick={() =>
                    setSelectedRarity(selectedRarity === rarity ? null : rarity)
                  }
                  className={`shrink-0 px-2.5 py-1.5 rounded-md text-xs font-medium border transition-all ${getRarityColor(
                    rarity,
                    selectedRarity === rarity
                  )}`}
                >
                  {rarity}★
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

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
