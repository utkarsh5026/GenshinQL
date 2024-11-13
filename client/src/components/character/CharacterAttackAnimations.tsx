import { GET_CHARACTER_ATTACK_ANIMATIONS } from "@/graphql/queries";
import {
  AttackAnimation,
  CharacterDetailed,
  AttackTalentType,
  Talent,
} from "@/graphql/types";
import React from "react";
import { useQuery } from "@apollo/client";
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
  const { data, loading } = useQuery(GET_CHARACTER_ATTACK_ANIMATIONS, {
    variables: { name: character.name },
  });

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

  const attackAnimations = data?.characterAttackAnimations as AttackAnimation;

  if (loading) return <div>Loading...</div>;
  if (!data) return <div>No data</div>;

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
