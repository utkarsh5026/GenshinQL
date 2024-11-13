import React, { useMemo, useState } from "react";
import type { Talent } from "@/graphql/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
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

/**
 * CharacterTalentScaling component displays a slider and a table
 * representing the scaling values of a character's talent.
 *
 * @param {CharacterTalentScalingProps} props - The properties for the component.
 * @param {Talent} props.talent - The talent object containing scaling data.
 * @returns {JSX.Element} The rendered component.
 */
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
      <div className="w-full max-w-md mx-auto p-4">
        <Slider
          step={1}
          max={maxCount}
          min={1}
          onValueChange={handleChange}
          value={[level]}
          className="transition-all duration-300 ease-in-out"
        />
      </div>
      <Table className="rounded-lg border-1 w-full table-fixed">
        <TableHeader>
          <TableRow>
            <TableHead
              colSpan={2}
              className="text-center font-semibold text-pretty text-yellow-500"
            >
              {`Talent Level: ${level}`}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {talent.scaling.map((s) => {
            return (
              <TableRow className="text-sm" key={s.key}>
                <TableHead className="font-medium border-r-2 border-gray-500 w-1/2 whitespace-normal break-words p-2">
                  {s.key}
                </TableHead>
                <TableCell className="font-medium w-1/2 whitespace-normal break-words">
                  {s.value[Math.min(level - 1, s.value.length - 1)]}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};

export default CharacterTalentScaling;
