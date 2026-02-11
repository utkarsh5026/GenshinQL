import { useCallback, useMemo } from 'react';

import type { AnimationMedia } from '@/types';

import type { AttackTalentType, CharacterDetailed, Talent } from '../types';

interface TalentWithAnimation {
  talent: Talent;
  animations: AnimationMedia[];
  energyCost?: string;
  cooldown?: string;
}

/**
 * Hook to get character talents with attack animations and metadata
 */
export const useCharacterTalents = (character: CharacterDetailed) => {
  const attackAnimations = useMemo(() => {
    if (!character?.attackAnimations) return null;
    return character.attackAnimations;
  }, [character?.attackAnimations]);

  const extractMetadata = (talent: Talent) => {
    const energyCost = talent.scaling?.find((s) => s.key === 'Energy Cost')
      ?.value?.[0];
    const cooldown = talent.scaling?.find((s) => s.key === 'CD')?.value?.[0];
    return { energyCost, cooldown };
  };

  const getAnimationsForTalent = useCallback(
    (talentType: AttackTalentType): AnimationMedia[] => {
      if (!attackAnimations) return [];

      switch (talentType) {
        case 'Normal Attack':
          return attackAnimations.normalAttack || [];
        case 'Elemental Skill':
          return attackAnimations.elementalSkill || [];
        case 'Elemental Burst':
          return attackAnimations.elementalBurst || [];
        default:
          return [];
      }
    },
    [attackAnimations]
  );

  const mainTalents = useMemo<TalentWithAnimation[]>(() => {
    if (!character?.talents) return [];

    return character.talents
      .filter(
        (t) =>
          t.talentType === 'Normal Attack' ||
          t.talentType === 'Elemental Skill' ||
          t.talentType === 'Elemental Burst'
      )
      .map((talent) => ({
        talent,
        animations: getAnimationsForTalent(
          talent.talentType as AttackTalentType
        ),
        ...extractMetadata(talent),
      }));
  }, [character, getAnimationsForTalent]);

  const elementalBurst = useMemo<TalentWithAnimation | undefined>(() => {
    return mainTalents.find((t) => t.talent.talentType === 'Elemental Burst');
  }, [mainTalents]);

  return {
    mainTalents,
    elementalBurst,
  };
};
