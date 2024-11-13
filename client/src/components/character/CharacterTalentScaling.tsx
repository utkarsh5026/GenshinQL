import React, { useMemo, useState } from "react";
import type { Talent } from "@/graphql/types";
import {
  Table,
  TableCell,
  TableHead,
  TableRow,
} from "@/components/ui/table.tsx";
import { Slider } from "@/components/ui/slider.tsx";

interface CharacterTalentScalingProps {
  talent: Talent;
}

function findSliderMaxCount(talent: Talent): number {
  let max = 0;
  talent.scaling.forEach((s) => {
    if (s.value.length > max) {
      max = s.value.length;
    }
  });
  return max;
}

const CharacterTalentScaling: React.FC<CharacterTalentScalingProps> = ({
  talent,
}) => {
  const maxCount = useMemo(() => findSliderMaxCount(talent), [talent]);
  const [level, setCurrentLevel] = useState<number>(1);

  const handleChange = (value: number[]) => {
    const newNum = value[0];
    if (newNum >= 1 && newNum <= maxCount) setCurrentLevel(value[0]);
    console.log(value);
  };
  return (
    <div>
      <Table>
        {talent.scaling.map((s) => {
          return (
            <TableRow className="text-xs">
              <TableHead className="font-thin">{s.key}</TableHead>
              <TableCell className="font-medium">
                {s.value[Math.min(level - 1, s.value.length - 1)]}
              </TableCell>
            </TableRow>
          );
        })}
      </Table>
      <div className="w-full max-w-md mx-auto p-4">
        <Slider
          step={1}
          max={maxCount}
          min={1}
          onValueChange={handleChange}
          value={[level]}
          className="transition-all duration-300 ease-in-out"
        />
        <div className="mt-2 text-center">
          <span className="text-lg font-semibold">
            Level: {level} / {maxCount}
          </span>
        </div>
      </div>
    </div>
  );
};

export default CharacterTalentScaling;
