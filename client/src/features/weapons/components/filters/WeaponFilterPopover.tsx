import { Filter } from 'lucide-react';
import React, { useMemo } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { CachedImage } from '@/features/cache';
import { SubstatIcon } from '@/features/weapons/utils';
import type { SubstatType } from '@/features/weapons/utils/substat-utils';

import type { WeaponFiltersCommonProps } from '../../types';

/**
 * Popover-based weapon filter component
 * Provides a compact, mobile-friendly interface for filtering weapons
 * by type, rarity, and substat using checkboxes
 */
export const WeaponFilterPopover: React.FC<WeaponFiltersCommonProps> = ({
  selectedWeaponTypes,
  selectedRarities,
  selectedSubstats,
  weaponTypes,
  uniqueRarities,
  uniqueSubstats,
  onToggleWeaponType,
  onToggleRarity,
  onToggleSubstat,
  onClearAll,
}) => {
  const activeFilterCount = useMemo(
    () =>
      selectedWeaponTypes.length +
      selectedRarities.length +
      selectedSubstats.length,
    [selectedWeaponTypes, selectedRarities, selectedSubstats]
  );

  const renderRarityStars = (rarity: number) => {
    const starColor = rarity === 5 ? 'text-yellow-500' : 'text-violet-500';
    return (
      <div className="flex gap-0.5">
        {Array.from({ length: rarity }).map((_, index) => (
          <span key={`${rarity}-star-${index}`} className={`${starColor}`}>
            ★
          </span>
        ))}
      </div>
    );
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="w-full sm:w-auto justify-center sm:justify-start relative"
        >
          <Filter className="mr-2 h-4 w-4" />
          Filters
          {activeFilterCount > 0 && (
            <Badge className="ml-2 h-5 min-w-5 text-xs px-1.5">
              {activeFilterCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent
        className="w-[calc(100vw-2rem)] sm:w-80 md:w-96 max-h-[70vh] overflow-y-auto"
        align="start"
        side="bottom"
      >
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-base">Filters</h4>
            {activeFilterCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClearAll}
                className="h-8 text-xs"
              >
                Clear all
              </Button>
            )}
          </div>

          {/* Weapon Type Filter Section */}
          {weaponTypes.length > 0 && (
            <>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Weapon Type
                </label>
                <div className="space-y-2">
                  {weaponTypes.map((weaponType) => (
                    <div
                      key={weaponType.name}
                      className="flex items-center space-x-2 cursor-pointer hover:bg-muted/50 p-1 rounded transition-colors"
                      onClick={() => onToggleWeaponType(weaponType.name)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          onToggleWeaponType(weaponType.name);
                        }
                      }}
                      role="checkbox"
                      aria-checked={selectedWeaponTypes.includes(
                        weaponType.name
                      )}
                      tabIndex={0}
                    >
                      <Checkbox
                        id={`weapon-type-${weaponType.name}`}
                        checked={selectedWeaponTypes.includes(weaponType.name)}
                        onCheckedChange={() =>
                          onToggleWeaponType(weaponType.name)
                        }
                        onClick={(e) => e.stopPropagation()}
                      />
                      <div className="flex items-center gap-2 text-sm flex-1">
                        <CachedImage
                          src={weaponType.url}
                          alt={weaponType.name}
                          width={20}
                          height={20}
                          className="w-5 h-5"
                        />
                        <span>{weaponType.name}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <Separator />
            </>
          )}

          {/* Rarity Filter Section */}
          {uniqueRarities.length > 0 && (
            <>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Rarity
                </label>
                <div className="space-y-2">
                  {uniqueRarities.map((rarity) => (
                    <div
                      key={rarity}
                      className="flex items-center space-x-2 cursor-pointer hover:bg-muted/50 p-1 rounded transition-colors"
                      onClick={() => onToggleRarity(rarity)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          onToggleRarity(rarity);
                        }
                      }}
                      role="checkbox"
                      aria-checked={selectedRarities.includes(rarity)}
                      tabIndex={0}
                    >
                      <Checkbox
                        id={`rarity-${rarity}`}
                        checked={selectedRarities.includes(rarity)}
                        onCheckedChange={() => onToggleRarity(rarity)}
                        onClick={(e) => e.stopPropagation()}
                      />
                      <div className="flex items-center gap-2 text-sm flex-1">
                        {renderRarityStars(rarity)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <Separator />
            </>
          )}

          {/* Substat Filter Section */}
          {uniqueSubstats.length > 0 && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Substat
              </label>
              <div className="space-y-2">
                {uniqueSubstats.map((substat) => (
                  <div
                    key={substat}
                    className="flex items-center space-x-2 cursor-pointer hover:bg-muted/50 p-1 rounded transition-colors"
                    onClick={() => onToggleSubstat(substat)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        onToggleSubstat(substat);
                      }
                    }}
                    role="checkbox"
                    aria-checked={selectedSubstats.includes(substat)}
                    tabIndex={0}
                  >
                    <Checkbox
                      id={`substat-${substat}`}
                      checked={selectedSubstats.includes(substat)}
                      onCheckedChange={() => onToggleSubstat(substat)}
                      onClick={(e) => e.stopPropagation()}
                    />
                    <div className="flex items-center gap-2 text-sm flex-1">
                      <SubstatIcon
                        type={substat as SubstatType}
                        size={16}
                        className="opacity-80"
                      />
                      <span>{substat}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};
