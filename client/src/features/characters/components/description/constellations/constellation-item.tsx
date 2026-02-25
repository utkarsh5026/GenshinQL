import React from 'react';

import {
  getConstellationStyles,
  getElementClasses,
} from '@/features/characters/utils';

import type { Constellation } from '../../../types';
import { AbilityCard } from './ability-card';

interface ConstellationItemProps {
  constellation: Constellation;
  elementClasses: ReturnType<typeof getElementClasses>;
  characterName: string;
}

export const ConstellationItem: React.FC<ConstellationItemProps> = ({
  constellation,
  elementClasses,
  characterName,
}) => {
  const styles = getConstellationStyles(constellation.level);

  const badge = (
    <span
      className={`shrink-0 flex items-center justify-center w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-linear-to-br ${elementClasses.levelGradient} text-white text-[10px] sm:text-xs font-bold`}
    >
      {constellation.level}
    </span>
  );

  return (
    <AbilityCard
      iconUrl={constellation.iconUrl}
      iconAlt={constellation.name}
      iconOverlay={
        styles.isTalentUpgrade ? (
          <div className="flex items-center justify-center w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-success-600 text-white text-[8px] sm:text-[9px] font-bold">
            +3
          </div>
        ) : undefined
      }
      badge={badge}
      name={constellation.name}
      headerExtra={
        styles.isTalentUpgrade ? (
          <span
            className={`text-[10px] sm:text-xs font-medium ${elementClasses.accent}`}
          >
            • Talent Lv. +3
          </span>
        ) : undefined
      }
      description={constellation.description}
      characterName={characterName}
      className={`${elementClasses.border} ${elementClasses.hoverBorder}`}
    />
  );
};
