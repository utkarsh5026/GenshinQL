import { fetchCharacterAttackAnimations } from "@/services/dataService";
import {
  AttackAnimation,
  CharacterDetailed,
  AttackTalentType,
  Talent,
} from "@/types";
import React, { useEffect, useState } from "react";
import CharacterAttackAnimationGrid from "./CharacterAttackAnimationGrid";

interface CharacterAttackAnimationsProps {
  character: CharacterDetailed;
}

/**
 * CharacterAttackAnimations component fetches and displays the attack animations
 * for a given character. It utilizes the CharacterAttackAnimationGrid component
 * to render the animations for each type of attack talent.
 *
 * @param {CharacterAttackAnimationsProps} props - The properties for the component.
 * @param {CharacterDetailed} props.character - The detailed information of the character.
 *
 * @returns {JSX.Element} A component that displays the character's attack animations.
 */
const CharacterAttackAnimations: React.FC<CharacterAttackAnimationsProps> = ({
  character,
}) => {
  const [attackAnimations, setAttackAnimations] = useState<AttackAnimation | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAnimations = async () => {
      setLoading(true);
      const data = await fetchCharacterAttackAnimations(character.name);
      setAttackAnimations(data);
      setLoading(false);
    };
    loadAnimations();
  }, [character.name]);

  const talentMap: Record<AttackTalentType, Talent | undefined> = {
    "Normal Attack": character.talents.find(
      (talent) => talent.talentType === "Normal Attack"
    ),
    "Elemental Skill": character.talents.find(
      (talent) => talent.talentType === "Elemental Skill"
    ),
    "Elemental Burst": character.talents.find(
      (talent) => talent.talentType === "Elemental Burst"
    ),
  };

  if (loading) return <div>Loading...</div>;
  if (!attackAnimations) return <div>No data</div>;

  return (
    <div className="flex flex-col gap-4">
      <CharacterAttackAnimationGrid
        talent={talentMap["Normal Attack"]}
        animations={attackAnimations.normalAttack}
      />
      <CharacterAttackAnimationGrid
        talent={talentMap["Elemental Skill"]}
        animations={attackAnimations.elementalSkill}
      />
      <CharacterAttackAnimationGrid
        talent={talentMap["Elemental Burst"]}
        animations={attackAnimations.elementalBurst}
      />
    </div>
  );
};

export default CharacterAttackAnimations;
