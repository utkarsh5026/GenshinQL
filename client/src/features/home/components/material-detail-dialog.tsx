import React, { useMemo } from 'react';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import CharacterAvatar from '@/features/characters/components/utils/character-avatar';
import WeaponAvatar from '@/features/weapons/components/shared/card/weapon-avatar';

import type { MaterialItem } from '../types';

interface MaterialDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string; // "Talent Materials" or "Weapon Materials"
  regionName: string; // e.g., "Mondstadt"
  items: MaterialItem[];
  type: 'character' | 'weapon';
}

export const MaterialDetailDialog: React.FC<MaterialDetailDialogProps> = ({
  open,
  onOpenChange,
  title,
  regionName,
  items,
  type,
}) => {
  // Sort items: tracked first, then others
  const sortedItems = useMemo(() => {
    const tracked = items.filter((item) => item.isTracked);
    const others = items.filter((item) => !item.isTracked);
    return [...tracked, ...others];
  }, [items]);

  const itemLabel = type === 'character' ? 'character' : 'weapon';
  const itemLabelPlural = type === 'character' ? 'characters' : 'weapons';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-[95vw] sm:w-full sm:max-w-2xl max-h-[85vh] overflow-hidden flex flex-col p-4 sm:p-6 gap-3">
        <DialogHeader className="space-y-1.5">
          <DialogTitle className="text-base sm:text-lg">
            {title} - {regionName}
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm">
            All {itemLabelPlural} available for farming in {regionName}
          </DialogDescription>
        </DialogHeader>

        {/* Scrollable content area */}
        <div className="flex-1 overflow-y-auto -mx-4 sm:mx-0 px-4 sm:px-0">
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 sm:gap-3">
            {sortedItems.map((item) =>
              type === 'character' ? (
                <div
                  key={item.name}
                  className="flex flex-col items-center gap-0.5 sm:gap-1"
                >
                  <CharacterAvatar
                    characterName={item.name}
                    size="sm"
                    showName={true}
                    namePosition="bottom"
                    interactive={true}
                    showElement
                    showRarity
                    renderBadge={
                      item.isTracked
                        ? () => (
                            <div className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-green-500 rounded-full border-2 border-background" />
                          )
                        : undefined
                    }
                  />
                </div>
              ) : (
                <div
                  key={item.name}
                  className="flex flex-col items-center gap-0.5 sm:gap-1"
                >
                  <WeaponAvatar
                    weaponName={item.name}
                    size="sm"
                    showName={true}
                    namePosition="bottom"
                    interactive={true}
                    renderBadge={
                      item.isTracked
                        ? () => (
                            <div className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-green-500 rounded-full border-2 border-background" />
                          )
                        : undefined
                    }
                  />
                </div>
              )
            )}
          </div>

          {sortedItems.length === 0 && (
            <div className="text-center text-muted-foreground py-8">
              No {itemLabelPlural} found for this region
            </div>
          )}
        </div>

        {/* Footer with count */}
        {sortedItems.length > 0 && (
          <div className="text-xs sm:text-sm text-muted-foreground pt-3 sm:pt-4 border-t">
            Showing {sortedItems.length}{' '}
            {sortedItems.length === 1 ? itemLabel : itemLabelPlural}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default MaterialDetailDialog;
