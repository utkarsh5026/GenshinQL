import React from 'react';

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { CachedImage } from '@/components/utils';
import { AscensionPhase } from '@/types';

interface WeaponAscensionProps {
  phases: AscensionPhase[];
}

const WeaponAscension: React.FC<WeaponAscensionProps> = ({ phases }) => {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableCaption>Weapon Ascension Phases</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Phase</TableHead>
            <TableHead>Level Range</TableHead>
            <TableHead>Base ATK</TableHead>
            <TableHead>Sub Stat</TableHead>
            <TableHead>Mora</TableHead>
            <TableHead>Materials</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {phases.map((phase) => (
            <TableRow key={phase.phase}>
              <TableCell className="font-medium">{phase.phase}</TableCell>
              <TableCell>{phase.levelRange}</TableCell>
              <TableCell>
                {phase.baseAttack.min} - {phase.baseAttack.max}
              </TableCell>
              <TableCell>
                {phase.subStat.min.toFixed(1)} - {phase.subStat.max.toFixed(1)}
              </TableCell>
              <TableCell>{phase.mora?.toLocaleString() || '-'}</TableCell>
              <TableCell>
                {phase.materials ? (
                  <div className="flex gap-2 flex-wrap">
                    {phase.materials.map((mat, idx) => (
                      <div key={idx} className="flex flex-col items-center">
                        <CachedImage
                          src={mat.url}
                          alt={mat.caption}
                          className="w-10 h-10"
                        />
                        <span className="text-xs">×{mat.count}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  '-'
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default WeaponAscension;
