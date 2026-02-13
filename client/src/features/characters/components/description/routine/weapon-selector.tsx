import { Swords } from 'lucide-react';
import React, { useCallback, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import FilterChip from '@/components/utils/filter/FilterChip';
import { CachedImage } from '@/features/cache';
import type { WeaponSummary } from '@/features/weapons';
import { useWeaponType } from '@/features/weapons';
import type { WeaponType } from '@/types';

interface WeaponSelectorProps {
  weaponType: string;
  selectedWeapons: WeaponSummary[];
  onWeaponSelect: (weapon: WeaponSummary) => void;
  onWeaponRemove: (weapon: WeaponSummary) => void;
  characterName: string;
}

export const WeaponSelector: React.FC<WeaponSelectorProps> = ({
  weaponType,
  selectedWeapons,
  onWeaponSelect,
  onWeaponRemove,
  characterName,
}) => {
  const [open, setOpen] = useState(false);
  const { weapons: weaponsOfType } = useWeaponType(weaponType as WeaponType);

  const isWeaponSelected = useCallback(
    (weapon: WeaponSummary) =>
      selectedWeapons.some((w) => w.name === weapon.name),
    [selectedWeapons]
  );

  const handleToggleWeapon = useCallback(
    (weapon: WeaponSummary) => {
      if (isWeaponSelected(weapon)) {
        onWeaponRemove(weapon);
      } else {
        onWeaponSelect(weapon);
      }
    },
    [isWeaponSelected, onWeaponSelect, onWeaponRemove]
  );

  const handleClearAll = useCallback(() => {
    selectedWeapons.forEach((weapon) => onWeaponRemove(weapon));
  }, [selectedWeapons, onWeaponRemove]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Swords className="h-4 w-4" />
          <span className="hidden sm:inline">Select Weapons</span>
          {selectedWeapons.length > 0 && (
            <Badge className="ml-1 h-5 min-w-5 text-xs px-1.5">
              {selectedWeapons.length}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent
        className="w-[calc(100vw-2rem)] sm:w-80"
        align="end"
        side="bottom"
      >
        <div className="space-y-3">
          {/* Search Section */}
          <Command className="bg-transparent">
            <CommandInput
              placeholder={`Search weapons for ${characterName}...`}
              className="h-9"
            />
            <CommandList className="max-h-[40vh] overflow-y-auto">
              <CommandEmpty>No weapons found.</CommandEmpty>
              {weaponsOfType.map((weapon) => {
                const isSelected = isWeaponSelected(weapon);
                return (
                  <CommandItem
                    key={weapon.name}
                    value={weapon.name}
                    onSelect={() => handleToggleWeapon(weapon)}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => handleToggleWeapon(weapon)}
                      onClick={(e) => e.stopPropagation()}
                    />
                    <CachedImage
                      src={weapon.iconUrl}
                      alt={weapon.name}
                      className="w-8 h-8 rounded"
                    />
                    <span className="flex-1 text-sm">{weapon.name}</span>
                  </CommandItem>
                );
              })}
            </CommandList>
          </Command>

          {/* Selected Weapons Section */}
          {selectedWeapons.length > 0 && (
            <>
              <Separator />
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium">
                    Selected ({selectedWeapons.length})
                  </h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClearAll}
                    className="h-7 text-xs"
                  >
                    Clear all
                  </Button>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {selectedWeapons.map((weapon) => (
                    <FilterChip
                      key={weapon.name}
                      label={weapon.name}
                      icon={weapon.iconUrl}
                      type="weaponType"
                      onRemove={() => onWeaponRemove(weapon)}
                    />
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};
