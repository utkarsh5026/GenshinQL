import { X } from 'lucide-react';
import React, { useMemo, useState } from 'react';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { RarityStars } from '@/components/ui/genshin-game-icons';
import { CachedImage } from '@/features/cache';
import type { WeaponSummary } from '@/features/weapons';
import { useWeaponTypes } from '@/stores/usePrimitivesStore';

interface WeaponPickerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  weaponTypeFilter?: string; // character's weapon type
  currentWeapon: WeaponSummary | null;
  onSelect: (weapon: WeaponSummary) => void;
  weapons: WeaponSummary[];
}

const RARITY_COLORS: Record<number, string> = {
  5: 'bg-amber-500/10',
  4: 'bg-violet-500/10',
  3: 'bg-blue-500/10',
  2: 'bg-green-500/10',
  1: 'bg-gray-400/10',
};

export const WeaponPickerDialog: React.FC<WeaponPickerDialogProps> = ({
  open,
  onOpenChange,
  weaponTypeFilter,
  currentWeapon,
  onSelect,
  weapons,
}) => {
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

  const [search, setSearch] = useState('');
  const [rarityFilter, setRarityFilter] = useState<number | 'All'>('All');

  const filtered = useMemo(() => {
    return weapons.filter((w) => {
      const matchType = !weaponTypeFilter || w.weaponType === weaponTypeFilter;
      const matchSearch = w.name
        .toLowerCase()
        .includes(search.toLowerCase().trim());
      const matchRarity = rarityFilter === 'All' || w.rarity === rarityFilter;
      return matchType && matchSearch && matchRarity;
    });
  }, [weapons, search, weaponTypeFilter, rarityFilter]);

  const handleSelect = (w: WeaponSummary) => {
    onSelect(w);
    onOpenChange(false);
    setSearch('');
    setRarityFilter('All');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl max-h-[80vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="px-5 pt-5 pb-0">
          <DialogTitle className="text-lg font-bold flex items-center gap-2">
            {weaponTypeIcon && (
              <CachedImage
                src={weaponTypeIcon}
                alt={weaponTypeFilter}
                className="w-6 h-6 object-contain"
                showSkeleton={false}
              />
            )}
            Select Weapon
            {weaponTypeFilter && (
              <span className="text-sm font-normal text-muted-foreground capitalize">
                ({weaponTypeFilter})
              </span>
            )}
          </DialogTitle>
        </DialogHeader>

        {/* Search */}
        <div className="relative px-5 pt-3">
          <input
            className="w-full bg-accent/40 border border-border/50 rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary/50 placeholder:text-muted-foreground/60"
            placeholder="Search weapons..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            autoFocus
          />
          {search && (
            <button
              className="absolute right-8 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              onClick={() => setSearch('')}
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Rarity filter */}
        <div className="flex gap-1.5 px-5 py-2">
          {(['All', 5, 4, 3] as const).map((r) => (
            <button
              key={r}
              onClick={() => setRarityFilter(r)}
              className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 border ${
                rarityFilter === r
                  ? r === 'All'
                    ? 'border-primary/60 bg-primary/20 text-primary'
                    : `${RARITY_COLORS[r]} text-foreground`
                  : 'border-border/40 bg-accent/30 text-muted-foreground hover:text-foreground'
              }`}
            >
              {r === 'All' ? 'All' : <RarityStars rarity={r} size="xs" />}
            </button>
          ))}
        </div>

        {/* Weapon list */}
        <div className="flex-1 overflow-y-auto px-5 pb-5 space-y-1.5">
          {filtered.map((w) => {
            const isSelected = currentWeapon?.name === w.name;
            return (
              <button
                key={w.name}
                onClick={() => handleSelect(w)}
                className={`
                  w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border text-left
                  transition-all duration-200 hover:scale-[1.01]
                  ${
                    isSelected
                      ? `${RARITY_COLORS[w.rarity] ?? ''} border-none`
                      : 'border-border/30 bg-accent/20 hover:border-border/60 hover:bg-accent/40'
                  }
                `}
              >
                <div
                  className={`w-10 h-10 rounded-lg overflow-hidden shrink-0 border-none ${RARITY_COLORS[w.rarity] ?? ''}`}
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
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold truncate">{w.name}</p>
                    <RarityStars rarity={w.rarity} size="xs" />
                  </div>
                  <p className="text-xs text-muted-foreground truncate">
                    {w.subStat} · {Math.round(w.attack)} ATK
                  </p>
                </div>
                {isSelected && (
                  <span className="text-xs font-bold text-primary shrink-0">
                    ✓
                  </span>
                )}
              </button>
            );
          })}
          {filtered.length === 0 && (
            <div className="py-10 text-center text-sm text-muted-foreground">
              No weapons found
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
