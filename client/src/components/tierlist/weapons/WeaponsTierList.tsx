import { DndContext } from '@dnd-kit/core';
import React, { useState } from 'react';

import WeaponAvatar from '@/components/weapons/WeaponAvatar';
import { useWeaponsStore } from '@/stores';
import type { Weapon } from '@/types';

import DraggableArea from '../base/DroppableArea';
import WeaponTierLevel from './WeaponTierLevel';
const tierLevels = ['S', 'A', 'B', 'C', 'D'];

const WeaponsTierList: React.FC = () => {
  const [tierListMap] = useState<Record<string, Weapon[]>>({
    S: [],
    A: [],
    B: [],
    C: [],
    D: [],
  });
  const { weapons } = useWeaponsStore();

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
