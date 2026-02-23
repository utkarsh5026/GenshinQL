import React from 'react';

import { SubstatIcon } from '@/features/weapons/utils';
import type { SubstatType } from '@/features/weapons/utils/substat-utils';

import { getCompactSubstatLabel } from '../../utils/filter-utils';
import { FilterButton } from './filter-button';

interface SubstatFilterProps {
  selectedSubstats: string[];
  availableSubstats: string[];
  onToggleSubstat: (substat: string) => void;
}

/**
 * Substat filter component
 * Displays substats with icons and abbreviated labels (EM, ER, etc.)
 * Mobile-responsive with icon + compact text
 */
export const SubstatFilter: React.FC<SubstatFilterProps> = ({
  selectedSubstats,
  availableSubstats,
  onToggleSubstat,
}) => {
  if (availableSubstats.length === 0) {
    return null;
  }

  return (
    <div className="flex items-center gap-1.5">
      {availableSubstats.map((substat) => {
        const isSelected = selectedSubstats.includes(substat);
        const compactLabel = getCompactSubstatLabel(substat);

        return (
          <FilterButton
            key={substat}
            isSelected={isSelected}
            onClick={() => onToggleSubstat(substat)}
            ariaLabel={`Filter by ${substat}`}
          >
            <SubstatIcon
              type={substat as SubstatType}
              size={14}
              className="opacity-80"
            />
            <span>{compactLabel}</span>
          </FilterButton>
        );
      })}
    </div>
  );
};
