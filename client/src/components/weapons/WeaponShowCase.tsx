import React, { useMemo } from "react";
import { Weapon } from "@/types";
import WeaponAvatar from "./WeaponAvatar";

interface WeaponShowCaseProps {
  weapons: Weapon[];
}

const WeaponShowCase: React.FC<WeaponShowCaseProps> = ({ weapons }) => {
  const weaponMap = useMemo(() => {
    const wepTypeMap: Record<string, Weapon[]> = {};

    for (const weapon of weapons) {
      if (!wepTypeMap[weapon.type]) {
        wepTypeMap[weapon.type] = [];
      }
      wepTypeMap[weapon.type].push(weapon);
    }

    // Sort weapons by rarity for each weapon type
    for (const weaponType in wepTypeMap) {
      wepTypeMap[weaponType].sort((a, b) => a.rarity - b.rarity);
    }

    return wepTypeMap;
  }, [weapons]);

  return (
    <div>
      {Object.entries(weaponMap).map(([type, weapons], index, array) => (
        <div key={type} className="mb-4 ">
          <div className="grid grid-cols-0 gap-2 sm:grid-cols-3">
            {weapons.map((weapon) => (
              <WeaponAvatar key={weapon.name} weapon={weapon} />
            ))}
          </div>
          {index !== array.length - 1 && (
            <hr className="my-4 border-gray-200" />
          )}
        </div>
      ))}
    </div>
  );
};

export default WeaponShowCase;
