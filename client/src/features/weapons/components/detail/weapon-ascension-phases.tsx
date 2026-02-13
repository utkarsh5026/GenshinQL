import { ArrowUp, TrendingUp } from 'lucide-react';
import React from 'react';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { ParsedSubstat } from '@/features/weapons/utils/substat-utils';

import type { WeaponAscensionPhaseStats } from '../../types';

interface WeaponPhaseTableProps {
  phases: WeaponAscensionPhaseStats[];
  currentPhase: number;
  rarity: string;
  substat: ParsedSubstat;
  handlePhaseChange: (prevPhase: number, currentPhase: number) => void;
}

export const WeaponPhaseTable: React.FC<WeaponPhaseTableProps> = ({
  phases,
  substat,
  currentPhase,
  rarity,
  handlePhaseChange,
}) => {
  return (
    <details className="group">
      <summary className="cursor-pointer text-xs font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2 mb-3 uppercase tracking-wider">
        <span className="group-open:rotate-90 transition-transform text-[10px]">
          &#9654;
        </span>
        All Phases
      </summary>

      <div className="rounded-lg border border-border/30 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/20 hover:bg-muted/20">
              <TableHead className="text-muted-foreground font-medium text-xs w-16">
                Phase
              </TableHead>
              <TableHead className="text-muted-foreground font-medium text-xs">
                Level
              </TableHead>
              <TableHead className="text-muted-foreground font-medium text-xs text-right">
                Base ATK
              </TableHead>
              <TableHead className="text-muted-foreground font-medium text-xs text-right">
                ATK Growth
              </TableHead>
              <TableHead className="text-muted-foreground font-medium text-xs text-right">
                {substat.type}
              </TableHead>
              <TableHead className="text-muted-foreground font-medium text-xs text-right">
                {substat.type} Growth
              </TableHead>
              <TableHead className="text-muted-foreground font-medium text-xs text-right">
                Mora
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {phases.map(
              (
                {
                  atkStats,
                  subStats,
                  phase,
                  levelRange,
                  baseAttack,
                  subStat,
                  mora,
                },
                idx
              ) => {
                return (
                  <TableRow
                    key={phase}
                    className={`transition-colors cursor-pointer ${
                      idx === currentPhase ? 'bg-muted/30' : 'hover:bg-muted/10'
                    }`}
                    onClick={() => {
                      handlePhaseChange(currentPhase, idx);
                    }}
                    style={
                      idx === currentPhase
                        ? { boxShadow: `inset 2px 0 0 ${rarity}50` }
                        : undefined
                    }
                  >
                    <TableCell className="font-medium text-foreground">
                      {phase}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {levelRange}
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm text-foreground">
                      {baseAttack.min} - {baseAttack.max}
                    </TableCell>
                    <TableCell className="text-right text-sm">
                      {idx > 0 ? (
                        <div className="flex flex-col items-end gap-0.5">
                          {atkStats.fromPreviousPhase > 0 && (
                            <span className="inline-flex items-center gap-1 text-xs text-emerald-500">
                              <ArrowUp className="w-3 h-3" />+
                              {atkStats.fromPreviousPhase.toFixed(1)}%
                            </span>
                          )}
                          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                            <TrendingUp className="w-3 h-3" />+
                            {atkStats.fromPhaseZero.toFixed(1)}%
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm text-foreground">
                      {subStat.min.toFixed(1)} - {subStat.max.toFixed(1)}
                    </TableCell>
                    <TableCell className="text-right text-sm">
                      {idx > 0 ? (
                        <div className="flex flex-col items-end gap-0.5">
                          {subStats.fromPreviousPhase > 0 && (
                            <span className="inline-flex items-center gap-1 text-xs text-emerald-500">
                              <ArrowUp className="w-3 h-3" />+
                              {subStats.fromPreviousPhase.toFixed(1)}%
                            </span>
                          )}
                          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                            <TrendingUp className="w-3 h-3" />+
                            {subStats.fromPhaseZero.toFixed(1)}%
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right text-sm text-muted-foreground">
                      {mora?.toLocaleString() || '-'}
                    </TableCell>
                  </TableRow>
                );
              }
            )}
          </TableBody>
        </Table>
      </div>
    </details>
  );
};

export const WeaponPhaseCardList: React.FC<WeaponPhaseTableProps> = ({
  phases,
  handlePhaseChange,
  currentPhase,
  rarity,
  substat,
}) => {
  return (
    <details className="group">
      <summary className="cursor-pointer text-xs font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2 mb-3 uppercase tracking-wider">
        <span className="group-open:rotate-90 transition-transform text-[10px]">
          &#9654;
        </span>
        All Phases
      </summary>

      <div className="space-y-2">
        {phases.map(
          (
            {
              atkStats,
              subStats,
              phase,
              subStat,
              levelRange,
              baseAttack,
              mora,
            },
            idx
          ) => {
            return (
              <div
                key={phase}
                onClick={() => {
                  handlePhaseChange(currentPhase, idx);
                }}
                className={`border rounded-lg p-3 space-y-1.5 cursor-pointer transition-all ${
                  idx === currentPhase
                    ? 'bg-muted/20 border-border/50'
                    : 'bg-transparent border-border/20 hover:border-border/40'
                }`}
                style={
                  idx === currentPhase
                    ? { boxShadow: `inset 2px 0 0 ${rarity}50` }
                    : undefined
                }
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Phase</span>
                  <span className="text-sm font-medium text-foreground">
                    {phase}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Level</span>
                  <span className="text-sm text-muted-foreground">
                    {levelRange}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    Base ATK
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-foreground">
                      {baseAttack.min} - {baseAttack.max}
                    </span>
                    {idx > 0 && (
                      <div className="flex items-center gap-1.5">
                        {atkStats.fromPreviousPhase > 0 && (
                          <span className="inline-flex items-center gap-0.5 text-[10px] text-emerald-500">
                            <ArrowUp className="w-2.5 h-2.5" />+
                            {atkStats.fromPreviousPhase.toFixed(1)}%
                          </span>
                        )}
                        <span className="inline-flex items-center gap-0.5 text-[10px] text-muted-foreground">
                          <TrendingUp className="w-2.5 h-2.5" />+
                          {atkStats.fromPhaseZero.toFixed(1)}%
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    {substat.type}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-foreground">
                      {subStat.min.toFixed(1)} - {subStat.max.toFixed(1)}
                    </span>
                    {idx > 0 && (
                      <div className="flex items-center gap-1.5">
                        {subStats.fromPreviousPhase > 0 && (
                          <span className="inline-flex items-center gap-0.5 text-[10px] text-emerald-500">
                            <ArrowUp className="w-2.5 h-2.5" />+
                            {subStats.fromPreviousPhase.toFixed(1)}%
                          </span>
                        )}
                        <span className="inline-flex items-center gap-0.5 text-[10px] text-muted-foreground">
                          <TrendingUp className="w-2.5 h-2.5" />+
                          {subStats.fromPhaseZero.toFixed(1)}%
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Mora</span>
                  <span className="text-sm text-muted-foreground">
                    {mora?.toLocaleString() || '-'}
                  </span>
                </div>
              </div>
            );
          }
        )}
      </div>
    </details>
  );
};
