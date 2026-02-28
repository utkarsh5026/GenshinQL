import * as PopoverPrimitive from '@radix-ui/react-popover';
import { X } from 'lucide-react';
import React, { useMemo, useState } from 'react';

import { AppInput } from '@/components/ui/app-input';
import { RarityStars } from '@/components/ui/genshin-game-icons';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { CachedImage } from '@/features/cache';
import type { WeaponSummary } from '@/features/weapons';
import { getRarityEntry } from '@/lib/game-colors';
import { cn } from '@/lib/utils';
import { useWeaponTypes } from '@/stores/usePrimitivesStore';

import { SlotPopover } from './slot-popover';

/** Class names for a quick-select option button based on active state. */
const optionButtonClass = (isActive: boolean) =>
  cn(
    'w-7 py-1 text-xs rounded-md font-semibold transition-all',
    isActive
      ? 'bg-primary text-primary-foreground'
      : 'bg-surface-300 hover:bg-midnight-700 text-muted-foreground'
  );

interface WeaponInfoProps {
  weapon: WeaponSummary;
  variant: 'compact' | 'full';
  isSelected?: boolean;
}

const WeaponInfo: React.FC<WeaponInfoProps> = ({
  weapon,
  variant,
  isSelected,
}) => {
  const isCompact = variant === 'compact';

  return (
    <>
      {isCompact ? (
        <CachedImage
          src={weapon.iconUrl}
          alt={weapon.name}
          className="w-6 h-6 object-contain shrink-0"
          showSkeleton={false}
        />
      ) : (
        <div
          className={cn(
            'w-8 h-8 rounded-md overflow-hidden shrink-0',
            getRarityEntry(weapon.rarity).bg
          )}
        >
          <CachedImage
            src={weapon.iconUrl}
            alt={weapon.name}
            className="w-full h-full object-cover"
            lazy
            skeletonShape="rounded"
            skeletonSize="sm"
          />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <p
            className={cn(
              'truncate',
              isCompact
                ? 'text-[11px] font-medium leading-tight'
                : 'text-xs font-semibold'
            )}
          >
            {weapon.name}
          </p>
          {!isCompact && <RarityStars rarity={weapon.rarity} size="xs" />}
        </div>
        <p
          className={cn(
            'text-[10px] text-muted-foreground truncate',
            isCompact && 'leading-tight'
          )}
        >
          {!isCompact && `${weapon.subStat} · `}
          {Math.round(weapon.attack)} ATK
        </p>
      </div>
      {isSelected && (
        <span className="text-[10px] font-bold text-primary shrink-0">✓</span>
      )}
    </>
  );
};

export interface WeaponSelectorProps {
  weapon: WeaponSummary | null;
  weaponTypeFilter?: string;
  weapons: WeaponSummary[];
  weaponRefinement: number;
  onSetWeapon: (w: WeaponSummary | null) => void;
  onSetRefinement: (r: number) => void;
}

export const WeaponSelector: React.FC<WeaponSelectorProps> = ({
  weapon,
  weaponTypeFilter,
  weapons,
  weaponRefinement,
  onSetWeapon,
  onSetRefinement,
}) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [rarityFilter, setRarityFilter] = useState<number | 'All'>('All');

  const weaponTypes = useWeaponTypes();
  const weaponTypeIcon = useMemo(
    () =>
      weaponTypeFilter
        ? weaponTypes.find(
            (wt) => wt.name.toLowerCase() === weaponTypeFilter.toLowerCase()
          )?.url
        : undefined,
    [weaponTypes, weaponTypeFilter]
  );

  const filtered = useMemo(
    () =>
      weapons.filter((w) => {
        const matchType =
          !weaponTypeFilter || w.weaponType === weaponTypeFilter;
        const matchSearch = w.name
          .toLowerCase()
          .includes(search.toLowerCase().trim());
        const matchRarity = rarityFilter === 'All' || w.rarity === rarityFilter;
        return matchType && matchSearch && matchRarity;
      }),
    [weapons, search, weaponTypeFilter, rarityFilter]
  );

  const resetFilters = () => {
    setSearch('');
    setRarityFilter('All');
  };

  const handleOpenChange = (o: boolean) => {
    setOpen(o);
    if (!o) resetFilters();
  };

  const handleSelect = (w: WeaponSummary) => {
    onSetWeapon(w);
    setOpen(false);
    resetFilters();
  };

  return (
    <div className="rounded-lg bg-midnight-800/80 hover:bg-surface-300/70 border border-midnight-700/50 hover:border-midnight-600/80 transition-all min-w-0">
      <Popover open={open} onOpenChange={handleOpenChange}>
        {weapon ? (
          <div className="flex items-center gap-1.5 px-2 py-1.5 min-w-0">
            <PopoverTrigger asChild>
              <button className="flex items-center gap-1.5 flex-1 min-w-0 text-left">
                <WeaponInfo weapon={weapon} variant="compact" />
              </button>
            </PopoverTrigger>
            <SlotPopover
              label={`R${weaponRefinement}`}
              title="Refinement"
              side="top"
              contentClassName="w-auto"
              triggerClassName="shrink-0 text-[10px]"
            >
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((r) => (
                  <PopoverPrimitive.Close key={r} asChild>
                    <button
                      onClick={() => onSetRefinement(r)}
                      className={optionButtonClass(weaponRefinement === r)}
                    >
                      R{r}
                    </button>
                  </PopoverPrimitive.Close>
                ))}
              </div>
            </SlotPopover>
          </div>
        ) : (
          <PopoverTrigger asChild>
            <button className="flex w-full items-center px-2 py-1.5 text-left">
              <span className="text-xs text-muted-foreground">
                Add weapon...
              </span>
            </button>
          </PopoverTrigger>
        )}

        <PopoverContent
          side="bottom"
          align="start"
          sideOffset={6}
          className="w-[min(320px,calc(100vw-2rem))] p-0 flex flex-col overflow-hidden max-h-[60svh]"
        >
          {/* Popover header */}
          <div className="flex items-center gap-2 px-3 pt-3 pb-2 border-b border-border/30">
            {weaponTypeIcon && (
              <CachedImage
                src={weaponTypeIcon}
                alt={weaponTypeFilter}
                className="w-4 h-4 object-contain shrink-0"
                showSkeleton={false}
              />
            )}
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide flex-1">
              {weaponTypeFilter ?? 'Weapon'}
            </span>
            <button
              onClick={() => handleOpenChange(false)}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Search */}
          <div className="px-3 pt-2.5 pb-1.5">
            <AppInput
              placeholder="Search weapons..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onClear={() => setSearch('')}
              className="bg-accent/40 border-border/50 rounded-lg text-xs placeholder:text-muted-foreground/60"
            />
          </div>

          {/* Rarity filter */}
          <div className="flex gap-1 px-3 pb-2">
            {(['All', 5, 4, 3] as const).map((r) => (
              <button
                key={r}
                onClick={() => setRarityFilter(r)}
                className={cn(
                  'px-2 py-0.5 rounded-full text-[10px] font-semibold whitespace-nowrap transition-all duration-200 border',
                  rarityFilter === r
                    ? r === 'All'
                      ? 'border-primary/60 bg-primary/20 text-primary'
                      : `${getRarityEntry(r).bg} text-foreground border-border/40`
                    : 'border-border/40 bg-accent/30 text-muted-foreground hover:text-foreground'
                )}
              >
                {r === 'All' ? 'All' : <RarityStars rarity={r} size="xs" />}
              </button>
            ))}
          </div>

          {/* Weapon list */}
          <div className="flex-1 overflow-y-auto px-3 pb-3 space-y-1">
            {filtered.map((w) => {
              const isSelected = weapon?.name === w.name;
              return (
                <button
                  key={w.name}
                  onClick={() => handleSelect(w)}
                  className={cn(
                    'w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg border text-left transition-all duration-150 hover:scale-[1.01]',
                    isSelected
                      ? `${getRarityEntry(w.rarity).bg} border-primary/30`
                      : 'border-border/30 bg-accent/20 hover:border-border/60 hover:bg-accent/40'
                  )}
                >
                  <WeaponInfo
                    weapon={w}
                    variant="full"
                    isSelected={isSelected}
                  />
                </button>
              );
            })}
            {filtered.length === 0 && (
              <div className="py-6 text-center text-xs text-muted-foreground">
                No weapons found
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};
