import React from 'react';

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { CachedImage } from '@/features/cache';
import WeaponAvatar from '@/features/weapons/components/shared/card/weapon-avatar';

import type { WeaponMaterialGroup } from './materials-cell';

interface WeaponMaterialsDisplayProps {
  materialGroups: WeaponMaterialGroup[];
}

/**
 * Displays weapon materials grouped with the weapons that need them
 * Follows the TalentBooksWithCharacters layout pattern:
 * - Materials on the left
 * - Vertical divider (desktop only)
 * - Weapon avatars on the right
 */
const WeaponMaterialsDisplay: React.FC<WeaponMaterialsDisplayProps> = ({
  materialGroups,
}) => {
  return (
    <div className="flex flex-col gap-3">
      {materialGroups.map((group, index) => (
        <div
          key={`${group.dayOne}-${group.dayTwo}-${index}`}
          className="flex flex-col md:flex-row md:items-start gap-3 md:gap-4"
        >
          {/* Material Images Section */}
          <div className="flex flex-col gap-1.5">
            <div className="md:hidden text-[10px] uppercase tracking-wider text-muted-foreground">
              Materials
            </div>
            <div className="flex flex-wrap gap-2">
              {group.materialImages.map((img) => (
                <TooltipProvider key={img.url}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div>
                        <CachedImage
                          src={img.url}
                          alt={img.caption}
                          className="w-10 h-10 rounded border border-border hover:border-starlight-500/50 transition-colors"
                        />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{img.caption}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ))}
            </div>
          </div>

          {/* Divider (desktop only) */}
          {group.weapons.length > 0 && (
            <div className="hidden md:block w-px bg-border self-stretch" />
          )}

          {/* Weapons Section */}
          {group.weapons.length > 0 && (
            <div className="flex-1">
              <div className="md:hidden text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5">
                Weapons
              </div>
              <div className="flex flex-wrap gap-1.5">
                {group.weapons.map((weapon) => (
                  <WeaponAvatar key={weapon.name} weapon={weapon} />
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default WeaponMaterialsDisplay;
