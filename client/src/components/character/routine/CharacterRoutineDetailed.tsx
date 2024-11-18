import type { Character, Weapon } from "@/graphql/types";
import { useWeapons } from "@/redux/hook/weapons";
import React, { useEffect, useMemo, useState } from "react";
import RoutineTable from "./RoutineTable";
import ChipSearchBar from "@/components/utils/ChipSearchBar";

interface CharacterRoutineDetailedProps {
  character: Character;
}

const CharacterRoutineDetailed: React.FC<CharacterRoutineDetailedProps> = ({
  character,
}) => {
  const { fetchWeaponsOfType, weapons, weaponMap } = useWeapons();

  const weaponsOfType = useMemo(() => {
    return weapons.filter((weapon) => weapon.type === character.weaponType);
  }, [weapons, character.weaponType]);

  const [selectedWeapons, setSelectedWeapons] = useState<Weapon[]>([]);

  useEffect(() => {
    fetchWeaponsOfType(character.weaponType);
  }, [character, fetchWeaponsOfType]);

  console.log(weaponsOfType, weapons);

  return (
    <div>
      <ChipSearchBar
        items={weaponsOfType}
        selectedItems={selectedWeapons}
        onItemSelect={(weapon) => {
          setSelectedWeapons([
            ...selectedWeapons,
            weapons[weaponMap[weapon.name]],
          ]);
        }}
        onItemRemove={(weapon) => {
          setSelectedWeapons(
            selectedWeapons.filter((w) => w.name !== weapon.name)
          );
        }}
        placeholder={`Search weapons for ${character.name} 😊`}
      />
      <RoutineTable characters={[character]} weapons={selectedWeapons} />
    </div>
  );
};

export default CharacterRoutineDetailed;
