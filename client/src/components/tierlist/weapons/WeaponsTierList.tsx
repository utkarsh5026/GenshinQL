import React from "react";
import DraggableArea from "../base/DroppableArea";
import { useWeapons } from "@/redux/hook/weapons";

const WeaponsTierList: React.FC = () => {
  const { weapons, weaponMap } = useWeapons();
  return (
    <DraggableArea id="weapons" className="flex flex-wrap gap-4">
      {weapons.map((weapon) => (
        <DraggableWeapon key={weapon.name} weapon={weapon} />
      ))}
    </DraggableArea>
  );
};

export default WeaponsTierList;
