import React from 'react';

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { CachedImage } from '@/features/cache';
import type { TalentBook } from '@/features/calendar';
import { WeaponMaterial } from '@/features/weapons';
import type { Day } from '@/types';

import TalentBooksShowCase from './talent-books';

export type DailyRoutine = {
  day: Day;
  talentMaterials: TalentBook | null;
  weaponMaterials: WeaponMaterial[];
  hasFarming: boolean;
};

interface MaterialsCellProps {
  routine: DailyRoutine;
}

/**
 * Displays talent and weapon materials for a specific day.
 * Shows both sections when materials overlap on the same day.
 */
const MaterialsCell: React.FC<MaterialsCellProps> = ({ routine }) => {
  const { talentMaterials, weaponMaterials } = routine;

  const uniqueWeaponMaterials = weaponMaterials.reduce((acc, material) => {
    if (!acc.find((m) => m.day === material.day)) {
      acc.push(material);
    }
    return acc;
  }, [] as WeaponMaterial[]);

  return (
    <div className="flex flex-col gap-4">
      {/* Talent Materials Section */}
      {talentMaterials && (
        <div>
          <h4 className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">
            Talent Books
          </h4>
          <TalentBooksShowCase talentBooks={[talentMaterials]} />
        </div>
      )}

      {/* Weapon Materials Section */}
      {uniqueWeaponMaterials.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">
            Weapon Materials
          </h4>
          <div className="flex flex-wrap gap-2">
            {uniqueWeaponMaterials.map((material) => (
              <div key={material.day} className="flex gap-1">
                {material.materialImages.map((img) => (
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
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MaterialsCell;
