import React from 'react';

import type { TalentBook } from '@/features/calendar';
import type { WeaponSummary } from '@/features/weapons';
import type { Day, ImageUrl } from '@/types';

import TalentBooksShowCase from './talent-books';
import WeaponMaterialsDisplay from './weapon-materials-display';

export type WeaponMaterialGroup = {
  dayOne: string;
  dayTwo: string;
  materialImages: ImageUrl[];
  weapons: WeaponSummary[];
};

export type DailyRoutine = {
  day: Day;
  talentMaterials: TalentBook | null;
  weaponMaterials: WeaponMaterialGroup[];
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
      {weaponMaterials.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">
            Weapon Materials
          </h4>
          <WeaponMaterialsDisplay materialGroups={weaponMaterials} />
        </div>
      )}
    </div>
  );
};

export default MaterialsCell;
