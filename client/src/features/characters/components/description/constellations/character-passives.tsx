import React, { useMemo } from 'react';

import { Talent } from '@/features/characters/types';
import { getPassiveStyles, sortPassives } from '@/features/characters/utils';

import { AbilityCard } from './ability-card';

interface CharacterPassivesProps {
  passives: Talent[];
  characterName: string;
}

export const CharacterPassives: React.FC<CharacterPassivesProps> = ({
  passives,
  characterName,
}) => {
  const sorted = useMemo(() => [...passives].sort(sortPassives), [passives]);

  return (
    <div className="flex flex-col gap-3 sm:gap-4">
      {sorted.map((passive) => {
        const { borderClass, tagClass } = getPassiveStyles(passive.talentType);

        const badge = (
          <span
            className={`inline-block px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium border ${tagClass}`}
          >
            {passive.talentType}
          </span>
        );

        return (
          <AbilityCard
            key={passive.talentName}
            iconUrl={passive.talentIcon}
            iconAlt={passive.talentName}
            badge={badge}
            name={passive.talentName}
            description={passive.description}
            characterName={characterName}
            className={borderClass}
          />
        );
      })}
    </div>
  );
};
