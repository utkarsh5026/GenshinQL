import React, { useMemo, useState } from 'react';

import { Slider } from '@/components/ui/slider';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { getScalingComparison } from '@/utils/scalingParser';

import type { Talent } from '../../../types';

interface TalentScalingTableProps {
  talent: Talent;
  elementColor: string;
}

export const TalentScalingTable: React.FC<TalentScalingTableProps> = ({
  talent,
  elementColor,
}) => {
  const maxCount = useMemo(() => {
    let max = 0;
    talent.scaling.forEach((s) => {
      if (s.value.length > max) max = s.value.length;
    });
    return max;
  }, [talent]);

  const [level, setLevel] = useState(1);
  const [prevLevel, setPrevLevel] = useState(1);

  const handleChange = (value: number[]) => {
    const newNum = value[0];
    if (newNum >= 1 && newNum <= maxCount) {
      setPrevLevel(level);
      setLevel(value[0]);
    }
  };

  const scalingEntries = talent.scaling.filter(
    (s) =>
      !s.key.toLowerCase().includes('energy') &&
      s.key.toLowerCase() !== 'cd' &&
      s.value.length > 1
  );

  return (
    <div className="space-y-4">
      {/* Level Slider */}
      <div className="flex items-center gap-4">
        <span className="text-sm text-muted-foreground shrink-0">Lv.</span>
        <Slider
          step={1}
          max={maxCount}
          min={1}
          onValueChange={handleChange}
          value={[level]}
          className="flex-1"
        />
        <span
          className="text-lg font-bold w-8 text-center"
          style={{ color: elementColor }}
        >
          {level}
        </span>
      </div>

      {/* Scaling Table */}
      <div className="rounded-lg border border-midnight-600/30 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-midnight-800/50 hover:bg-midnight-800/50">
              <TableHead className="text-starlight-300 font-semibold">
                Attribute
              </TableHead>
              <TableHead
                className="text-right font-semibold"
                style={{ color: elementColor }}
              >
                Value at Lv.{level}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {scalingEntries.map((s) => (
              <TableRow
                key={s.key}
                className="hover:bg-midnight-700/30 transition-colors"
              >
                <TableHead className="font-medium text-starlight-400 py-2">
                  {s.key}
                </TableHead>
                <TableCell className="text-right py-2">
                  <ScalingValueCell
                    values={s.value}
                    currentLevel={level}
                    prevLevel={prevLevel}
                    elementColor={elementColor}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

interface ScalingValueCellProps {
  values: string[];
  currentLevel: number;
  prevLevel: number;
  elementColor: string;
}

const ScalingValueCell: React.FC<ScalingValueCellProps> = ({
  values,
  currentLevel,
  prevLevel,
  elementColor,
}) => {
  const currentIndex = Math.min(currentLevel - 1, values.length - 1);
  const currentValue = values[currentIndex];

  const comparison = useMemo(
    () => getScalingComparison(values, currentLevel),
    [values, currentLevel]
  );

  const hasLevelChanged = currentLevel !== prevLevel;
  const shouldAnimate = hasLevelChanged && comparison.showComparison;

  return (
    <div className="flex flex-col items-end gap-1">
      {/* Main Value */}
      <span
        key={`value-${currentLevel}`}
        className={`font-mono text-foreground whitespace-pre-line ${
          shouldAnimate ? 'animate-value-change' : ''
        }`}
      >
        {currentValue}
      </span>

      {/* Percentage Badges */}
      {comparison.showComparison && (
        <div
          key={`badges-${currentLevel}`}
          className={`flex items-center gap-2 text-xs ${
            shouldAnimate ? 'animate-badges-in' : ''
          }`}
        >
          {/* From Previous Level */}
          {comparison.fromPreviousLevel !== 0 && (
            <span
              className="px-1.5 py-0.5 rounded bg-midnight-700/60 text-starlight-400"
              title={`Change from Lv.${currentLevel - 1}`}
            >
              {comparison.fromPreviousLevel > 0 ? '+' : ''}
              {comparison.fromPreviousLevel.toFixed(1)}%
            </span>
          )}

          {/* From First Level */}
          {comparison.fromFirstLevel !== 0 && (
            <span
              className="px-1.5 py-0.5 rounded font-medium"
              style={{
                backgroundColor: `${elementColor}20`,
                color: elementColor,
              }}
              title="Change from Lv.1"
            >
              ↑{comparison.fromFirstLevel.toFixed(1)}%
            </span>
          )}
        </div>
      )}
    </div>
  );
};
