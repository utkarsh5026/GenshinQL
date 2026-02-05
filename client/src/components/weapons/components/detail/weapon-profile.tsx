import React, { useMemo, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import TextProcessor from '@/components/utils/text-processor';
import { WeaponDetailedType } from '@/types';

interface WeaponProfileProps {
  weapon: WeaponDetailedType;
}

const WeaponProfile: React.FC<WeaponProfileProps> = ({ weapon }) => {
  // State for refinement level
  const [refinementLevel, setRefinementLevel] = useState<number>(1);

  // Get nation and weekday from weapon data
  const nations = [
    'N/A',
    'Mondstadt',
    'Liyue',
    'Inazuma',
    'Sumeru',
    'Fontaine',
    'Natlan',
    'NodKrai',
  ];
  const days = ['Monday/Thursday', 'Tuesday/Friday', 'Wednesday/Saturday'];

  const nation =
    weapon.nation >= 0 && weapon.nation < nations.length
      ? nations[weapon.nation]
      : 'N/A';
  const weekday =
    weapon.weekdays >= 0 && weapon.weekdays < days.length
      ? days[weapon.weekdays]
      : 'N/A';

  // Extract effect name from weapon effect
  const effectName = useMemo(() => {
    const firstLine = weapon.effect.split('\n')[0];
    return firstLine || 'Passive Effect';
  }, [weapon.effect]);

  return (
    <div className="space-y-4">
      {/* Basic stats grid */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <h3 className="text-sm font-semibold text-gray-600">Rarity</h3>
          <p className="text-lg">{weapon.rarity} ★</p>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-gray-600">Base Attack</h3>
          <p className="text-lg">{weapon.attack}</p>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-gray-600">
            Secondary Stat
          </h3>
          <p className="text-lg">{weapon.subStat}</p>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-gray-600">Nation</h3>
          <p className="text-lg">{nation}</p>
        </div>
        <div className="col-span-2">
          <h3 className="text-sm font-semibold text-gray-600">Material Days</h3>
          <p className="text-lg">{weekday}</p>
        </div>
      </div>

      {/* Weapon Passive with Refinement Slider */}
      {weapon.passives && weapon.passives.length > 0 && (
        <div className="pt-4 border-t space-y-3">
          <div>
            <h3 className="text-sm font-semibold text-gray-600">
              Weapon Passive
            </h3>
            <p className="text-base font-medium mt-1">{effectName}</p>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600 min-w-fit">Refinement</span>
            <Slider
              value={[refinementLevel]}
              onValueChange={(values) => setRefinementLevel(values[0])}
              min={1}
              max={5}
              step={1}
              className="flex-1"
            />
            <Badge variant={refinementLevel === 5 ? 'default' : 'outline'}>
              R{refinementLevel}
            </Badge>
            {refinementLevel === 5 && (
              <span className="text-xs text-amber-500">Maximum</span>
            )}
          </div>

          <div className="mt-2">
            <TextProcessor text={weapon.passives[refinementLevel - 1]} />
          </div>
        </div>
      )}
    </div>
  );
};

export default WeaponProfile;
