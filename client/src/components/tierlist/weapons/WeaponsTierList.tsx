import React, { useState } from "react";
import DraggableArea from "../base/DroppableArea";
import { useWeaponsStore } from "@/stores";
import WeaponAvatar from "@/components/weapons/WeaponAvatar";
import { DndContext } from "@dnd-kit/core";
import WeaponTierLevel from "./WeaponTierLevel";
import type { Weapon } from "@/types";
const tierLevels = ["S", "A", "B", "C", "D"];

const WeaponsTierList: React.FC = () => {
  const [tierListMap, setTierListMap] = useState<Record<string, Weapon[]>>({
    S: [],
    A: [],
    B: [],
    C: [],
    D: [],
  });
  const { weapons, weaponMap } = useWeaponsStore();

  console.log(weapons);
  return (
    <DndContext>
      {tierLevels.map((level) => (
        <WeaponTierLevel
          key={level}
          initialName={level}
          weapons={tierListMap[level]}
        />
      ))}
      <DraggableArea id="weapons" className="flex flex-wrap gap-4 border-2">
        {weapons.map((weapon) => (
          <WeaponAvatar key={weapon.name} weapon={weapon} />
        ))}
      </DraggableArea>
    </DndContext>
  );
};

export default WeaponsTierList;
