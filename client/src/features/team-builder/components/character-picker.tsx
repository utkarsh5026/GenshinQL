import { Search, X } from 'lucide-react';
import React, { useMemo, useState } from 'react';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ElementBadge } from '@/components/ui/genshin-game-icons';
import { ELEMENTS } from '@/constants';
import { CharacterAvatar } from '@/features/characters';
import { useCharacters } from '@/features/characters/stores';
import { cn } from '@/lib/utils';
import { useElements } from '@/stores';
import type { Character } from '@/types';

interface CharacterPickerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedCharacters: (Character | null)[];
  onSelect: (character: Character) => void;
}

const ELEMENT_FILTERS = ['All', ...ELEMENTS] as const;

export const CharacterPickerDialog: React.FC<CharacterPickerDialogProps> = ({
  open,
  onOpenChange,
  selectedCharacters,
  onSelect,
}) => {
  const [search, setSearch] = useState('');
  const [elementFilter, setElementFilter] = useState<string>('All');
  const characters = useCharacters();
  const elements = useElements();

  const elementUrlMap = useMemo(() => {
    const map: Record<string, string> = {};
    elements.forEach((el) => {
      map[el.name.toLowerCase()] = el.url;
    });
    return map;
  }, [elements]);

  const selectedNames = new Set(
    selectedCharacters.filter(Boolean).map((c) => c!.name)
  );

  const filtered = useMemo(() => {
    return characters.filter((c) => {
      const matchSearch = c.name
        .toLowerCase()
        .includes(search.toLowerCase().trim());
      const matchElement =
        elementFilter === 'All' ||
        c.element.toLowerCase() === elementFilter.toLowerCase();
      return matchSearch && matchElement;
    });
  }, [characters, search, elementFilter]);

  const handleSelect = (c: Character) => {
    onSelect(c);
    onOpenChange(false);
    setSearch('');
    setElementFilter('All');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="px-5 pt-5 pb-0">
          <DialogTitle className="text-lg font-bold">
            Select Character
          </DialogTitle>
        </DialogHeader>

        {/* Search */}
        <div className="relative px-5 pt-3">
          <Search className="absolute left-8 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            className="w-full bg-accent/40 border border-border/50 rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary/50 placeholder:text-muted-foreground/60"
            placeholder="Search characters..."
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

        {/* Element filter */}
        <div className="flex gap-1.5 px-5 py-2 overflow-x-auto scrollbar-hide mb-4">
          {ELEMENT_FILTERS.map((el) => {
            if (el === 'All') {
              return (
                <button
                  key={el}
                  onClick={() => setElementFilter(el)}
                  className={cn(
                    'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap bg-muted/60 border border-border/40 text-muted-foreground transition-all duration-200 ring-1',
                    elementFilter === 'All'
                      ? 'ring-primary/30'
                      : 'ring-transparent opacity-50 hover:opacity-80'
                  )}
                >
                  All
                </button>
              );
            }
            const url = elementUrlMap[el.toLowerCase()];
            if (!url) return null;
            const isActive = elementFilter === el;
            return (
              <button
                key={el}
                onClick={() => setElementFilter(el)}
                className={cn(
                  'rounded-full transition-all duration-200 ring-1',
                  isActive
                    ? 'ring-primary/30'
                    : 'ring-transparent opacity-50 hover:opacity-80'
                )}
              >
                <ElementBadge name={el} url={url} size="sm" />
              </button>
            );
          })}
        </div>

        {/* Character grid */}
        <div className="flex-1 overflow-y-auto px-5 pb-5">
          <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-2">
            {filtered.map((c) => {
              const isSelected = selectedNames.has(c.name);
              return (
                <div key={c.name} className="relative">
                  <CharacterAvatar
                    characterName={c.name}
                    size="lg"
                    showElement
                    showRarity
                    onClick={isSelected ? () => {} : () => handleSelect(c)}
                    className={
                      isSelected ? 'opacity-40 cursor-not-allowed' : undefined
                    }
                  />
                  {isSelected && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <span className="text-[9px] font-bold text-white/80 bg-black/50 px-1 rounded">
                        In Team
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          {filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <span className="text-sm">No characters found</span>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
