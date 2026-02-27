import * as PopoverPrimitive from '@radix-ui/react-popover';
import { X } from 'lucide-react';
import React, { useMemo, useState } from 'react';

import { RarityStars } from '@/components/ui/genshin-game-icons';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { CachedImage } from '@/features/cache';
import type { WeaponSummary } from '@/features/weapons';
import { cn } from '@/lib/utils';
import { useWeaponTypes } from '@/stores/usePrimitivesStore';

import { SlotPopover } from './slot-popover';

const RARITY_COLORS: Record<number, string> = {
  5: 'bg-amber-500/10',
  4: 'bg-violet-500/10',
  3: 'bg-blue-500/10',
  2: 'bg-green-500/10',
  1: 'bg-gray-400/10',
};

/** Class names for a quick-select option button based on active state. */
const optionButtonClass = (isActive: boolean) =>
  cn(
    'w-7 py-1 text-xs rounded-md font-semibold transition-all',
    isActive
      ? 'bg-primary text-primary-foreground'
      : 'bg-surface-300 hover:bg-midnight-700 text-muted-foreground'
  );

/** ── WeaponSelector ──────────────────────────────────────────────────────────
 *  Inline weapon display row with a contextual popover picker and a
 *  refinement sub-popover. Owns all transient UI state (open, search, filter).
 */
export interface WeaponSelectorProps {
  weapon: WeaponSummary | null;
  /** Character's weapon type used to pre-filter the picker list. */
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

  const handleOpenChange = (o: boolean) => {
    setOpen(o);
    if (!o) {
      setSearch('');
      setRarityFilter('All');
    }
  };

  const handleSelect = (w: WeaponSummary) => {
    onSetWeapon(w);
    setOpen(false);
    setSearch('');
    setRarityFilter('All');
  };

  return (
    <div className="rounded-lg bg-midnight-800/80 hover:bg-surface-300/70 border border-midnight-700/50 hover:border-midnight-600/80 transition-all min-w-0">
      <Popover open={open} onOpenChange={handleOpenChange}>
        {weapon ? (
          <div className="flex items-center gap-2 px-2 py-1.5 min-w-0">
            <PopoverTrigger asChild>
              <button className="flex items-center gap-2 flex-1 min-w-0 text-left">
                <img
                  src={weapon.iconUrl}
                  alt={weapon.name}
                  className="w-7 h-7 object-contain shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate leading-tight">
                    {weapon.name}
                  </p>
                  <p className="text-[10px] text-muted-foreground truncate leading-tight">
                    {Math.round(weapon.attack)} ATK
                    {weapon.subStat && weapon.subStat !== 'None'
                      ? ` · ${weapon.subStat}`
                      : ''}
                  </p>
                </div>
              </button>
            </PopoverTrigger>
            <SlotPopover
              label={`R${weaponRefinement}`}
              title="Refinement"
              side="top"
              contentClassName="w-auto"
              triggerClassName="shrink-0"
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
          className="w-80 p-0 flex flex-col overflow-hidden max-h-105"
          onOpenAutoFocus={(e) => {
            e.preventDefault();
            const input = (e.currentTarget as HTMLElement).querySelector(
              'input'
            );
            input?.focus();
          }}
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
          <div className="relative px-3 pt-2.5 pb-1.5">
            <input
              className="w-full bg-accent/40 border border-border/50 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary/50 placeholder:text-muted-foreground/60 pr-7"
              placeholder="Search weapons..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button
                className="absolute right-5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                onClick={() => setSearch('')}
              >
                <X className="w-3 h-3" />
              </button>
            )}
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
                      : `${RARITY_COLORS[r]} text-foreground border-border/40`
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
                      ? `${RARITY_COLORS[w.rarity] ?? ''} border-primary/30`
                      : 'border-border/30 bg-accent/20 hover:border-border/60 hover:bg-accent/40'
                  )}
                >
                  <div
                    className={cn(
                      'w-8 h-8 rounded-md overflow-hidden shrink-0',
                      RARITY_COLORS[w.rarity] ?? ''
                    )}
                  >
                    <CachedImage
                      src={w.iconUrl}
                      alt={w.name}
                      className="w-full h-full object-cover"
                      lazy
                      skeletonShape="rounded"
                      skeletonSize="sm"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="text-xs font-semibold truncate">{w.name}</p>
                      <RarityStars rarity={w.rarity} size="xs" />
                    </div>
                    <p className="text-[10px] text-muted-foreground truncate">
                      {w.subStat} · {Math.round(w.attack)} ATK
                    </p>
                  </div>
                  {isSelected && (
                    <span className="text-[10px] font-bold text-primary shrink-0">
                      ✓
                    </span>
                  )}
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
