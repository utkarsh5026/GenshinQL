import React, { useMemo } from "react";
import { Weapon } from "@/graphql/types";
import AvatarWithSkeleton from "../utils/AvatarWithSkeleton";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "../ui/hover-card";
import WeaponCard from "./WeaponCard";

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

  const bgColorMap = {
    1: "border-gray-100",
    2: "border-red-100",
    3: "border-amber-100",
    4: "border-purple-950/40",
    5: "border-orange-100",
  };

  return (
    <div>
      {Object.entries(weaponMap).map(([type, weapons], index, array) => (
        <div key={type} className="mb-4 ">
          <div className="grid grid-cols-0 gap-2 sm:grid-cols-3">
            {weapons.map((weapon) => (
              <HoverCard key={weapon.name}>
                <HoverCardTrigger>
                  <div
                    key={weapon.name}
                    className="flex cursor-pointer flex-col items-center"
                  >
                    <AvatarWithSkeleton
                      key={weapon.name}
                      name={weapon.name}
                      avatarClassName={`w-10 h-10 border-2 ${bgColorMap[weapon.rarity as keyof typeof bgColorMap]}`}
                      url={weapon.iconUrl}
                    />
                    <p className="text-xs font-thin">{weapon.name}</p>
                  </div>
                </HoverCardTrigger>
                <HoverCardContent
                  align="center"
                  side="right"
                  className="w-96 bg-gray-100"
                >
                  <WeaponCard weapon={weapon} />
                </HoverCardContent>
              </HoverCard>
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
