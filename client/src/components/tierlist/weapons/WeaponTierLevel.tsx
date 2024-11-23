import React from "react";
import TierLevel from "../base/TierLevel";
import type { Weapon } from "@/graphql/types";
import WeaponAvatar from "@/components/weapons/WeaponAvatar";

interface WeaponTierLevelProps {
  initialName: string;
  isValidName: (name: string) => boolean;
  onNameChange: (name: string) => void;
  weapons: Weapon[];
}

const WeaponTierLevel: React.FC<WeaponTierLevelProps> = ({
  initialName,
  isValidName,
  onNameChange,
  weapons,
}) => {
  return (
    <TierLevel
      name={initialName}
      isValidName={isValidName}
      onNameChange={onNameChange}
    >
      {weapons.map((weapon) => (
        <WeaponAvatar key={weapon.name} weapon={weapon} />
      ))}
    </TierLevel>
  );
};

export default WeaponTierLevel;
