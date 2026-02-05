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
      {/* Mobile: Stacked Cards */}
      <div className="md:hidden space-y-3">
        <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3">
          Weapon Ascension Phases
        </h3>
        {phases.map((phase) => (
          <div
            key={phase.phase}
            className="bg-card border border-border rounded-lg p-3 space-y-2.5"
          >
            {/* Phase */}
            <div className="flex items-center justify-between pb-2 border-b border-border/50">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Phase
              </span>
              <span className="text-sm font-bold text-foreground">
                {phase.phase}
              </span>
            </div>

            {/* Level Range */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground">
                Level Range
              </span>
              <span className="text-sm text-foreground">
                {phase.levelRange}
              </span>
            </div>

            {/* Base ATK */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground">
                Base ATK
              </span>
              <span className="text-sm text-foreground">
                {phase.baseAttack.min} - {phase.baseAttack.max}
              </span>
            </div>

            {/* Sub Stat */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground">
                Sub Stat
              </span>
              <span className="text-sm text-foreground">
                {phase.subStat.min.toFixed(1)} - {phase.subStat.max.toFixed(1)}
              </span>
            </div>

            {/* Mora */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground">
                Mora
              </span>
              <span className="text-sm text-foreground">
                {phase.mora?.toLocaleString() || '-'}
              </span>
            </div>

            {/* Materials */}
            <div>
              <span className="text-xs font-semibold text-muted-foreground block mb-2">
                Materials
              </span>
              {phase.materials ? (
                <div className="flex gap-2 flex-wrap justify-center bg-background/30 rounded-lg p-2">
                  {phase.materials.map((mat, idx) => (
                    <div key={idx} className="flex flex-col items-center">
                      <CachedImage
                        src={mat.url}
                        alt={mat.caption}
                        className="w-10 h-10"
                      />
                      <span className="text-xs mt-0.5">×{mat.count}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <span className="text-sm text-muted-foreground">-</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Desktop: Traditional Table */}
      <div className="hidden md:block">
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
                  {phase.subStat.min.toFixed(1)} -{' '}
                  {phase.subStat.max.toFixed(1)}
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
    </div>
  );
};

export default WeaponAscension;
